import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const Signup: React.FC = () => {  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useContext(AuthContext);
  const { settings } = useSettings();
  const navigate = useNavigate();

  // Translation dictionaries
  const translations: Record<string, Record<string, string>> = {
    en: {
      createAccount: 'Create an account',
      createAccountDesc: 'Already have an account?',
      loginLink: 'Log in',      firstName: 'First name',
      lastName: 'Last name',
      username: 'Username', 
      email: 'Email',
      password: 'Enter your password',
      confirmPassword: 'Confirm password',
      agreeToTerms: 'I agree to the Terms & Conditions',
      createAccountBtn: 'Create account',
      orRegisterWith: 'Or register with',
      google: 'Google',
      apple: 'Apple',
      backToWebsite: 'Back to website',
      welcomeTo: 'Welcome to',
      brand: 'STEAKZ',
      capturingMoments: 'Capturing Moments,',
      creatingMemories: 'Creating Memories',
      signupFailed: 'Registration failed',
      passwordsDontMatch: 'Passwords do not match',
      mustAgreeToTerms: 'You must agree to the terms and conditions'
    },
    sv: {
      createAccount: 'Skapa ett konto',
      createAccountDesc: 'Har du redan ett konto?',
      loginLink: 'Logga in',      firstName: 'Förnamn',
      lastName: 'Efternamn',
      username: 'Användarnamn',
      email: 'E-post',
      password: 'Ange ditt lösenord',
      confirmPassword: 'Bekräfta lösenord',
      agreeToTerms: 'Jag godkänner villkoren',
      createAccountBtn: 'Skapa konto',
      orRegisterWith: 'Eller registrera dig med',
      google: 'Google',
      apple: 'Apple',
      backToWebsite: 'Tillbaka till webbplats',
      welcomeTo: 'Välkommen till',
      brand: 'STEAKZ',
      capturingMoments: 'Fånga ögonblick,',
      creatingMemories: 'Skapa minnen',
      signupFailed: 'Registrering misslyckades',
      passwordsDontMatch: 'Lösenorden matchar inte',
      mustAgreeToTerms: 'Du måste godkänna villkoren'
    },
    es: {
      createAccount: 'Crear una cuenta',
      createAccountDesc: '¿Ya tienes una cuenta?',
      loginLink: 'Iniciar sesión',      firstName: 'Nombre',
      lastName: 'Apellido',
      username: 'Nombre de usuario',
      email: 'Correo electrónico',
      password: 'Ingresa tu contraseña',
      confirmPassword: 'Confirmar contraseña',
      agreeToTerms: 'Acepto los Términos y Condiciones',
      createAccountBtn: 'Crear cuenta',
      orRegisterWith: 'O regístrate con',
      google: 'Google',
      apple: 'Apple',
      backToWebsite: 'Volver al sitio web',
      welcomeTo: 'Bienvenido a',
      brand: 'STEAKZ',
      capturingMoments: 'Capturando momentos,',
      creatingMemories: 'Creando recuerdos',
      signupFailed: 'Error en el registro',
      passwordsDontMatch: 'Las contraseñas no coinciden',
      mustAgreeToTerms: 'Debes aceptar los términos y condiciones'
    },
    de: {
      createAccount: 'Konto erstellen',
      createAccountDesc: 'Haben Sie bereits ein Konto?',
      loginLink: 'Anmelden',      firstName: 'Vorname',
      lastName: 'Nachname',
      username: 'Benutzername',
      email: 'E-Mail',
      password: 'Passwort eingeben',
      confirmPassword: 'Passwort bestätigen',
      agreeToTerms: 'Ich stimme den Allgemeinen Geschäftsbedingungen zu',
      createAccountBtn: 'Konto erstellen',
      orRegisterWith: 'Oder registrieren Sie sich mit',
      google: 'Google',
      apple: 'Apple',
      backToWebsite: 'Zurück zur Website',
      welcomeTo: 'Willkommen bei',
      brand: 'STEAKZ',
      capturingMoments: 'Momente einfangen,',
      creatingMemories: 'Erinnerungen schaffen',
      signupFailed: 'Registrierung fehlgeschlagen',
      passwordsDontMatch: 'Passwörter stimmen nicht überein',
      mustAgreeToTerms: 'Sie müssen den Allgemeinen Geschäftsbedingungen zustimmen'
    },
    fr: {
      createAccount: 'Créer un compte',
      createAccountDesc: 'Vous avez déjà un compte ?',
      loginLink: 'Se connecter',      firstName: 'Prénom',
      lastName: 'Nom de famille',
      username: 'Nom d\'utilisateur',
      email: 'Email',
      password: 'Entrez votre mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      agreeToTerms: 'J\'accepte les Conditions Générales',
      createAccountBtn: 'Créer un compte',
      orRegisterWith: 'Ou s\'inscrire avec',
      google: 'Google',
      apple: 'Apple',
      backToWebsite: 'Retour au site web',
      welcomeTo: 'Bienvenue chez',
      brand: 'STEAKZ',
      capturingMoments: 'Capturer des moments,',
      creatingMemories: 'Créer des souvenirs',
      signupFailed: 'Échec de l\'inscription',
      passwordsDontMatch: 'Les mots de passe ne correspondent pas',
      mustAgreeToTerms: 'Vous devez accepter les conditions générales'
    }
  };

  const getText = (key: string) => {
    return translations[settings.language]?.[key] || translations.en[key] || key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (password !== confirmPassword) {
      setError(getText('passwordsDontMatch'));
      return;
    }
    
    if (!agreeToTerms) {
      setError(getText('mustAgreeToTerms'));
      return;
    }    try {
      const response = await signup(username, email, password, firstName, lastName);
      // If response.token exists, log in immediately, else go to login page
      if (response.token && response.user) {
        login(response.token, response.user);
        navigate('/');
      } else if (response.user) {
        // If only user is returned, go to login page with success message
        navigate('/login', { state: { signupSuccess: true } });
      } else {
        setError(getText('signupFailed'));
      }
    } catch (err: any) {
      let msg = getText('signupFailed');
      if (err.response && err.response.data && (err.response.data.error || err.response.data.message)) {
        msg = err.response.data.error || err.response.data.message;
      }
      setError(msg);
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
    position: 'relative',
    overflowY: 'auto'
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

  const inputRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
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

  const checkboxStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px'
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
    marginBottom: '24px',
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

  const loginLinkStyle: React.CSSProperties = {
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
          ← {getText('backToWebsite')}
        </Link>
        
        <div style={brandStyle}>{getText('brand')}</div>
        
        <div style={captionStyle}>
          {getText('capturingMoments')}<br />
          {getText('creatingMemories')}
        </div>
      </div>

      {/* Right Panel */}
      <div style={rightPanelStyle}>
        <div style={formContainerStyle}>
          <h1 style={titleStyle}>{getText('createAccount')}</h1>
          <p style={subtitleStyle}>
            {getText('createAccountDesc')} <Link to="/login" style={linkStyle}>{getText('loginLink')}</Link>
          </p>

          {error && <div style={errorStyle}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={inputRowStyle}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>{getText('firstName')}</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
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
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>{getText('lastName')}</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
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
            </div>            <div style={inputGroupStyle}>
              <label style={labelStyle}>{getText('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              <label style={labelStyle}>{getText('username')}</label>
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
              <label style={labelStyle}>{getText('password')}</label>
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
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>{getText('confirmPassword')}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

            <div style={checkboxStyle}>
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                style={{ marginRight: '8px' }}
                required
              />
              <label htmlFor="agreeToTerms" style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
                {getText('agreeToTerms')}
              </label>
            </div>

            <button 
              type="submit" 
              style={submitButtonStyle}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a67d8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#667eea'}
            >
              {getText('createAccountBtn')}
            </button>
          </form>

          <div style={orDividerStyle}>
            <div style={dividerLineStyle}></div>
            <span style={{ padding: '0 16px' }}>{getText('orRegisterWith')}</span>
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
              🔍 {getText('google')}
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
              🍎 {getText('apple')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
