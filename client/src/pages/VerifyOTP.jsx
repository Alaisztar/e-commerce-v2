import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function VerifyOTP() {
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from the Register page redirect
  const email = location.state?.email;

  if (!email) {
    return (
      <div className="text-center p-8">
        <p>No email provided. <Link to="/register" className="text-blue-600 underline">Register here</Link></p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyOTP(email, otpCode);
      navigate('/'); // Send to storefront after verification
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Check your email</h2>
        <p className="text-gray-500 mb-6">We sent a 6-digit code to <strong>{email}</strong></p>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            required
            maxLength="6"
            placeholder="000000"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} // Only numbers
            className="w-full text-center tracking-[1em] text-2xl font-bold px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button 
            type="submit" 
            disabled={loading || otpCode.length !== 6}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>
      </div>
    </div>
  );
}