import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from './authSlice';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Reusing the same styles

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(registerUser({ email, password, name }));
    if (registerUser.fulfilled.match(resultAction)) {
      navigate('/');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-bubbles">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="auth-bubble" style={{
            '--size': `${2 + Math.random() * 4}rem`,
            '--left': `${Math.random() * 100}%`,
            '--delay': `${Math.random() * 5}s`,
            '--duration': `${10 + Math.random() * 10}s`
          }} />
        ))}
      </div>
      <div className="auth-panel">
        <div className="auth-header">
          <span className="material-icons-round auth-icon">person_add</span>
          <h2>Create Account</h2>
          <p>Join the diver community</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <span className="material-icons-round input-icon">person</span>
            <input 
              type="text" 
              placeholder="Display Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <span className="material-icons-round input-icon">email</span>
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <span className="material-icons-round input-icon">lock</span>
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button 
            type="submit" 
            className="auth-button"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Creating...' : 'Register'}
          </button>
        </form>
        
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
