import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Companies from './pages/Companies';
import CompanyDetails from './pages/CompanyDetails';
import CreateCompany from './pages/CreateCompany';
import EditCompany from './pages/EditCompany';
import './index.css';

// Placeholder components for new dashboards
const AdminDashboard = () => <h2 className="text-3xl text-center mt-20">Admin Dashboard</h2>;
const CollectorDashboard = () => <h2 className="text-3xl text-center mt-20">Collector Dashboard</h2>;
const UserDashboard = () => <h2 className="text-3xl text-center mt-20">User Dashboard</h2>;


function App() {
  return (
    // CRITICAL FIX: Router must wrap AuthProvider
    <Router> {/* <--- Router is now the outermost component */}
      <AuthProvider> {/* <--- AuthProvider is now inside the Router */}
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
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

              {/* Company Management Routes (Protected) */}
              <Route
                path="/companies/new"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'collector']}>
                    <CreateCompany />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-company/:id"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'collector']}>
                    <EditCompany />
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