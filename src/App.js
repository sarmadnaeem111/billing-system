import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { useLanguage } from './contexts/LanguageContext';
import PrivateRoute from './components/PrivateRoute';
import AdminPrivateRoute from './components/AdminPrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewReceipt from './pages/NewReceipt';
import ViewReceipts from './pages/ViewReceipts';
import ViewReceipt from './pages/ViewReceipt';
import ViewStock from './pages/ViewStock';
import AddStockItem from './pages/AddStockItem';
import EditStockItem from './pages/EditStockItem';
import Employees from './pages/Employees';
import AddEmployee from './pages/AddEmployee';
import EditEmployee from './pages/EditEmployee';
import Attendance from './pages/Attendance';
import MarkAttendance from './pages/MarkAttendance';
import AttendanceReport from './pages/AttendanceReport';
import Settings from './pages/Settings';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminPendingUsers from './pages/AdminPendingUsers';
import AdminManageUsers from './pages/AdminManageUsers';
import SalesAnalytics from './pages/SalesAnalytics';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Wrapper component to apply RTL class based on language
function AppContent() {
  const { language } = useLanguage();
  const isRTL = language === 'ur';
  
  return (
    <Router>
      <div className={`App ${isRTL ? 'rtl' : ''}`}>
        <Routes>
          {/* User Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/new-receipt" element={
            <PrivateRoute>
              <NewReceipt />
            </PrivateRoute>
          } />
          <Route path="/receipts" element={
            <PrivateRoute>
              <ViewReceipts />
            </PrivateRoute>
          } />
          <Route path="/receipt/:id" element={
            <PrivateRoute>
              <ViewReceipt />
            </PrivateRoute>
          } />
          {/* Sales Analytics Route */}
          <Route path="/sales-analytics" element={
            <PrivateRoute>
              <SalesAnalytics />
            </PrivateRoute>
          } />
          {/* Stock Management Routes */}
          <Route path="/stock" element={
            <PrivateRoute>
              <ViewStock />
            </PrivateRoute>
          } />
          <Route path="/add-stock" element={
            <PrivateRoute>
              <AddStockItem />
            </PrivateRoute>
          } />
          <Route path="/edit-stock/:id" element={
            <PrivateRoute>
              <EditStockItem />
            </PrivateRoute>
          } />
          {/* Employee Management Routes */}
          <Route path="/employees" element={
            <PrivateRoute>
              <Employees />
            </PrivateRoute>
          } />
          <Route path="/add-employee" element={
            <PrivateRoute>
              <AddEmployee />
            </PrivateRoute>
          } />
          <Route path="/edit-employee/:id" element={
            <PrivateRoute>
              <EditEmployee />
            </PrivateRoute>
          } />
          {/* Attendance Management Routes */}
          <Route path="/attendance" element={
            <PrivateRoute>
              <Attendance />
            </PrivateRoute>
          } />
          <Route path="/mark-attendance" element={
            <PrivateRoute>
              <MarkAttendance />
            </PrivateRoute>
          } />
          <Route path="/attendance-report" element={
            <PrivateRoute>
              <AttendanceReport />
            </PrivateRoute>
          } />
          {/* Settings Route */}
          <Route path="/settings" element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <AdminPrivateRoute>
              <AdminDashboard />
            </AdminPrivateRoute>
          } />
          <Route path="/admin/pending-users" element={
            <AdminPrivateRoute>
              <AdminPendingUsers />
            </AdminPrivateRoute>
          } />
          <Route path="/admin/users" element={
            <AdminPrivateRoute>
              <AdminManageUsers />
            </AdminPrivateRoute>
          } />
          
          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="/admin" element={<Navigate replace to="/admin/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
