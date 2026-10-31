import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';


// A quick placeholder for the Customer Home Page
function Home() {
  const { user, logout } = useAuth();
  return (
    <div className="p-8">
      <nav className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-xl font-bold">My Store</h1>
        <div>
          <span className="mr-4">Welcome, {user.firstName}</span>
          <button onClick={logout} className="text-red-500 hover:underline">Logout</button>
        </div>
      </nav>
      <h2 className="text-2xl">Customer Storefront</h2>
      <p className="text-gray-600 mt-2">Products will go here in the next batch!</p>
    </div>
  );
}

// A quick placeholder for the Admin Page
function AdminDashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <nav className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-xl font-bold text-emerald-400">Admin Panel</h1>
        <div>
          <span className="mr-4">Admin: {user.firstName}</span>
          <button onClick={logout} className="text-red-400 hover:underline">Logout</button>
        </div>
      </nav>
      <h2 className="text-2xl">Admin Dashboard</h2>
      <p className="text-gray-400 mt-2">Product management will go here in the next batch!</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* Customer Routes (Requires Login) */}
          <Route element={<ProtectedRoute allowedRoles={['customer', 'admin']} />}>
            <Route path="/" element={<Home />} />
          </Route>

          {/* Admin Routes (Requires Admin Role) */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}