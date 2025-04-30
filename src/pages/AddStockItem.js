import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import { addStockItem as addStockItemToFirestore } from '../utils/stockUtils';

const AddStockItem = () => {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [sku, setSku] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    setError('');
    setLoading(true);
    
    // Validation
    if (!name.trim()) {
      setError('Item name is required');
      setLoading(false);
      return;
    }
    
    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      setError('Price must be a valid number');
      setLoading(false);
      return;
    }
    
    if (isNaN(parseInt(quantity)) || parseInt(quantity) < 0) {
      setError('Quantity must be a valid number');
      setLoading(false);
      return;
    }
    
    if (costPrice && (isNaN(parseFloat(costPrice)) || parseFloat(costPrice) < 0)) {
      setError('Cost price must be a valid number');
      setLoading(false);
      return;
    }
    
    // Create stock item data
    const itemData = {
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      price: parseFloat(price),
      quantity: parseInt(quantity),
      costPrice: costPrice ? parseFloat(costPrice) : null,
      supplier: supplier.trim(),
      sku: sku.trim()
    };
    
    // Save to Firestore
    addStockItemToFirestore(currentUser.uid, itemData)
      .then(() => {
        navigate('/stock');
      })
      .catch(error => {
        setError('Failed to add stock item: ' + error.message);
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <MainNavbar />
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Add New Stock Item</h2>
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/stock')}
          >
            Back to Inventory
          </Button>
        </div>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Card>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Item Name*</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Control
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Electronics, Groceries, etc."
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product details, specifications, etc."
                />
              </Form.Group>
              
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Selling Price ($)*</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cost Price ($)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      placeholder="Optional"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Quantity*</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Supplier</Form.Label>
                    <Form.Control
                      type="text"
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      placeholder="Optional"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>SKU/Barcode</Form.Label>
                    <Form.Control
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="Optional"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-flex mt-4">
                <Button 
                  variant="success" 
                  type="submit" 
                  disabled={loading}
                  className="me-2"
                >
                  Add Item
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => navigate('/stock')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default AddStockItem; 
