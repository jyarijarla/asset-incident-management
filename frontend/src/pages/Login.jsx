import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1e1e2e',
    }}>
      <div style={{
        backgroundColor: '#313244',
        padding: '2.5rem',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
      }}>
        <h1 style={{ color: '#cdd6f4', marginBottom: '0.5rem', fontSize: '22px' }}>
          Asset Manager
        </h1>
        <p style={{ color: '#a6adc8', marginBottom: '2rem', fontSize: '14px' }}>
          Sign in to your account
        </p>

        {error && (
          <div style={{
            backgroundColor: '#f38ba820',
            border: '1px solid #f38ba8',
            color: '#f38ba8',
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <div onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: '#cdd6f4', marginBottom: '6px', fontSize: '14px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#1e1e2e',
                border: '1px solid #45475a',
                borderRadius: '8px',
                color: '#cdd6f4',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
              placeholder="admin@test.com"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: '#cdd6f4', marginBottom: '6px', fontSize: '14px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#1e1e2e',
                border: '1px solid #45475a',
                borderRadius: '8px',
                color: '#cdd6f4',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#89b4fa',
              color: '#1e1e2e',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;