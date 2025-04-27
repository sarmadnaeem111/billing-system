import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Card, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import { formatCurrency, formatDate } from '../utils/receiptUtils';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import './ViewReceipts.css'; // Import the custom CSS

const ViewReceipts = () => {
  const { currentUser } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [dateFilter, setDateFilter] = useState('');
  const navigate = useNavigate();

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
  const filteredReceipts = receipts
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

  return (
    <>
      <MainNavbar />
      <Container>
        <h2 className="mb-4">All Receipts</h2>
        
        <Card className="mb-4">
          <Card.Body>
            <Row>
              <Col md={6} lg={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Search Receipts</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Search by ID, cashier, or items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => setSearchTerm('')}
                      >
                        Clear
                      </Button>
                    )}
                  </InputGroup>
                </Form.Group>
              </Col>
              
              <Col md={6} lg={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Filter by Date</Form.Label>
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
                        Clear
                      </Button>
                    )}
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        
        {loading ? (
          <p className="text-center">Loading receipts...</p>
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
                          Date 
                          {sortField === 'timestamp' && (
                            <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                          )}
                        </th>
                        <th>Transaction ID</th>
                        <th>Cashier</th>
                        <th className="item-column">Items</th>
                        <th 
                          className="cursor-pointer" 
                          onClick={() => handleSort('totalAmount')}
                        >
                          Total Amount
                          {sortField === 'totalAmount' && (
                            <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                          )}
                        </th>
                        <th>Payment</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReceipts.map(receipt => (
                        <tr key={receipt.id}>
                          <td data-label="Date">{formatDate(receipt.timestamp)}</td>
                          <td data-label="ID" className="text-nowrap">{receipt.transactionId}</td>
                          <td data-label="Cashier">{receipt.cashierName}</td>
                          <td data-label="Items" className="item-column">
                            <div className="item-cell-content">
                              {receipt.items.map(item => item.name).join(', ')}
                            </div>
                          </td>
                          <td data-label="Amount">{formatCurrency(receipt.totalAmount)}</td>
                          <td data-label="Payment">{receipt.paymentMethod}</td>
                          <td data-label="Action">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleViewReceipt(receipt.id)}
                            >
                              View
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
                    ? 'No receipts match your search criteria.'
                    : 'No receipts found. Start by creating a new receipt.'}
                </p>
              )}
              
              <div className="mt-3">
                <Button 
                  variant="success" 
                  onClick={() => navigate('/new-receipt')}
                >
                  Create New Receipt
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