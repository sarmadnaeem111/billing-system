import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Stack } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import { Translate, TranslateData } from '../utils';
import useTranslatedData from '../hooks/useTranslatedData';

const Dashboard = () => {
  const { currentUser, shopData } = useAuth();
  const [receiptCount, setReceiptCount] = useState(0);
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState({ present: 0, absent: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Translate shop data
  const translatedShopData = useTranslatedData(shopData);
  // Translate recent receipts
  const translatedReceipts = useTranslatedData(recentReceipts);
  // Translate attendance data
  const translatedAttendance = useTranslatedData(todayAttendance);

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
      <Container className="pb-4">
        <h2 className="my-3"><Translate textKey="dashboard" /></h2>
        
        {shopData && (
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Card.Title as="h3">{translatedShopData.shopName}</Card.Title>
              <Card.Text>
                <strong><Translate textKey="address" />:</strong> {translatedShopData.address}<br />
                <strong><Translate textKey="phone" />:</strong> {translatedShopData.phoneNumber}
              </Card.Text>
            </Card.Body>
          </Card>
        )}
        
        <Row className="g-3">
          <Col xs={12} md={6} lg={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <Card.Title><Translate textKey="receipts" /></Card.Title>
                <Card.Text className="mb-4">
                  <TranslateData 
                    data={{
                      message: "You have generated {count} receipt(s) so far.",
                      count: receiptCount
                    }}
                  >
                    {(data) => (
                      <>
                        {data.message.replace('{count}', data.count)}
                      </>
                    )}
                  </TranslateData>
                </Card.Text>
                <div className="mt-auto">
                  <Stack direction="horizontal" gap={2} className="d-flex flex-wrap">
                    <Button 
                      variant="primary" 
                      onClick={() => navigate('/receipts')}
                      className="flex-grow-1"
                    >
                      <Translate textKey="view" />
                    </Button>
                    <Button 
                      variant="success" 
                      onClick={() => navigate('/new-receipt')}
                      className="flex-grow-1"
                    >
                      <Translate textKey="add" />
                    </Button>
                  </Stack>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xs={12} md={6} lg={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <Card.Title><Translate textKey="employees" /></Card.Title>
                <Card.Text className="mb-4">
                  <TranslateData 
                    data={{
                      message: "You have {count} employee(s) registered.",
                      count: employeeCount
                    }}
                  >
                    {(data) => (
                      <>
                        {data.message.replace('{count}', data.count)}
                      </>
                    )}
                  </TranslateData>
                  
                  {todayAttendance.total > 0 && (
                    <div className="mt-2">
                      <div><Translate textKey="todaysAttendance" fallback="Today's Attendance:" /></div>
                      <div className="d-flex justify-content-between pe-5 mt-1">
                        <span><Translate textKey="present" fallback="Present" />:</span> 
                        <span>{translatedAttendance.present}</span>
                      </div>
                      <div className="d-flex justify-content-between pe-5">
                        <span><Translate textKey="absent" fallback="Absent" />:</span> 
                        <span>{translatedAttendance.absent}</span>
                      </div>
                    </div>
                  )}
                </Card.Text>
                <div className="mt-auto">
                  <Stack direction="horizontal" gap={2} className="d-flex flex-wrap">
                    <Button 
                      variant="primary" 
                      onClick={() => navigate('/employees')}
                      className="flex-grow-1"
                    >
                      <Translate textKey="viewEmployees" />
                    </Button>
                    <Button 
                      variant="success" 
                      onClick={() => navigate('/mark-attendance')}
                      className="flex-grow-1"
                    >
                      <Translate textKey="markAttendance" />
                    </Button>
                  </Stack>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xs={12} lg={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title><Translate textKey="recentReceipts" fallback="Recent Receipts" /></Card.Title>
                {recentReceipts.length > 0 ? (
                  <div className="table-responsive small-table">
                    <table className="table table-sm table-hover">
                      <thead>
                        <tr>
                          <th><Translate textKey="date" /></th>
                          <th><Translate textKey="receiptId" fallback="Receipt ID" /></th>
                          <th><Translate textKey="total" /></th>
                          <th><Translate textKey="action" /></th>
                        </tr>
                      </thead>
                      <tbody>
                        {translatedReceipts.map(receipt => (
                          <tr key={receipt.id}>
                            <td>{new Date(receipt.timestamp).toLocaleDateString()}</td>
                            <td className="text-truncate" style={{maxWidth: "80px"}}>{receipt.id.substring(0, 8)}</td>
                            <td>${receipt.totalAmount}</td>
                            <td>
                              <Button 
                                size="sm" 
                                variant="outline-primary"
                                onClick={() => navigate(`/receipt/${receipt.id}`)}
                              >
                                <Translate textKey="view" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center mt-4">
                    {loading ? <Translate textKey="loading" fallback="Loading..." /> : 
                      <Translate textKey="noReceiptsYet" fallback="No receipts yet. Start creating receipts!" />}
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style jsx="true">{`
        @media (max-width: 576px) {
          .table-responsive.small-table {
            font-size: 0.875rem;
          }
          .table-responsive.small-table td, 
          .table-responsive.small-table th {
            padding: 0.3rem;
          }
        }
      `}</style>
    </>
  );
};

export default Dashboard; 
