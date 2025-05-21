import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import RegisterCompany from './pages/RegisterCompany'; // <--- CHANGED: Import RegisterCompany
import MyCompanyDashboard from './pages/MyCompanyDashboard'; // <--- NEW IMPORT
import Companies from './pages/Companies';
import CompanyDetails from './pages/CompanyDetails';
import CreateCompany from './pages/CreateCompany';
import EditCompany from './pages/EditCompany';
import ServicesManagement from './pages/ServicesManagement';
import RegionsManagement from './pages/RegionsManagement';
import './index.css';

// Placeholder components for other dashboards (if not already fully implemented)
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
              <Route path="/register-company" element={<RegisterCompany />} /> {/* <--- CHANGED: New path for company registration */}
              {/* The old /register route is now gone */}

              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:id" element={<CompanyDetails />} />

              {/* Role-Based Dashboards (Protected) */}
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
                path="/my-company-dashboard" // <--- NEW PROTECTED ROUTE FOR COMPANY OWNER
                element={
                  <ProtectedRoute allowedRoles={['company_owner']}>
                    <MyCompanyDashboard />
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

              {/* Service Management Route (Admin Only) */}
              <Route
                path="/admin/services"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ServicesManagement />
                  </ProtectedRoute>
                }
              />

              {/* Region Management Route (Admin Only) */}
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
