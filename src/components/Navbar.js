import React from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MainNavbar = () => {
  const { currentUser, logout, shopData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout()
      .then(() => {
        navigate('/login');
      })
      .catch(error => {
        console.error('Failed to log out', error);
      });
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard">
          {shopData ? shopData.shopName : 'Shop Billing System'}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {currentUser && (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/new-receipt">New Receipt</Nav.Link>
                <Nav.Link as={Link} to="/receipts">Receipts</Nav.Link>
                <Nav.Link as={Link} to="/stock">Inventory</Nav.Link>
                
                {/* Employee Management Dropdown */}
                <NavDropdown title="Employees" id="employee-nav-dropdown">
                  <NavDropdown.Item as={Link} to="/employees">View Employees</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/add-employee">Add Employee</NavDropdown.Item>
                </NavDropdown>
                
                {/* Attendance Management Dropdown */}
                <NavDropdown title="Attendance" id="attendance-nav-dropdown">
                  <NavDropdown.Item as={Link} to="/attendance">View Attendance</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/mark-attendance">Mark Attendance</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/attendance-report">Attendance Report</NavDropdown.Item>
                </NavDropdown>
                
                {/* Settings */}
                <Nav.Link as={Link} to="/settings">Settings</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {currentUser ? (
              <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MainNavbar; 
