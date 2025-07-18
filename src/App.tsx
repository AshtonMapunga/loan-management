// import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// Admin imports
import Adminlogin from "./pages/Admin_Pages/Login";
import Dashboard from "./pages/Admin_Pages/Dashboard";
import Users from "./pages/Admin_Pages/Users";
import LoanManagement from "./pages/Admin_Pages/Loan_management";
import LoanTracking from "./pages/Admin_Pages/loan_tracking";
import Settings from "./pages/Admin_Pages/Settings";
import ComingSoonPage from "./pages/Admin_Pages/Error";
import ChatInterface from "./pages/Admin_Pages/Chat";
import CollateralManagement from "./pages/Admin_Pages/collaterals";
import AdminNotifications from "./pages/Admin_Pages/adminNotifications";
import Notification from "./pages/Admin_Pages/notification";


//user imports

import UserDashboard from "./pages/User_Pages/Dashboard";
import Loan_application from "./pages/User_Pages/Loan_application";
import Payment from "./pages/User_Pages/Payment";
import Account from "./pages/User_Pages/Account";
import Userlogin from "./pages/User_Pages/Login";
import UserSignup from "./pages/User_Pages/Signup";
import AdminSignUp from "./pages/Admin_Pages/Signup";
import Landingpage from "./pages/User_Pages/landing page";
import PaymentManagement from "./pages/Admin_Pages/payment_management";
import Chart from "./pages/User_Pages/Chart";
import CustomerPage from "./pages/User_Pages/Customer";
import Logout from "./pages/User_Pages/logout";
import NotificationsPage from "./pages/User_Pages/Notifications"; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}

        <Route path="/adminlogin" element={<Adminlogin />} />
        <Route path="/adminsignup" element={<AdminSignUp />} />
        <Route path="/admindashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/loan-management" element={<LoanManagement />} />
        <Route path="/loan-tracking" element={<LoanTracking />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/payments" element={<PaymentManagement />} />
        <Route path="/chat" element={<ChatInterface />} />

        {/* <Route path="/notification" element={<Notifications />} /> */}
        <Route path="/*" element={<ComingSoonPage />} />
        <Route path="/notifications" element={<Notification />} />
        {/* <Route path="/adminlogout" element={<AdminLogout />} /> */}
        <Route path="/collaterals" element={<CollateralManagement />} />
        <Route
          path="/admin/notifications/admin"
          element={<AdminNotifications />}
        />

        {/* User Routes */}
        <Route path="/" element={<Landingpage />} />
        <Route path="/userlogin" element={<Userlogin />} />
        <Route path="/usersignup" element={<UserSignup />} />
        <Route path="/userdashboard" element={<UserDashboard />} />
        <Route path="/loan_application" element={<Loan_application />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/chart" element={<Chart />} />
        <Route path="/account" element={<Account />} />
        <Route path="/Logout" element={<Logout />} />
        <Route path="/usernotifications" element={<NotificationsPage />} />
        <Route path="/customer" element={<CustomerPage />} />

        <Route path="/*" element={<ComingSoonPage />} />
      </Routes>
    </Router>
  );
}

export default App;
