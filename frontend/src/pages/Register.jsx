import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to Nova, ${user.name.split(' ')[0]}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-1">Create an account</h1>
        <p className="text-sm text-ink/50 text-center mb-6">Join Nova today</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Full name</label>
            <input
              type="text"
              required
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Email</label>
            <input
              type="email"
              required
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <p className="text-xs text-ink/40 mt-1">At least 6 characters</p>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">I want to</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'buyer' })}
                className={`py-2 rounded-card text-sm font-medium border transition-colors ${
                  form.role === 'buyer'
                    ? 'border-teal bg-teal-light text-teal'
                    : 'border-ink/15 text-ink/60'
                }`}
              >
                Shop as Buyer
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'seller' })}
                className={`py-2 rounded-card text-sm font-medium border transition-colors ${
                  form.role === 'seller'
                    ? 'border-teal bg-teal-light text-teal'
                    : 'border-ink/15 text-ink/60'
                }`}
              >
                Sell as Seller
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-center text-ink/50 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-teal font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
