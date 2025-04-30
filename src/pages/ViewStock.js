import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Card, Form, InputGroup, Row, Col, Badge, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import { getShopStock, deleteStockItem } from '../utils/stockUtils';
import './ViewStock.css'; // Import the custom CSS

const ViewStock = () => {
  const { currentUser } = useAuth();
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchStock = useCallback(() => {
    if (!currentUser) return;
    
    setLoading(true);
    
    // Create a simple function to fetch stock items
    getShopStock(currentUser.uid)
      .then(stockData => {
        console.log('Stock data fetched:', stockData);
        setStockItems(stockData);
      })
      .catch(error => {
        console.error('Error fetching stock items:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUser]);

  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    fetchStock();
  }, [fetchStock, currentUser, navigate]);

  // Get unique categories for filter dropdown
  const categories = [...new Set(stockItems.map(item => item.category))].filter(Boolean);

  // Handle search and filtering
  const filteredItems = stockItems
    .filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Handle client-side sorting
      let comparison = 0;
      
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'price') {
        comparison = parseFloat(a.price) - parseFloat(b.price);
      } else if (sortField === 'quantity') {
        comparison = parseFloat(a.quantity) - parseFloat(b.quantity);
      } else if (sortField === 'updatedAt') {
        comparison = new Date(a.updatedAt) - new Date(b.updatedAt);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Handle sorting
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Open delete confirmation modal
  const confirmDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  // Delete stock item
  const handleDelete = () => {
    if (!itemToDelete) return;
    
    deleteStockItem(itemToDelete.id)
      .then(() => {
        fetchStock(); // Refresh the list
        setShowDeleteModal(false);
        setItemToDelete(null);
      })
      .catch(error => {
        console.error('Error deleting stock item:', error);
      });
  };

  // Determine badge color based on quantity
  const getQuantityBadgeVariant = (quantity) => {
    if (quantity <= 0) return 'danger';
    if (quantity <= 10) return 'warning';
    return 'success';
  };

  return (
    <>
      <MainNavbar />
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Stock Inventory</h2>
          <Button 
            variant="success" 
            onClick={() => navigate('/add-stock')}
          >
            Add New Item
          </Button>
        </div>
        
        <Card className="mb-4">
          <Card.Body>
            <Row>
              <Col md={6} lg={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Search Items</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Search by name, description..."
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
                  <Form.Label>Filter by Category</Form.Label>
                  <Form.Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        
        {loading ? (
          <p className="text-center">Loading stock items...</p>
        ) : (
          <Card>
            <Card.Body>
              {filteredItems.length > 0 ? (
                <div className="table-responsive stock-table-container">
                  <Table hover responsive="sm" className="stock-table">
                    <thead>
                      <tr>
                        <th 
                          className="cursor-pointer" 
                          onClick={() => handleSort('name')}
                        >
                          Item Name
                          {sortField === 'name' && (
                            <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                          )}
                        </th>
                        <th className="description-column">Description</th>
                        <th>Category</th>
                        <th 
                          className="cursor-pointer"
                          onClick={() => handleSort('price')}
                        >
                          Price ($)
                          {sortField === 'price' && (
                            <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                          )}
                        </th>
                        <th 
                          className="cursor-pointer"
                          onClick={() => handleSort('quantity')}
                        >
                          Quantity
                          {sortField === 'quantity' && (
                            <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                          )}
                        </th>
                        <th 
                          className="cursor-pointer"
                          onClick={() => handleSort('updatedAt')}
                        >
                          Last Updated
                          {sortField === 'updatedAt' && (
                            <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                          )}
                        </th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map(item => (
                        <tr key={item.id}>
                          <td data-label="Item Name" className="text-nowrap">{item.name}</td>
                          <td data-label="Description" className="description-column">
                            <div className="description-cell-content">
                              {item.description || '-'}
                            </div>
                          </td>
                          <td data-label="Category">{item.category || '-'}</td>
                          <td data-label="Price">${parseFloat(item.price).toFixed(2)}</td>
                          <td data-label="Quantity">
                            <Badge bg={getQuantityBadgeVariant(item.quantity)}>
                              {item.quantity}
                            </Badge>
                          </td>
                          <td data-label="Last Updated">{new Date(item.updatedAt).toLocaleDateString()}</td>
                          <td data-label="Actions">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              className="me-2 mb-1"
                              onClick={() => navigate(`/edit-stock/${item.id}`)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              className="mb-1"
                              onClick={() => confirmDelete(item)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <h5>No stock items found</h5>
                  <p className="text-muted">
                    {searchTerm || categoryFilter 
                      ? "No items match your search criteria. Try adjusting your filters."
                      : "You haven't added any stock items yet. Click 'Add New Item' to get started."}
                  </p>
                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/add-stock')}
                    className="mt-2"
                  >
                    Add Your First Item
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        )}
        
        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete <strong>{itemToDelete?.name}</strong>? This action cannot be undone.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Item
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default ViewStock; 
