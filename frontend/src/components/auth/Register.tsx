// Register.tsx - FULLY FIXED
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useToast } from '../common/ToastContainer';
import { getErrorMessage } from '../../utils/errorHandler';
import Input from '../common/Input';
import Button from '../common/Button';
import './Register.css';
import { useAuth } from '../../context/AuthContext';

const Register: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, don't let them stay here
    if (isAuthenticated) {
      navigate('/challenges');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      showToast('Registration successful! Please login.', 'success');
      navigate('/login');
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🚩 Join CTF Platform</h1>
        <p className="auth-subtitle">Create your account and start hacking</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            type="email"
            name="email"
            label="Email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            type="password"
            name="password"
            label="Password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Input
            type="password"
            name="confirmPassword"
            label="Confirm Password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <Button type="submit" loading={loading} className="btn-full">
            Register
          </Button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
