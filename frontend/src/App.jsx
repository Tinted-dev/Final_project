import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import RegisterCompany from './pages/RegisterCompany';
import MyCompanyDashboard from './pages/MyCompanyDashboard';
import Companies from './pages/Companies';
import CompanyDetails from './pages/CompanyDetails';
import CreateCompany from './pages/CreateCompany';
import EditCompany from './pages/EditCompany';
import ServicesManagement from './pages/ServicesManagement';
import RegionsManagement from './pages/RegionsManagement';
import UserProfile from './pages/UserProfile'; // <--- NEW IMPORT
import './index.css';

// Placeholder components for other dashboards
const AdminDashboard = () => <h2 className="text-3xl text-center mt-20">Admin Dashboard</h2>;
const CollectorDashboard = () => <h2 className="text-3xl text-center mt-20">Collector Dashboard</h2>;
const UserDashboard = () => <h2 className="text-3xl text-center mt-20">User Dashboard</h2>;


function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register-company" element={<RegisterCompany />} />

              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:id" element={<CompanyDetails />} />

              {/* Protected Routes for Dashboards */}
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/collector-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['collector']}>
                    <CollectorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-company-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['company_owner']}>
                    <MyCompanyDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-profile" // <--- NEW PROTECTED ROUTE FOR USER PROFILE
                element={
                  <ProtectedRoute allowedRoles={['admin', 'collector', 'user', 'company_owner']}> {/* Accessible by any logged-in user */}
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              {/* Company Management Routes (Protected for Admin) */}
              <Route
                path="/companies/new"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <CreateCompany />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-company/:id"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <EditCompany />
                  </ProtectedRoute>
                }
              />

              {/* Admin Management Routes */}
              <Route
                path="/admin/services"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ServicesManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/regions"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <RegionsManagement />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
