import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login: authLogin } = useContext(AuthContext);
  const { settings, t } = useSettings();  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login(username, password);
      authLogin(response.token, response.user);
      navigate('/');
    } catch (err) {
      setError(t('loginFailed'));
    }
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const leftPanelStyle: React.CSSProperties = {
    flex: 1,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '60px',
    color: 'white',
    position: 'relative'
  };

  const rightPanelStyle: React.CSSProperties = {
    flex: 1,
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '60px',
    position: 'relative'
  };

  const backLinkStyle: React.CSSProperties = {
    position: 'absolute',
    top: '30px',
    left: '30px',
    color: 'rgba(255, 255, 255, 0.8)',
    textDecoration: 'none',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'color 0.3s ease'
  };

  const brandStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: '300',
    letterSpacing: '4px',
    marginBottom: '40px',
    textTransform: 'uppercase'
  };

  const captionStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: '1.4',
    maxWidth: '400px'
  };

  const formContainerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '400px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '8px',
    textAlign: 'center'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '32px',
    textAlign: 'center'
  };

  const inputGroupStyle: React.CSSProperties = {
    marginBottom: '20px'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    backgroundColor: '#ffffff'
  };

  const passwordContainerStyle: React.CSSProperties = {
    position: 'relative'
  };

  const showPasswordStyle: React.CSSProperties = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    fontSize: '14px'
  };

  const forgotPasswordStyle: React.CSSProperties = {
    textAlign: 'right',
    marginTop: '8px'
  };

  const forgotLinkStyle: React.CSSProperties = {
    color: '#667eea',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500'
  };

  const submitButtonStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '24px',
    transition: 'background-color 0.3s ease'
  };

  const orDividerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
    color: '#6b7280',
    fontSize: '14px'
  };

  const dividerLineStyle: React.CSSProperties = {
    flex: 1,
    height: '1px',
    backgroundColor: '#e5e7eb'
  };

  const socialButtonsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px'
  };

  const socialButtonStyle: React.CSSProperties = {
    flex: 1,
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    transition: 'border-color 0.3s ease, background-color 0.3s ease'
  };

  const signupLinkStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: '14px',
    color: '#6b7280'
  };

  const linkStyle: React.CSSProperties = {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '500'
  };

  const errorStyle: React.CSSProperties = {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      {/* Left Panel */}
      <div style={leftPanelStyle}>
        <Link 
          to="/" 
          style={backLinkStyle}
          onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
        >
          ← {t('backToWebsite')}
        </Link>
        
        <div style={brandStyle}>{t('brand')}</div>
        
        <div style={captionStyle}>          {t('capturingMoments')}<br />
          {t('creatingMemories')}
        </div>
      </div>

      {/* Right Panel */}
      <div style={rightPanelStyle}>
        <div style={formContainerStyle}>          <h1 style={titleStyle}>{t('login')}</h1>
          <p style={subtitleStyle}>{t('loginDesc')}</p>

          {error && <div style={errorStyle}>{error}</div>}

          <form onSubmit={handleSubmit}>            <div style={inputGroupStyle}>
              <label style={labelStyle}>{t('emailOrUsername')}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
                required
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>{t('password')}</label>
              <div style={passwordContainerStyle}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
                <button
                  type="button"
                  style={showPasswordStyle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  👁
                </button>
              </div>
              <div style={forgotPasswordStyle}>
                <button
                  type="button"
                  onClick={() => navigate('/request-reset')}
                  style={{ ...forgotLinkStyle, background: 'none', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  {t('forgotPassword')}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              style={submitButtonStyle}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a67d8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#667eea'}
            >
              {t('signIn')}
            </button>
          </form>

          <div style={orDividerStyle}>
            <div style={dividerLineStyle}></div>
            <span style={{ padding: '0 16px' }}>{t('orContinueWith')}</span>
            <div style={dividerLineStyle}></div>
          </div>

          <div style={socialButtonsStyle}>
            <button 
              style={socialButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#9ca3af';
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              🔍 {t('google')}
            </button>
            <button 
              style={socialButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#9ca3af';
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              🍎 {t('apple')}
            </button>
          </div>

          <p style={signupLinkStyle}>
            {t('dontHaveAccount')} <Link to="/signup" style={linkStyle}>{t('signUp')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
