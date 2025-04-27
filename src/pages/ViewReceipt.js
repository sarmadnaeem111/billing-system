import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Button, Row, Col, Table, Alert, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import { getReceiptById, formatCurrency, formatDate, formatTime } from '../utils/receiptUtils';

const ViewReceipt = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pdfRef = useRef();
  const navigate = useNavigate();
  const [receiptWidth, setReceiptWidth] = useState(100);
  const [showSizeControls, setShowSizeControls] = useState(false);

  useEffect(() => {
    // Create a non-async function for useEffect
    const fetchReceipt = () => {
      if (currentUser && id) {
        getReceiptById(id)
          .then(receiptData => {
            // Check if receipt belongs to current user
            if (receiptData.shopId !== currentUser.uid) {
              throw new Error('You do not have permission to view this receipt');
            }
            
            setReceipt(receiptData);
          })
          .catch(error => {
            setError('Failed to load receipt: ' + error.message);
            console.error('Error fetching receipt:', error);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    };

    fetchReceipt();
  }, [id, currentUser]);

  // Updated downloadPdf function to consider custom size
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
        pdf.save(`receipt-${receipt.transactionId}.pdf`);
      });
  };

  // Function to print the receipt
  const printReceipt = () => {
    const content = pdfRef.current;
    const originalContents = document.body.innerHTML;
    
    const printContent = document.createElement('div');
    printContent.innerHTML = content.innerHTML;
    printContent.style.width = '100%';
    
    document.body.innerHTML = printContent.innerHTML;
    
    window.print();
    
    document.body.innerHTML = originalContents;
    window.location.reload(); // Reload to restore the React app state
  };

  // Function to handle receipt width change
  const handleWidthChange = (e) => {
    setReceiptWidth(e.target.value);
  };

  if (loading) {
    return (
      <>
        <MainNavbar />
        <Container className="text-center mt-5">
          <p>Loading receipt...</p>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <MainNavbar />
        <Container className="mt-4">
          <Alert variant="danger">{error}</Alert>
          <Button 
            variant="primary" 
            onClick={() => navigate('/receipts')}
          >
            Back to Receipts
          </Button>
        </Container>
      </>
    );
  }

  if (!receipt) {
    return (
      <>
        <MainNavbar />
        <Container className="mt-4">
          <Alert variant="warning">Receipt not found</Alert>
          <Button 
            variant="primary" 
            onClick={() => navigate('/receipts')}
          >
            Back to Receipts
          </Button>
        </Container>
      </>
    );
  }

  return (
    <>
      <MainNavbar />
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Receipt Details</h2>
          <div>
            <Button 
              variant="primary" 
              onClick={downloadPdf} 
              className="me-2"
            >
              Download PDF
            </Button>
            
            <Button 
              variant="success" 
              onClick={printReceipt} 
              className="me-2"
            >
              Print Receipt
            </Button>
            
            <Button 
              variant="info" 
              onClick={() => setShowSizeControls(!showSizeControls)} 
              className="me-2"
            >
              {showSizeControls ? 'Hide Size Controls' : 'Adjust Size'}
            </Button>
            
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/receipts')}
            >
              Back to Receipts
            </Button>
          </div>
        </div>
        
        {showSizeControls && (
          <Card className="mb-3">
            <Card.Body>
              <Form>
                <Form.Group as={Row} className="align-items-center">
                  <Form.Label column sm={3}>Receipt Width (%): {receiptWidth}%</Form.Label>
                  <Col sm={7}>
                    <Form.Range 
                      value={receiptWidth}
                      onChange={handleWidthChange}
                      min={50}
                      max={150}
                      step={5}
                    />
                  </Col>
                  <Col sm={2}>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => setReceiptWidth(100)}
                    >
                      Reset to Default
                    </Button>
                  </Col>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        )}
        
        <div style={{ maxWidth: `${receiptWidth}%`, margin: '0 auto' }}>
          <Card>
            <Card.Body ref={pdfRef} className="p-4">
              <div className="receipt-container">
                <div className="text-center mb-4">
                  <h3>{receipt.shopDetails.name}</h3>
                  <p className="mb-0">{receipt.shopDetails.address}</p>
                  <p>Tel: {receipt.shopDetails.phone}</p>
                </div>
                
                <Row className="mb-3">
                  <Col sm={6}>
                    <p className="mb-1"><strong>Receipt #:</strong> {receipt.transactionId}</p>
                    <p className="mb-1"><strong>Date:</strong> {formatDate(receipt.timestamp)}</p>
                    <p className="mb-1"><strong>Time:</strong> {formatTime(receipt.timestamp)}</p>
                  </Col>
                  <Col sm={6}>
                    <p className="mb-1"><strong>Cashier:</strong> {receipt.cashierName}</p>
                    <p className="mb-1"><strong>Manager:</strong> {receipt.managerName || 'N/A'}</p>
                    <p className="mb-1"><strong>Payment Method:</strong> {receipt.paymentMethod}</p>
                  </Col>
                </Row>
                
                <hr />
                
                <Table borderless className="receipt-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th className="text-end">Price</th>
                      <th className="text-center">Qty</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipt.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td className="text-end">{formatCurrency(item.price)}</td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end">{formatCurrency(parseFloat(item.price) * parseInt(item.quantity))}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan="3" className="text-end">Total:</th>
                      <th className="text-end">{formatCurrency(receipt.totalAmount)}</th>
                    </tr>
                  </tfoot>
                </Table>
                
                <hr />
                
                <div className="text-center mt-4">
                  <p>Thank you for your business!</p>
                  <p className="small text-muted">Receipt ID: {receipt.id}</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

export default ViewReceipt; 
