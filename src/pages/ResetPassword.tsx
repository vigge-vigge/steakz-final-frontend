import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/api';
import './styles/Auth.css';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[0-9])/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/(?=.*[!@#$%^&*])/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid reset token');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await resetPassword(token, password);
      setMessage(response.message);
      setError(null);
      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      let msg = 'Failed to reset password';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      setMessage(null);
    }
  };

  if (!token) {
    return (
      <div className="container">
        <h1>Invalid Reset Link</h1>
        <p className="error">The password reset link is invalid or has expired.</p>
        <button 
          className="link-button" 
          onClick={() => navigate('/request-reset')}
        >
          Request New Reset Link
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Reset Your Password</h1>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New Password"
          required
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm New Password"
          required
        />
        <button type="submit">Reset Password</button>
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

export default ResetPassword;
