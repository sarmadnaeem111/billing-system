import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import './MarkAttendance.css'; // Import the CSS for responsive styles

const MarkAttendance = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Current date for marking attendance
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Fetch employees
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
  
  // Check for existing attendance records for this date
  useEffect(() => {
    const checkExistingAttendance = async () => {
      if (!currentUser || employees.length === 0) return;
      
      try {
        setLoading(true);
        const attendanceRef = collection(db, 'attendance');
        
        // Query all attendance records for this shop
        const attendanceQuery = query(
          attendanceRef,
          where('shopId', '==', currentUser.uid)
        );
        
        const snapshot = await getDocs(attendanceQuery);
        
        // Filter records for the selected date
        const existingAttendance = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(record => record.date === selectedDate);
        
        // If existing attendance records found, populate the form with them
        if (existingAttendance.length > 0) {
          const attendanceMap = {};
          existingAttendance.forEach(record => {
            attendanceMap[record.employeeId] = record;
          });
          
          const initialAttendanceData = employees.map(employee => {
            const existingRecord = attendanceMap[employee.id];
            return {
              employeeId: employee.id,
              name: employee.name,
              status: existingRecord ? existingRecord.status : 'present',
              checkIn: existingRecord ? existingRecord.checkIn : '',
              checkOut: existingRecord ? existingRecord.checkOut : '',
              notes: existingRecord ? existingRecord.notes : '',
              recordId: existingRecord ? existingRecord.id : null
            };
          });
          
          setAttendanceData(initialAttendanceData);
        } else {
          // If no existing records, create default entries for all employees
          const defaultAttendanceData = employees.map(employee => ({
            employeeId: employee.id,
            name: employee.name,
            status: 'present',
            checkIn: '',
            checkOut: '',
            notes: '',
            recordId: null
          }));
          
          setAttendanceData(defaultAttendanceData);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load attendance data. Please try again.');
        setLoading(false);
      }
    };
    
    checkExistingAttendance();
  }, [currentUser, employees, selectedDate]);
  
  // Handle attendance status change
  const handleStatusChange = (index, status) => {
    const updatedData = [...attendanceData];
    updatedData[index].status = status;
    setAttendanceData(updatedData);
  };
  
  // Handle time input change
  const handleTimeChange = (index, field, value) => {
    const updatedData = [...attendanceData];
    updatedData[index][field] = value;
    setAttendanceData(updatedData);
  };
  
  // Handle notes change
  const handleNotesChange = (index, value) => {
    const updatedData = [...attendanceData];
    updatedData[index].notes = value;
    setAttendanceData(updatedData);
  };
  
  // Submit attendance
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      const batch = [];
      
      for (const record of attendanceData) {
        const attendanceRecord = {
          employeeId: record.employeeId,
          shopId: currentUser.uid,
          date: selectedDate,
          status: record.status,
          checkIn: record.checkIn,
          checkOut: record.checkOut,
          notes: record.notes,
          updatedAt: new Date().toISOString()
        };
        
        if (record.recordId) {
          // Update existing record
          batch.push(updateDoc(doc(db, 'attendance', record.recordId), attendanceRecord));
        } else {
          // Create new record
          batch.push(addDoc(collection(db, 'attendance'), {
            ...attendanceRecord,
            createdAt: new Date().toISOString()
          }));
        }
      }
      
      await Promise.all(batch);
      
      setSuccess('Attendance marked successfully!');
      setSubmitting(false);
      
      // Redirect to attendance view after 1.5 seconds
      setTimeout(() => {
        navigate('/attendance');
      }, 1500);
    } catch (err) {
      setError('Failed to submit attendance. Please try again.');
      setSubmitting(false);
    }
  };
  
  // Handle date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  
  return (
    <>
      <MainNavbar />
      <Container>
        <h2 className="mb-4">Mark Attendance</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Card className="mb-4">
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3 attendance-date-picker">
                  <Form.Label>Select Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Body>
            {loading ? (
              <p className="text-center">Loading employee data...</p>
            ) : attendanceData.length > 0 ? (
              <>
                <div className="mark-attendance-table-container">
                  <Table striped hover className="mark-attendance-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Status</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.map((record, index) => (
                        <tr key={record.employeeId}>
                          <td data-label="Employee">{record.name}</td>
                          <td data-label="Status">
                            <Form.Select
                              value={record.status}
                              onChange={(e) => handleStatusChange(index, e.target.value)}
                              className="form-select-sm"
                            >
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="half-day">Half Day</option>
                              <option value="leave">Leave</option>
                            </Form.Select>
                          </td>
                          <td data-label="Check In">
                            <Form.Control
                              type="time"
                              value={record.checkIn}
                              onChange={(e) => handleTimeChange(index, 'checkIn', e.target.value)}
                              disabled={record.status === 'absent' || record.status === 'leave'}
                              size="sm"
                            />
                          </td>
                          <td data-label="Check Out">
                            <Form.Control
                              type="time"
                              value={record.checkOut}
                              onChange={(e) => handleTimeChange(index, 'checkOut', e.target.value)}
                              disabled={record.status === 'absent' || record.status === 'leave'}
                              size="sm"
                            />
                          </td>
                          <td data-label="Notes">
                            <Form.Control
                              type="text"
                              value={record.notes}
                              onChange={(e) => handleNotesChange(index, e.target.value)}
                              placeholder="Add notes"
                              size="sm"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                
                <div className="d-flex justify-content-between mt-3 attendance-actions">
                  <Button variant="secondary" onClick={() => navigate('/attendance')}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Save Attendance'}
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-center">No employees found. Please add employees first.</p>
            )}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default MarkAttendance; 
