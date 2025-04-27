import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import './Employees.css'; // Import the custom CSS

const Employees = () => {
  const { currentUser } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const employeesRef = collection(db, 'employees');
        const employeesQuery = query(
          employeesRef,
          where('shopId', '==', currentUser.uid)
        );

        const snapshot = await getDocs(employeesQuery);
        const employeesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setEmployees(employeesList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employees. Please try again.');
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [currentUser]);

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteDoc(doc(db, 'employees', employeeId));
        setEmployees(employees.filter(emp => emp.id !== employeeId));
      } catch (err) {
        console.error('Error deleting employee:', err);
        setError('Failed to delete employee. Please try again.');
      }
    }
  };

  return (
    <>
      <MainNavbar />
      <Container>
        <Row className="mb-4">
          <Col>
            <h2>Employees</h2>
          </Col>
          <Col className="text-end">
            <Button 
              variant="success" 
              onClick={() => navigate('/add-employee')}
            >
              Add New Employee
            </Button>
          </Col>
        </Row>

        {error && <Alert variant="danger">{error}</Alert>}

        <Card>
          <Card.Body>
            {loading ? (
              <p className="text-center">Loading employees...</p>
            ) : employees.length > 0 ? (
              <div className="table-responsive employee-table-container">
                <Table striped hover responsive="sm" className="employees-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Position</th>
                      <th>Contact</th>
                      <th>Email</th>
                      <th>Joining Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(employee => (
                      <tr key={employee.id}>
                        <td data-label="Name" className="text-nowrap">{employee.name}</td>
                        <td data-label="Position">{employee.position}</td>
                        <td data-label="Contact">{employee.contact}</td>
                        <td data-label="Email" className="email-cell">{employee.email}</td>
                        <td data-label="Joining Date">{new Date(employee.joiningDate).toLocaleDateString()}</td>
                        <td data-label="Actions">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => navigate(`/edit-employee/${employee.id}`)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(employee.id)}
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
              <p className="text-center">No employees found. Add some employees to get started!</p>
            )}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default Employees; 