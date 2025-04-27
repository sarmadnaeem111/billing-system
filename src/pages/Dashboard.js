import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';

const Dashboard = () => {
  const { currentUser, shopData } = useAuth();
  const [receiptCount, setReceiptCount] = useState(0);
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState({ present: 0, absent: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Convert to non-async function
    const fetchDashboardData = () => {
      if (!currentUser) return;

      try {
        // Create a simple query without ordering
        const receiptRef = collection(db, 'receipts');
        const receiptQuery = query(
          receiptRef,
          where("shopId", "==", currentUser.uid)
        );
        
        getDocs(receiptQuery)
          .then(receiptSnapshot => {
            // Set the count
            setReceiptCount(receiptSnapshot.size);
            
            // Get all receipts and sort them client-side
            const receipts = receiptSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            // Sort receipts by timestamp
            receipts.sort((a, b) => {
              return new Date(b.timestamp) - new Date(a.timestamp);
            });
            
            // Get just the first 5
            setRecentReceipts(receipts.slice(0, 5));
          })
          .catch(error => {
            console.error("Error fetching dashboard data:", error);
          });

        // Fetch employee count
        const employeesRef = collection(db, 'employees');
        const employeesQuery = query(
          employeesRef,
          where("shopId", "==", currentUser.uid)
        );
        
        getDocs(employeesQuery)
          .then(employeeSnapshot => {
            setEmployeeCount(employeeSnapshot.size);
            
            // Fetch today's attendance
            const today = new Date().toISOString().split('T')[0];
            const attendanceRef = collection(db, 'attendance');
            const attendanceQuery = query(
              attendanceRef,
              where("shopId", "==", currentUser.uid),
              where("date", "==", today)
            );
            
            return getDocs(attendanceQuery);
          })
          .then(attendanceSnapshot => {
            const attendanceRecords = attendanceSnapshot.docs.map(doc => ({
              ...doc.data()
            }));
            
            const presentCount = attendanceRecords.filter(record => 
              record.status === 'present' || record.status === 'half-day'
            ).length;
            
            const absentCount = attendanceRecords.filter(record => 
              record.status === 'absent' || record.status === 'leave'
            ).length;
            
            setTodayAttendance({
              present: presentCount,
              absent: absentCount,
              total: attendanceRecords.length
            });
          })
          .catch(error => {
            console.error("Error fetching employee data:", error);
          })
          .finally(() => {
            setLoading(false);
          });
      } catch (error) {
        console.error("Error setting up queries:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  return (
    <>
      <MainNavbar />
      <Container>
        <h2 className="mb-4">Dashboard</h2>
        
        {shopData && (
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>{shopData.shopName}</Card.Title>
              <Card.Text>
                <strong>Address:</strong> {shopData.address}<br />
                <strong>Contact:</strong> {shopData.phoneNumber}
              </Card.Text>
            </Card.Body>
          </Card>
        )}
        
        <Row>
          <Col md={6} lg={4} className="mb-4">
            <Card className="h-100">
              <Card.Body className="d-flex flex-column">
                <Card.Title>Receipts</Card.Title>
                <Card.Text className="mb-4">
                  You have generated {receiptCount} receipt(s) so far.
                </Card.Text>
                <div className="mt-auto">
                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/receipts')}
                    className="me-2"
                  >
                    View All
                  </Button>
                  <Button 
                    variant="success" 
                    onClick={() => navigate('/new-receipt')}
                  >
                    Create New
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6} lg={4} className="mb-4">
            <Card className="h-100">
              <Card.Body className="d-flex flex-column">
                <Card.Title>Employees</Card.Title>
                <Card.Text className="mb-4">
                  You have {employeeCount} employee(s) registered.
                  {todayAttendance.total > 0 && (
                    <div className="mt-2">
                      <div>Today's Attendance:</div>
                      <div>Present: {todayAttendance.present}</div>
                      <div>Absent: {todayAttendance.absent}</div>
                    </div>
                  )}
                </Card.Text>
                <div className="mt-auto">
                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/employees')}
                    className="me-2"
                  >
                    View Employees
                  </Button>
                  <Button 
                    variant="success" 
                    onClick={() => navigate('/mark-attendance')}
                  >
                    Mark Attendance
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={12} lg={4} className="mb-4">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Recent Receipts</Card.Title>
                {recentReceipts.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Receipt ID</th>
                          <th>Total</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentReceipts.map(receipt => (
                          <tr key={receipt.id}>
                            <td>{new Date(receipt.timestamp).toLocaleDateString()}</td>
                            <td>{receipt.id.substring(0, 8)}</td>
                            <td>${receipt.totalAmount}</td>
                            <td>
                              <Button 
                                size="sm" 
                                variant="outline-primary"
                                onClick={() => navigate(`/receipt/${receipt.id}`)}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center mt-4">
                    {loading ? "Loading..." : "No receipts yet. Start creating receipts!"}
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Dashboard; 