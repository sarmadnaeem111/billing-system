import React, { useState, useRef, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, Table, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import { calculateTotal, generateTransactionId, saveReceipt } from '../utils/receiptUtils';
import { getShopStock, updateStockQuantity } from '../utils/stockUtils';

const NewReceipt = () => {
  const { currentUser, shopData } = useAuth();
  const [items, setItems] = useState([{ name: '', price: '', quantity: '1' }]);
  const [cashierName, setCashierName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [transactionId, setTransactionId] = useState(generateTransactionId());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedReceiptId, setSavedReceiptId] = useState(null);
  const [stockItems, setStockItems] = useState([]);
  const [stockLoaded, setStockLoaded] = useState(false);
  const pdfRef = useRef();
  const navigate = useNavigate();

  // Fetch stock items for autocomplete and inventory check
  useEffect(() => {
    if (currentUser) {
      getShopStock(currentUser.uid)
        .then(items => {
          setStockItems(items);
          setStockLoaded(true);
        })
        .catch(error => {
          console.error('Error loading inventory items:', error);
        });
    }
  }, [currentUser]);

  // Handle item input change
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // If the name field is changed and we have stock data,
    // auto-populate the price from inventory if available
    if (field === 'name' && stockLoaded) {
      const matchingItem = stockItems.find(stockItem => 
        stockItem.name.toLowerCase() === value.toLowerCase());
      
      if (matchingItem) {
        newItems[index].price = matchingItem.price.toString();
      }
    }
    
    setItems(newItems);
  };

  // Add a new item row
  const addItem = () => {
    setItems([...items, { name: '', price: '', quantity: '1' }]);
  };

  // Remove an item row
  const removeItem = (index) => {
    if (items.length <= 1) return;
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  // Function to generate and download PDF
  const downloadPdf = () => {
    const input = pdfRef.current;
    html2canvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 30;

        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save(`receipt-${transactionId}.pdf`);
      });
  };

  // Check if items exist in inventory and have sufficient quantity
  const validateInventory = () => {
    if (!stockLoaded) return { valid: true }; // Skip validation if stock not loaded
    
    const invalidItems = [];
    
    for (const item of items) {
      const matchingStock = stockItems.find(stockItem => 
        stockItem.name.toLowerCase() === item.name.toLowerCase());
      
      if (!matchingStock) {
        invalidItems.push({
          name: item.name,
          error: "Item not found in inventory"
        });
      } else if (matchingStock.quantity < parseInt(item.quantity)) {
        invalidItems.push({
          name: item.name,
          error: `Insufficient quantity (Available: ${matchingStock.quantity})`
        });
      }
    }
    
    if (invalidItems.length > 0) {
      return {
        valid: false,
        invalidItems
      };
    }
    
    return { valid: true };
  };

  // Handle form submission - converted from async to use promises
  const handleSubmit = (e) => {
    e.preventDefault();
    
    setError('');
    setLoading(true);
    
    // Validate required fields
    if (!cashierName.trim()) {
      setError('Cashier name is required');
      setLoading(false);
      return;
    }
    
    // Validate items
    for (const item of items) {
      if (!item.name.trim() || !item.price || !item.quantity) {
        setError('All item details are required');
        setLoading(false);
        return;
      }
      if (isNaN(parseFloat(item.price)) || parseFloat(item.price) <= 0) {
        setError('Item prices must be valid numbers greater than 0');
        setLoading(false);
        return;
      }
      if (isNaN(parseInt(item.quantity)) || parseInt(item.quantity) <= 0) {
        setError('Item quantities must be valid numbers greater than 0');
        setLoading(false);
        return;
      }
    }
    
    // Validate inventory
    const inventoryValidation = validateInventory();
    if (!inventoryValidation.valid) {
      const errorMessages = inventoryValidation.invalidItems.map(item => 
        `${item.name}: ${item.error}`
      ).join(", ");
      
      setError(`Inventory error: ${errorMessages}`);
      setLoading(false);
      return;
    }
    
    // Create receipt data
    const receiptData = {
      shopId: currentUser.uid,
      shopDetails: {
        name: shopData.shopName,
        address: shopData.address,
        phone: shopData.phoneNumber
      },
      cashierName,
      managerName,
      items,
      paymentMethod,
      transactionId,
      totalAmount: calculateTotal(items),
      timestamp: new Date().toISOString()
    };
    
    // Save receipt to Firestore
    saveReceipt(receiptData)
      .then(receiptId => {
        // Update inventory quantities
        return updateStockQuantity(currentUser.uid, items)
          .then(() => receiptId);
      })
      .then(receiptId => {
        setSavedReceiptId(receiptId);
        setSuccess('Receipt created successfully and inventory updated!');
      })
      .catch(error => {
        setError('Failed to create receipt: ' + error.message);
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Get suggestion list from inventory for item names
  const getItemSuggestions = () => {
    if (!stockLoaded) return [];
    return stockItems.map(item => item.name);
  };

  const itemSuggestions = getItemSuggestions();

  return (
    <>
      <MainNavbar />
      <Container>
        <h2 className="mb-4">Create New Receipt</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Row>
          <Col lg={7}>
            <Card className="mb-4">
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Cashier Name</Form.Label>
                        <Form.Control
                          type="text"
                          required
                          value={cashierName}
                          onChange={(e) => setCashierName(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Manager Name (Optional)</Form.Label>
                        <Form.Control
                          type="text"
                          value={managerName}
                          onChange={(e) => setManagerName(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Payment Method</Form.Label>
                    <Form.Select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Mobile Payment">Mobile Payment</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Transaction ID</Form.Label>
                    <Form.Control
                      type="text"
                      value={transactionId}
                      readOnly
                    />
                  </Form.Group>
                  
                  <h5 className="mt-4 mb-3">Items</h5>
                  
                  {items.map((item, index) => (
                    <Row key={index} className="mb-3 align-items-end">
                      <Col md={5}>
                        <Form.Group>
                          <Form.Label>Item Name</Form.Label>
                          <Form.Control
                            type="text"
                            required
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            list={`itemOptions-${index}`}
                          />
                          <datalist id={`itemOptions-${index}`}>
                            {itemSuggestions.map((suggestion, i) => (
                              <option key={i} value={suggestion} />
                            ))}
                          </datalist>
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>Price ($)</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label>Qty</Form.Label>
                          <Form.Control
                            type="number"
                            min="1"
                            required
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2} className="d-flex">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="ms-auto"
                          disabled={items.length <= 1}
                        >
                          Remove
                        </Button>
                      </Col>
                    </Row>
                  ))}
                  
                  <div className="mb-4">
                    <Button variant="outline-primary" onClick={addItem} size="sm">
                      + Add Item
                    </Button>
                  </div>
                  
                  <div className="d-flex mt-4">
                    <Button 
                      variant="success" 
                      type="submit" 
                      disabled={loading || savedReceiptId}
                      className="me-2"
                    >
                      Generate Receipt
                    </Button>
                    
                    {savedReceiptId && (
                      <>
                        <Button 
                          variant="primary" 
                          onClick={downloadPdf} 
                          className="me-2"
                        >
                          Download PDF
                        </Button>
                        
                        <Button 
                          variant="outline-secondary" 
                          onClick={() => navigate(`/receipt/${savedReceiptId}`)}
                        >
                          View Receipt
                        </Button>
                      </>
                    )}
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={5}>
            <Card>
              <Card.Body ref={pdfRef} className="p-4">
                <div className="receipt-preview">
                  <div className="text-center mb-4">
                    <h3>{shopData?.shopName || 'Shop Name'}</h3>
                    <p className="mb-0">{shopData?.address || 'Shop Address'}</p>
                    <p>Tel: {shopData?.phoneNumber || 'Phone Number'}</p>
                  </div>
                  
                  <Row className="mb-3">
                    <Col xs={6}>
                      <p className="mb-1"><strong>Receipt #:</strong> {transactionId}</p>
                      <p className="mb-1"><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                      <p className="mb-1"><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
                    </Col>
                    <Col xs={6}>
                      <p className="mb-1"><strong>Cashier:</strong> {cashierName || 'N/A'}</p>
                      <p className="mb-1"><strong>Manager:</strong> {managerName || 'N/A'}</p>
                      <p className="mb-1"><strong>Payment:</strong> {paymentMethod}</p>
                    </Col>
                  </Row>
                  
                  <hr />
                  
                  <Table borderless size="sm" className="receipt-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th className="text-end">Price</th>
                        <th className="text-center">Qty</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name || 'Item Name'}</td>
                          <td className="text-end">${parseFloat(item.price || 0).toFixed(2)}</td>
                          <td className="text-center">{item.quantity || 1}</td>
                          <td className="text-end">${(parseFloat(item.price || 0) * parseInt(item.quantity || 1)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th colSpan="3" className="text-end">Total:</th>
                        <th className="text-end">${calculateTotal(items)}</th>
                      </tr>
                    </tfoot>
                  </Table>
                  
                  <hr />
                  
                  <div className="text-center mt-4">
                    <p>Thank you for your business!</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default NewReceipt; 