import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestPasswordReset } from '../services/api';
import './styles/Auth.css';

const RequestPasswordReset: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await requestPasswordReset(email);
      setMessage(response.message);
      setError(null);
    } catch (err: any) {
      let msg = 'Failed to process request';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      setMessage(null);
    }
  };

  return (
    <div className="container">
      <h1>Reset Password</h1>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <button type="submit">Request Reset</button>
      </form>
      <p>
        <button 
          className="link-button" 
          onClick={() => navigate('/login')}
        >
          Back to Login
        </button>
      </p>
    </div>
  );
};

export default RequestPasswordReset;
