import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import "./Attendance.css";  // Import the CSS file for responsive styles

const Attendance = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!currentUser) return;
      
      try {
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
      } catch (err) {
        setError('Failed to load employees. Please try again.');
      }
    };
    
    fetchEmployees();
  }, [currentUser]);
  
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const attendanceRef = collection(db, 'attendance');
        
        // Modified approach: Query by shopId only, then filter in memory
        const attendanceQuery = query(
          attendanceRef,
          where('shopId', '==', currentUser.uid)
        );
        
        const snapshot = await getDocs(attendanceQuery);
        const allAttendanceRecords = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Filter records by date and employee ID (if selected)
        const filteredAttendance = allAttendanceRecords.filter(record => {
          if (selectedEmployee === 'all') {
            return record.date === selectedDate;
          } else {
            return record.date === selectedDate && record.employeeId === selectedEmployee;
          }
        });
        
        // Get employee names for each attendance record
        const attendanceWithNames = filteredAttendance.map(record => {
          const employee = employees.find(emp => emp.id === record.employeeId);
          return {
            ...record,
            employeeName: employee ? employee.name : 'Unknown Employee'
          };
        });
        
        setAttendance(attendanceWithNames);
        setLoading(false);
      } catch (err) {
        setError('Failed to load attendance records. Please try again.');
        setLoading(false);
      }
    };
    
    if (employees.length > 0) {
      fetchAttendance();
    }
  }, [currentUser, selectedDate, selectedEmployee, employees]);
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'present':
        return 'text-success';
      case 'absent':
        return 'text-danger';
      case 'half-day':
        return 'text-warning';
      case 'leave':
        return 'text-primary';
      default:
        return '';
    }
  };
  
  return (
    <div>
      <MainNavbar />
      <Container className="mt-4">
        <h2 className="mb-4">Attendance Records</h2>
        
        <Row className="mb-4 attendance-filters">
          <Col md={6} lg={4}>
            <Form.Group className="mb-3">
              <Form.Label>Select Date</Form.Label>
              <Form.Control
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          
          <Col md={6} lg={4}>
            <Form.Group className="mb-3">
              <Form.Label>Select Employee</Form.Label>
              <Form.Select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="all">All Employees</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          
          <Col md={12} lg={4} className="d-flex align-items-end mb-3">
            <Button 
              variant="outline-primary"
              onClick={() => navigate('/attendance-report')}
              className="ms-auto"
            >
              Generate Report
            </Button>
          </Col>
        </Row>
        
        <Row>
          <Col>
            <div className="mb-3">
              <Button
                variant="primary"
                onClick={() => navigate("/mark-attendance")}
              >
                Mark Attendance
              </Button>
            </div>
          </Col>
        </Row>
        
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : (
          <div className="table-responsive attendance-table-container">
            <Table striped bordered hover responsive="sm" className="attendance-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No attendance records found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  attendance.map((record) => (
                    <tr key={record.id}>
                      <td data-label="Employee">{record.employeeName}</td>
                      <td data-label="Date">
                        {record.date instanceof Timestamp
                          ? record.date.toDate().toLocaleDateString()
                          : new Date(record.date).toLocaleDateString()}
                      </td>
                      <td data-label="Status">
                        <span className={getStatusClass(record.status)}>
                          {record.status}
                        </span>
                      </td>
                      <td data-label="Check In" className="text-nowrap">{record.checkIn || "-"}</td>
                      <td data-label="Check Out" className="text-nowrap">{record.checkOut || "-"}</td>
                      <td data-label="Notes" className="notes-cell">{record.notes || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Attendance; 