import React, { useState } from 'react';
import { challengeService } from '../services/challengeService';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import './Admin.css';

// Define the form state type to match Challenge type
type ChallengeFormData = {
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  flag: string; // extra field for CTF flag
};

const Admin: React.FC = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState<ChallengeFormData>({
    title: '',
    description: '',
    category: 'web',
    difficulty: 'easy',
    points: 100,
    flag: ''
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Only admins can access
  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await challengeService.createChallenge(formData); // now type-safe
      setMessage({ type: 'success', text: 'Challenge created successfully!' });

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'web',
        difficulty: 'easy',
        points: 100,
        flag: ''
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to create challenge'
      });
    }
  };

  return (
    <div className="admin-page">
      <h1>⚙️ Admin Panel</h1>

      <div className="admin-section">
        <h2>Create New Challenge</h2>

        {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

        <form onSubmit={handleSubmit} className="admin-form">
          <Input
            type="text"
            name="title"
            label="Challenge Title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="web">Web</option>
                <option value="crypto">Crypto</option>
                <option value="reverse">Reverse</option>
                <option value="forensics">Forensics</option>
                <option value="pwn">Pwn</option>
              </select>
            </div>

            <div className="form-group">
              <label>Difficulty</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <Input
              type="number"
              name="points"
              label="Points"
              value={formData.points}
              onChange={handleChange}
              min={50}
              step={50}
              required
            />
          </div>

          <Input
            type="text"
            name="flag"
            label="Flag (e.g., FLAG{...})"
            value={formData.flag}
            onChange={handleChange}
            required
          />

          <Button type="submit">Create Challenge</Button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
