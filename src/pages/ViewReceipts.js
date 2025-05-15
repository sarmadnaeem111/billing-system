import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Card, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import { formatCurrency, formatDate } from '../utils/receiptUtils';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import './ViewReceipts.css'; // Import the custom CSS
import { Translate, useTranslatedData, useTranslatedAttribute } from '../utils';

const ViewReceipts = () => {
  const { currentUser } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [dateFilter, setDateFilter] = useState('');
  const navigate = useNavigate();

  // Translate receipts data
  const translatedReceipts = useTranslatedData(receipts);
  // Get translations for attributes
  const getTranslatedAttr = useTranslatedAttribute();

  useEffect(() => {
    // Convert to non-async function
    const fetchReceipts = () => {
      if (!currentUser) return;
      
      // Create a simple query without ordering
      const receiptRef = collection(db, 'receipts');
      const receiptQuery = query(
        receiptRef,
        where('shopId', '==', currentUser.uid)
      );
      
      getDocs(receiptQuery)
        .then(querySnapshot => {
          // Get all receipts and handle sorting client-side
          const receiptsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setReceipts(receiptsData);
        })
        .catch(error => {
          console.error('Error fetching receipts:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    fetchReceipts();
  }, [currentUser]);

  // Handle search and filtering
  const filteredReceipts = translatedReceipts
    .filter(receipt => {
      const matchesSearch = 
        receipt.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.cashierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDate = dateFilter 
        ? new Date(receipt.timestamp).toLocaleDateString() === new Date(dateFilter).toLocaleDateString()
        : true;
      
      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      // Handle client-side sorting
      let comparison = 0;
      if (sortField === 'timestamp') {
        comparison = new Date(a.timestamp) - new Date(b.timestamp);
      } else if (sortField === 'totalAmount') {
        comparison = parseFloat(a.totalAmount) - parseFloat(b.totalAmount);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Handle sorting
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Handle view receipt
  const handleViewReceipt = (receiptId) => {
    navigate(`/receipt/${receiptId}`);
  };

  // Function to translate payment method
  const getTranslatedPaymentMethod = (method) => {
    // Common payment methods to translate
    switch(method) {
      case 'Cash':
        return <Translate textKey="cash" />;
      case 'Credit Card':
        return <Translate textKey="creditCard" />;
      case 'Debit Card':
        return <Translate textKey="debitCard" />;
      case 'Bank Transfer':
        return <Translate textKey="bankTransfer" />;
      case 'Mobile Payment':
        return <Translate textKey="mobilePayment" />;
      default:
        return method;
    }
  };

  return (
    <>
      <MainNavbar />
      <Container>
        <h2 className="mb-4"><Translate textKey="allReceipts" /></h2>
        
        <Card className="mb-4">
          <Card.Body>
            <Row>
              <Col md={6} lg={4}>
                <Form.Group className="mb-3">
                  <Form.Label><Translate textKey="searchReceipts" /></Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder={getTranslatedAttr("searchPlaceholder")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => setSearchTerm('')}
                      >
                        <Translate textKey="clear" />
                      </Button>
                    )}
                  </InputGroup>
                </Form.Group>
              </Col>
              
              <Col md={6} lg={4}>
                <Form.Group className="mb-3">
                  <Form.Label><Translate textKey="filterByDate" /></Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                    {dateFilter && (
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => setDateFilter('')}
                      >
                        <Translate textKey="clear" />
                      </Button>
                    )}
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        
        {loading ? (
          <p className="text-center"><Translate textKey="loadingReceipts" /></p>
        ) : (
          <Card>
            <Card.Body>
              {filteredReceipts.length > 0 ? (
                <div className="table-responsive receipt-table-container">
                  <Table hover responsive="sm" className="receipts-table">
                    <thead>
                      <tr>
                        <th 
                          className="cursor-pointer" 
                          onClick={() => handleSort('timestamp')}
                        >
                          <Translate textKey="date" />
                          {sortField === 'timestamp' && (
                            <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                          )}
                        </th>
                        <th><Translate textKey="transactionId" /></th>
                        <th><Translate textKey="cashier" /></th>
                        <th className="item-column"><Translate textKey="items" /></th>
                        <th 
                          className="cursor-pointer" 
                          onClick={() => handleSort('totalAmount')}
                        >
                          <Translate textKey="totalAmount" />
                          {sortField === 'totalAmount' && (
                            <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                          )}
                        </th>
                        <th><Translate textKey="payment" /></th>
                        <th><Translate textKey="action" /></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReceipts.map(receipt => (
                        <tr key={receipt.id}>
                          <td data-label={getTranslatedAttr("date")}>{formatDate(receipt.timestamp)}</td>
                          <td data-label={getTranslatedAttr("transactionId")} className="text-nowrap">{receipt.transactionId}</td>
                          <td data-label={getTranslatedAttr("cashier")}>{receipt.cashierName}</td>
                          <td data-label={getTranslatedAttr("items")} className="item-column">
                            <div className="item-cell-content">
                              {receipt.items.map(item => item.name).join(', ')}
                            </div>
                          </td>
                          <td data-label={getTranslatedAttr("totalAmount")}>{formatCurrency(receipt.totalAmount)}</td>
                          <td data-label={getTranslatedAttr("payment")}>{getTranslatedPaymentMethod(receipt.paymentMethod)}</td>
                          <td data-label={getTranslatedAttr("action")}>
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleViewReceipt(receipt.id)}
                            >
                              <Translate textKey="view" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p className="text-center">
                  {receipts.length > 0 
                    ? <Translate textKey="noReceiptsMatch" />
                    : <Translate textKey="noReceiptsFound" />}
                </p>
              )}
              
              <div className="mt-3">
                <Button 
                  variant="success" 
                  onClick={() => navigate('/new-receipt')}
                >
                  <Translate textKey="createNewReceipt" />
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}
      </Container>
    </>
  );
};

export default ViewReceipts; 
