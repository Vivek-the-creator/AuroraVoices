import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import { loginUser, fetchSecurityQuestion, verifySecurityAnswer } from '../services/usersService';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotState, setForgotState] = useState({
    visible: false,
    question: '',
    answer: '',
    error: '',
    isProcessing: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.identifier.trim()) {
      nextErrors.identifier = 'Username or email is required';
    }
    if (!formData.password) {
      nextErrors.password = 'Password is required';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setServerError('');
    try {
      const user = await loginUser({
        identifier: formData.identifier.trim(),
        password: formData.password,
      });
      onLogin(user);
      navigate('/');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const startForgotFlow = async () => {
    if (!formData.identifier.trim()) {
      setErrors((prev) => ({ ...prev, identifier: 'Enter your username or email first' }));
      return;
    }

    setForgotState({
      visible: true,
      question: '',
      answer: '',
      error: '',
      isProcessing: true,
    });
    try {
      const { question } = await fetchSecurityQuestion(formData.identifier.trim());
      setForgotState((prev) => ({ ...prev, question, isProcessing: false }));
    } catch (err) {
      setForgotState({
        visible: false,
        question: '',
        answer: '',
        error: '',
        isProcessing: false,
      });
      setServerError(err.message);
    }
  };

  const handleAnswerChange = (e) => {
    const { value } = e.target;
    setForgotState((prev) => ({ ...prev, answer: value, error: '' }));
  };

  const submitSecurityAnswer = async () => {
    if (!forgotState.answer.trim()) {
      setForgotState((prev) => ({ ...prev, error: 'Please provide your answer' }));
      return;
    }
    setForgotState((prev) => ({ ...prev, isProcessing: true, error: '' }));
    try {
      const user = await verifySecurityAnswer(formData.identifier.trim(), forgotState.answer.trim());
      onLogin(user);
      navigate('/');
    } catch (err) {
      setForgotState((prev) => ({ ...prev, error: err.message, isProcessing: false }));
    }
  };

  const cancelForgotFlow = () => {
    setForgotState({
      visible: false,
      question: '',
      answer: '',
      error: '',
      isProcessing: false,
    });
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Sign in with your username or email</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="identifier" className="form-label">
                Username or Email
              </label>
              <input
                type="text"
                id="identifier"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                className={`form-input ${errors.identifier ? 'error' : ''}`}
                placeholder="e.g., aurorafan or you@example.com"
                disabled={isLoading}
              />
              {errors.identifier && <span className="error-message">{errors.identifier}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
              <button
                type="button"
                className="link-button"
                onClick={startForgotFlow}
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>

            {serverError && <div className="error-banner">{serverError}</div>}

            <button
              type="submit"
              className={`btn btn-primary auth-submit ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {forgotState.visible && (
            <div className="auth-card" style={{ marginTop: 16 }}>
              <h3>Security Check</h3>
              {forgotState.isProcessing && !forgotState.question ? (
                <p className="helper-text">Fetching your security question...</p>
              ) : (
                <>
                  <p className="helper-text">{forgotState.question}</p>
                  <div className="form-group">
                    <label htmlFor="securityAnswer" className="form-label">
                      Your Answer
                    </label>
                    <input
                      type="text"
                      id="securityAnswer"
                      name="securityAnswer"
                      value={forgotState.answer}
                      onChange={handleAnswerChange}
                      className={`form-input ${forgotState.error ? 'error' : ''}`}
                      placeholder="Answer (not case sensitive)"
                      disabled={forgotState.isProcessing}
                    />
                    {forgotState.error && <span className="error-message">{forgotState.error}</span>}
                  </div>
                  <div className="form-actions" style={{ display: 'flex', gap: 12 }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={cancelForgotFlow}
                      disabled={forgotState.isProcessing}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={submitSecurityAnswer}
                      disabled={forgotState.isProcessing}
                    >
                      {forgotState.isProcessing ? 'Verifying...' : 'Submit Answer'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

