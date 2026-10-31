import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'customer' // Default role
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name] || errors.server) {
      setErrors({ ...errors, [e.target.name]: '', server: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const user = await login(formData.email, formData.password, formData.role);
      
      // Redirect based on role returned from database
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrors({ server: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white tracking-wider">MyStore.</h1>
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Welcome back to MyStore.
          </h2>
          <p className="text-blue-100 text-lg">
            Log in to track your orders, manage your wishlist, and continue your shopping journey.
          </p>
        </div>
        <div className="relative z-10 text-blue-200 text-sm">
          © {new Date().getFullYear()} MyStore. All rights reserved.
        </div>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-5"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-white opacity-5"></div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Sign in</h2>
            <p className="text-gray-500 mt-2">Welcome back! Please enter your details.</p>
          </div>

          {errors.server && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-sm text-red-700">{errors.server}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">I am logging in as a...</label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer transition ${formData.role === 'customer' ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                  <input
                    type="radio" name="role" value="customer"
                    checked={formData.role === 'customer'} onChange={handleChange}
                    className="sr-only" // Hide the actual radio button
                  />
                  Customer
                </label>
                <label className={`flex-1 flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer transition ${formData.role === 'admin' ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                  <input
                    type="radio" name="role" value="admin"
                    checked={formData.role === 'admin'} onChange={handleChange}
                    className="sr-only"
                  />
                  Admin
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email" name="email" value={formData.email} onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition pr-10 ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}`}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 hover:text-gray-700">
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-200 mt-2 disabled:bg-blue-400"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account? <Link to="/register" className="text-blue-600 font-medium hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}