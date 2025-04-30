import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, ListGroup } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';

const Settings = () => {
  const { currentUser, shopData, updateShopData } = useAuth();
  
  // Basic shop info
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  
  // Phone numbers
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  
  // Cashier and Manager names
  const [cashierNames, setCashierNames] = useState([]);
  const [newCashierName, setNewCashierName] = useState('');
  const [managerNames, setManagerNames] = useState([]);
  const [newManagerName, setNewManagerName] = useState('');
  
  // UI states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Load shop data
  useEffect(() => {
    if (shopData) {
      setShopName(shopData.shopName || '');
      setAddress(shopData.address || '');
      
      // Load phone numbers (convert from string if necessary)
      if (shopData.phoneNumbers && Array.isArray(shopData.phoneNumbers)) {
        setPhoneNumbers(shopData.phoneNumbers);
      } else if (shopData.phoneNumber) {
        setPhoneNumbers([shopData.phoneNumber]);
      } else {
        setPhoneNumbers([]);
      }
      
      // Load cashier and manager names
      setCashierNames(shopData.cashierNames || []);
      setManagerNames(shopData.managerNames || []);
    }
  }, [shopData]);
  
  // Handle adding a new phone number
  const handleAddPhoneNumber = () => {
    if (!newPhoneNumber.trim()) return;
    
    // Check if phone number already exists
    if (phoneNumbers.includes(newPhoneNumber.trim())) {
      setError('This phone number already exists.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setPhoneNumbers([...phoneNumbers, newPhoneNumber.trim()]);
    setNewPhoneNumber('');
  };
  
  // Handle removing a phone number
  const handleRemovePhoneNumber = (index) => {
    const newPhoneNumbers = [...phoneNumbers];
    newPhoneNumbers.splice(index, 1);
    setPhoneNumbers(newPhoneNumbers);
  };
  
  // Handle adding a new cashier name
  const handleAddCashierName = () => {
    if (!newCashierName.trim()) return;
    
    // Check if name already exists
    if (cashierNames.includes(newCashierName.trim())) {
      setError('This cashier name already exists.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setCashierNames([...cashierNames, newCashierName.trim()]);
    setNewCashierName('');
  };
  
  // Handle removing a cashier name
  const handleRemoveCashierName = (index) => {
    const newCashierNames = [...cashierNames];
    newCashierNames.splice(index, 1);
    setCashierNames(newCashierNames);
  };
  
  // Handle adding a new manager name
  const handleAddManagerName = () => {
    if (!newManagerName.trim()) return;
    
    // Check if name already exists
    if (managerNames.includes(newManagerName.trim())) {
      setError('This manager name already exists.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setManagerNames([...managerNames, newManagerName.trim()]);
    setNewManagerName('');
  };
  
  // Handle removing a manager name
  const handleRemoveManagerName = (index) => {
    const newManagerNames = [...managerNames];
    newManagerNames.splice(index, 1);
    setManagerNames(newManagerNames);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate shop name
    if (!shopName.trim()) {
      setError('Shop name is required.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    // Create updated shop data
    const updatedData = {
      shopName: shopName.trim(),
      address: address.trim(),
      phoneNumbers: phoneNumbers,
      phoneNumber: phoneNumbers[0] || '', // Keep the first phone as main for backward compatibility
      cashierNames: cashierNames,
      managerNames: managerNames,
      updatedAt: new Date().toISOString()
    };
    
    // Update shop data in Firestore
    updateShopData(updatedData)
      .then(() => {
        setSuccess('Settings updated successfully.');
        setTimeout(() => setSuccess(''), 5000);
      })
      .catch(error => {
        setError('Failed to update settings: ' + error.message);
        console.error('Error updating settings:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  return (
    <>
      <MainNavbar />
      <Container>
        <h2 className="mb-4">Shop Settings</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Card className="mb-4">
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <h4 className="mb-3">Basic Information</h4>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Shop Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="Enter shop name"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter shop address"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <h4 className="mb-3 mt-4">Phone Numbers</h4>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Add New Phone Number</Form.Label>
                    <div className="d-flex">
                      <Form.Control
                        type="text"
                        value={newPhoneNumber}
                        onChange={(e) => setNewPhoneNumber(e.target.value)}
                        placeholder="Enter phone number"
                        className="me-2"
                      />
                      <Button 
                        variant="outline-primary" 
                        onClick={handleAddPhoneNumber}
                      >
                        Add
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
              </Row>
              
              {phoneNumbers.length > 0 && (
                <ListGroup className="mb-4">
                  {phoneNumbers.map((phone, index) => (
                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                      {phone}
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleRemovePhoneNumber(index)}
                      >
                        Remove
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
              
              <h4 className="mb-3 mt-4">Staff Information</h4>
              
              <Row>
                <Col md={6}>
                  <h5 className="mb-2">Cashier Names</h5>
                  <Form.Group className="mb-3">
                    <div className="d-flex">
                      <Form.Control
                        type="text"
                        value={newCashierName}
                        onChange={(e) => setNewCashierName(e.target.value)}
                        placeholder="Enter cashier name"
                        className="me-2"
                      />
                      <Button 
                        variant="outline-primary" 
                        onClick={handleAddCashierName}
                      >
                        Add
                      </Button>
                    </div>
                  </Form.Group>
                  
                  {cashierNames.length > 0 && (
                    <ListGroup className="mb-4">
                      {cashierNames.map((name, index) => (
                        <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                          {name}
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleRemoveCashierName(index)}
                          >
                            Remove
                          </Button>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Col>
                
                <Col md={6}>
                  <h5 className="mb-2">Manager Names</h5>
                  <Form.Group className="mb-3">
                    <div className="d-flex">
                      <Form.Control
                        type="text"
                        value={newManagerName}
                        onChange={(e) => setNewManagerName(e.target.value)}
                        placeholder="Enter manager name"
                        className="me-2"
                      />
                      <Button 
                        variant="outline-primary" 
                        onClick={handleAddManagerName}
                      >
                        Add
                      </Button>
                    </div>
                  </Form.Group>
                  
                  {managerNames.length > 0 && (
                    <ListGroup className="mb-4">
                      {managerNames.map((name, index) => (
                        <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                          {name}
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleRemoveManagerName(index)}
                          >
                            Remove
                          </Button>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Col>
              </Row>
              
              <div className="d-flex mt-4">
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading}
                  className="me-2"
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default Settings; 
