import React, { useState, useRef, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, Table, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import BarcodeReader from 'react-barcode-reader';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import { calculateTotal, generateTransactionId, saveReceipt } from '../utils/receiptUtils';
import { getShopStock, updateStockQuantity } from '../utils/stockUtils';
import { Translate, TranslateData, useTranslatedData } from '../utils';

const NewReceipt = () => {
  const { currentUser, shopData } = useAuth();
  const [items, setItems] = useState([{ name: '', price: '', quantity: '1', costPrice: '0' }]);
  const [cashierName, setCashierName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [transactionId] = useState(generateTransactionId());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedReceiptId, setSavedReceiptId] = useState(null);
  const [stockItems, setStockItems] = useState([]);
  const [stockLoaded, setStockLoaded] = useState(false);
  const [scanSuccess, setScanSuccess] = useState('');
  const pdfRef = useRef();
  const navigate = useNavigate();

  // Translate shop data
  const translatedShopData = useTranslatedData(shopData);
  // Translate items data for the receipt
  const translatedItems = useTranslatedData(items);

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

  // Handle successful barcode scan
  const handleScan = (data) => {
    if (!data) return;
    
    setScanSuccess(<><Translate textKey="scanned" />{data}</>);
    
    // Clear scan success message after 3 seconds
    setTimeout(() => setScanSuccess(''), 3000);
    
    // Find item in inventory by SKU/barcode
    if (stockLoaded) {
      const matchingItem = stockItems.find(item => 
        item.sku && item.sku.toLowerCase() === data.toLowerCase());
      
      if (matchingItem) {
        // Check if item already exists in the receipt
        const existingItemIndex = items.findIndex(item => 
          item.name.toLowerCase() === matchingItem.name.toLowerCase());
        
        if (existingItemIndex >= 0) {
          // Increment quantity if item already exists
          const newItems = [...items];
          const currentQty = parseInt(newItems[existingItemIndex].quantity) || 0;
          newItems[existingItemIndex].quantity = (currentQty + 1).toString();
          setItems(newItems);
        } else {
          // Add as new item with cost price
          setItems([...items, { 
            name: matchingItem.name, 
            price: matchingItem.price.toString(), 
            quantity: '1',
            costPrice: matchingItem.costPrice ? matchingItem.costPrice.toString() : '0'
          }]);
        }
      } else {
        setError(
          <TranslateData 
            data={{
              message: "itemNotFound",
              barcode: data
            }}
          >
            {(translatedData) => (
              <>
                {translatedData.message.replace('{barcode}', translatedData.barcode)}
              </>
            )}
          </TranslateData>
        );
        // Clear error after 3 seconds
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  // Handle barcode scanning error
  const handleScanError = (err) => {
    console.error('Barcode scanning error:', err);
    setError(<Translate textKey="scanningError" />);
    // Clear error after 3 seconds
    setTimeout(() => setError(''), 3000);
  };

  // Handle item input change
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // If the name field is changed and we have stock data,
    // auto-populate both price and costPrice from inventory if available
    if (field === 'name' && stockLoaded) {
      const matchingItem = stockItems.find(stockItem => 
        stockItem.name.toLowerCase() === value.toLowerCase());
      
      if (matchingItem) {
        newItems[index].price = matchingItem.price.toString();
        // Store the cost price for profit calculation - ensure it's always stored
        newItems[index].costPrice = matchingItem.costPrice ? matchingItem.costPrice.toString() : '0';
        
        // Log the matched item and cost price (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.log('Found matching item:', matchingItem.name);
          console.log('Price:', matchingItem.price, 'Cost Price:', matchingItem.costPrice);
        }
      }
    }
    
    setItems(newItems);
  };

  // Add a new item row
  const addItem = () => {
    setItems([...items, { name: '', price: '', quantity: '1', costPrice: '0' }]);
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
          error: "itemNotInInventory"
        });
      } else if (matchingStock.quantity < parseInt(item.quantity)) {
        invalidItems.push({
          name: item.name,
          error: "insufficientQuantity",
          available: matchingStock.quantity
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
      setError(<Translate textKey="cashierRequired" />);
      setLoading(false);
      return;
    }
    
    // Validate items
    for (const item of items) {
      if (!item.name.trim() || !item.price || !item.quantity) {
        setError(<Translate textKey="itemDetailsRequired" />);
        setLoading(false);
        return;
      }
      if (isNaN(parseFloat(item.price)) || parseFloat(item.price) <= 0) {
        setError(<Translate textKey="invalidPrices" />);
        setLoading(false);
        return;
      }
      if (isNaN(parseInt(item.quantity)) || parseInt(item.quantity) <= 0) {
        setError(<Translate textKey="invalidQuantities" />);
        setLoading(false);
        return;
      }
    }
    
    // Validate inventory
    const inventoryValidation = validateInventory();
    if (!inventoryValidation.valid) {
      const errorMessages = inventoryValidation.invalidItems.map(item => {
        if (item.error === "insufficientQuantity") {
          return `${item.name}: ${item.error.replace('{available}', item.available)}`;
        }
        return `${item.name}: ${item.error}`;
      }).join(", ");
      
      setError(<><Translate textKey="inventoryError" />{errorMessages}</>);
      setLoading(false);
      return;
    }
    
    // Fetch cost prices for all items if not already added
    let processedItems = [...items];
    if (stockLoaded) {
      processedItems = items.map(item => {
        if (!item.costPrice) {
          const matchingItem = stockItems.find(stockItem => 
            stockItem.name.toLowerCase() === item.name.toLowerCase());
          
          if (matchingItem && matchingItem.costPrice) {
            return {
              ...item,
              costPrice: matchingItem.costPrice.toString()
            };
          }
        }
        return item;
      });
    }
    
    // Create receipt data
    const receiptData = {
      shopId: currentUser.uid,
      shopDetails: {
        name: shopData.shopName,
        address: shopData.address,
        phone: shopData.phoneNumber,
        logoUrl: shopData.logoUrl || ''
      },
      transactionId,
      cashierName: cashierName.trim(),
      managerName: managerName.trim(),
      items: processedItems,
      totalAmount: calculateTotal(processedItems),
      paymentMethod
    };
    
    // Save receipt to Firestore
    saveReceipt(receiptData)
      .then((receiptId) => {
        setSavedReceiptId(receiptId);
        setSuccess(<Translate textKey="receiptSaved" />);
        
        // Update inventory quantities
        return updateStockQuantity(currentUser.uid, processedItems.map(item => ({
          name: item.name,
          quantity: parseInt(item.quantity)
        })));
      })
      .catch(error => {
        setError(<><Translate textKey="errorSavingReceipt" /> {error.message}</>);
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
        <h2 className="mb-4"><Translate textKey="createNewReceipt" /></h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        {scanSuccess && <Alert variant="info">{scanSuccess}</Alert>}
        
        {/* Barcode Reader Component */}
        <BarcodeReader
          onError={handleScanError}
          onScan={handleScan}
        />
        
        <Row>
          <Col lg={7}>
            <Card className="mb-4">
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><Translate textKey="cashierName" /></Form.Label>
                        {shopData && shopData.cashierNames && shopData.cashierNames.length > 0 ? (
                          <Form.Select
                            value={cashierName}
                            onChange={(e) => setCashierName(e.target.value)}
                            required
                          >
                            <option value=""><Translate textKey="selectCashier" /></option>
                            {shopData.cashierNames.map((name, index) => (
                              <option key={index} value={name}>{name}</option>
                            ))}
                            <option value="custom"><Translate textKey="enterManually" /></option>
                          </Form.Select>
                        ) : (
                          <Form.Control
                            type="text"
                            required
                            value={cashierName}
                            onChange={(e) => setCashierName(e.target.value)}
                          />
                        )}
                        
                        {/* Show manual input if 'custom' is selected */}
                        {cashierName === 'custom' && (
                          <Form.Control
                            type="text"
                            className="mt-2"
                            placeholder={<Translate textKey="enterCashierName" />}
                            value=""
                            onChange={(e) => setCashierName(e.target.value)}
                            required
                          />
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><Translate textKey="managerName" /></Form.Label>
                        {shopData && shopData.managerNames && shopData.managerNames.length > 0 ? (
                          <Form.Select
                            value={managerName}
                            onChange={(e) => setManagerName(e.target.value)}
                          >
                            <option value=""><Translate textKey="selectManager" /></option>
                            {shopData.managerNames.map((name, index) => (
                              <option key={index} value={name}>{name}</option>
                            ))}
                            <option value="custom"><Translate textKey="enterManually" /></option>
                          </Form.Select>
                        ) : (
                          <Form.Control
                            type="text"
                            value={managerName}
                            onChange={(e) => setManagerName(e.target.value)}
                          />
                        )}
                        
                        {/* Show manual input if 'custom' is selected */}
                        {managerName === 'custom' && (
                          <Form.Control
                            type="text"
                            className="mt-2"
                            placeholder={<Translate textKey="enterManagerName" />}
                            value=""
                            onChange={(e) => setManagerName(e.target.value)}
                          />
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label><Translate textKey="paymentMethod" /></Form.Label>
                    <Form.Select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="Cash"><Translate textKey="cash" /></option>
                      <option value="Credit Card"><Translate textKey="creditCard" /></option>
                      <option value="Debit Card"><Translate textKey="debitCard" /></option>
                      <option value="Bank Transfer"><Translate textKey="bankTransfer" /></option>
                      <option value="Mobile Payment"><Translate textKey="mobilePayment" /></option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label><Translate textKey="transactionId" /></Form.Label>
                    <Form.Control
                      type="text"
                      value={transactionId}
                      readOnly
                    />
                  </Form.Group>
                  
                  <Card className="mb-3">
                    <Card.Body className="pb-0">
                      <Card.Title className="mb-3"><Translate textKey="barcodeScanner" /></Card.Title>
                      <p className="text-muted mb-3">
                        <Translate textKey="barcodeScannerHelp" />
                      </p>
                    </Card.Body>
                  </Card>
                  
                  <h5 className="mt-4 mb-3"><Translate textKey="items" /></h5>
                  
                  {items.map((item, index) => (
                    <Row key={index} className="mb-3 align-items-end">
                      <Col sm={5}>
                        <Form.Group>
                          <Form.Label><Translate textKey="itemName" /></Form.Label>
                          <Form.Control
                            type="text"
                            required
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            list={`itemSuggestions-${index}`}
                          />
                          <datalist id={`itemSuggestions-${index}`}>
                            {itemSuggestions.map((suggestion, i) => (
                              <option key={i} value={suggestion} />
                            ))}
                          </datalist>
                        </Form.Group>
                      </Col>
                      <Col sm={3}>
                        <Form.Group>
                          <Form.Label><Translate textKey="price" /></Form.Label>
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
                      <Col sm={2}>
                        <Form.Group>
                          <Form.Label><Translate textKey="qty" /></Form.Label>
                          <Form.Control
                            type="number"
                            min="1"
                            required
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col sm={2} className="d-flex justify-content-end">
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          onClick={() => removeItem(index)}
                          disabled={items.length <= 1}
                          className="mt-1"
                        >
                          <Translate textKey="remove" />
                        </Button>
                      </Col>
                    </Row>
                  ))}
                  
                  <Button 
                    variant="outline-primary" 
                    className="mb-4" 
                    onClick={addItem}
                  >
                    <Translate textKey="addItem" />
                  </Button>
                  
                  <div className="d-flex mt-4">
                    <Button 
                      variant="success" 
                      type="submit" 
                      disabled={loading || savedReceiptId}
                      className="me-2"
                    >
                      <Translate textKey="generateReceipt" />
                    </Button>
                    
                    {savedReceiptId && (
                      <>
                        <Button 
                          variant="primary" 
                          onClick={downloadPdf} 
                          className="me-2"
                        >
                          <Translate textKey="downloadPDF" />
                        </Button>
                        
                        <Button 
                          variant="outline-secondary" 
                          onClick={() => navigate(`/receipt/${savedReceiptId}`)}
                        >
                          <Translate textKey="viewReceipt" />
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
                    {translatedShopData?.logoUrl && (
                      <div className="mb-3" style={{ maxWidth: '150px', margin: '0 auto' }}>
                        <img 
                          src={translatedShopData.logoUrl} 
                          alt={translatedShopData?.shopName || 'Shop Logo'} 
                          style={{ maxWidth: '100%', maxHeight: '100px' }}
                        />
                      </div>
                    )}
                    <h3>{translatedShopData?.shopName || 'Shop Name'}</h3>
                    <p className="mb-0">{translatedShopData?.address || 'Shop Address'}</p>
                    <p>
                      Tel: {translatedShopData?.phoneNumbers ? 
                        translatedShopData.phoneNumbers[0] : 
                        (translatedShopData?.phoneNumber || 'Phone Number')}
                    </p>
                  </div>
                  
                  <Row className="mb-3">
                    <Col xs={6}>
                      <p className="mb-1"><strong><Translate textKey="receiptNumber" /></strong> {transactionId}</p>
                      <p className="mb-1"><strong><Translate textKey="date" /></strong> {new Date().toLocaleDateString()}</p>
                      <p className="mb-1"><strong><Translate textKey="time" /></strong> {new Date().toLocaleTimeString()}</p>
                    </Col>
                    <Col xs={6}>
                      <p className="mb-1"><strong><Translate textKey="cashier" /></strong> {cashierName || 'N/A'}</p>
                      <p className="mb-1"><strong><Translate textKey="manager" /></strong> {managerName || 'N/A'}</p>
                      <p className="mb-1"><strong><Translate textKey="payment" /></strong> {paymentMethod}</p>
                    </Col>
                  </Row>
                  
                  <hr />
                  
                  <Table borderless className="receipt-table">
                    <thead>
                      <tr>
                        <th><Translate textKey="itemName" /></th>
                        <th className="text-end"><Translate textKey="price" /></th>
                        <th className="text-center"><Translate textKey="qty" /></th>
                        <th className="text-end"><Translate textKey="total" /></th>
                      </tr>
                    </thead>
                    <tbody>
                      {translatedItems.map((item, index) => (
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
                        <th colSpan="3" className="text-end"><Translate textKey="total" /></th>
                        <th className="text-end">${calculateTotal(items)}</th>
                      </tr>
                    </tfoot>
                  </Table>
                  
                  <hr />
                  
                  <div className="text-center mt-4">
                    <p><Translate textKey="thankYou" /></p>
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
