import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';

const NAV_OPTIONS = {
  ADMIN: [
    { label: 'Home', path: '/' },
    { label: 'Staff', path: '/staff' },
    { label: 'Restaurants', path: '/restauranger' },
    { label: 'Menu', path: '/menu' },
    { label: 'Settings', path: '/settings' },
  ],  GENERAL_MANAGER: [
    { label: 'Home', path: '/' },
    { label: 'Staff', path: '/staff' },
    { label: 'Restaurants', path: '/restauranger' },
    { label: 'Customer Feedback', path: '/customer-feedback' },
    { label: 'Reports', path: '/reports', badge: true },  ],BRANCH_MANAGER: [
    { label: 'Home', path: '/' },
    { label: 'Staff', path: '/staff' },
    { label: 'Preferences', path: '/branch/preferences' },
    { label: 'Reports', path: '/reports', badge: true },
  ],CHEF: [
    { label: 'Home', path: '/' },
    { label: 'Orders', path: '/orders' },
    { label: 'Menu Items', path: '/menu' },
    { label: 'Inventory', path: '/inventory' },
    { label: 'Preferences', path: '/settings' },
  ],
  CASHIER: [
    { label: 'Home', path: '/cashier' },
    { label: 'Orders', path: '/cashier/orders' },
    { label: 'POS', path: '/cashier/pos' },
    { label: 'Receipts', path: '/cashier/receipts' },
    { label: 'Settings', path: '/cashier/settings' },
  ],  CUSTOMER: [
    { label: 'Home', path: '/' },
    { label: 'Menu', path: '/menu' },
    { label: 'Cart', path: '/cart', badge: true },
    { label: 'My Orders', path: '/my-orders' },
    { label: 'Branches', path: '/branches' },
  ],
};

const getRoleKey = (role: string): keyof typeof NAV_OPTIONS | undefined => {
  const map: Record<string, keyof typeof NAV_OPTIONS> = {
    CUSTOMER: 'CUSTOMER',
    CHEF: 'CHEF',
    CASHIER: 'CASHIER',
    BRANCH_MANAGER: 'BRANCH_MANAGER',
    GENERAL_MANAGER: 'GENERAL_MANAGER',
    ADMIN: 'ADMIN',
  };
  return map[role];
};

const Navbar: React.FC = () => {
  const { user, logout, language, currency, setLanguage, setCurrency } = useContext(AuthContext);
  const { settings, setSettings } = useSettings();
  const { isDarkMode, toggleTheme } = useTheme();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  // Badge counts (could be fetched from API)
  const badgeCounts: Record<string, number> = {
    'Reports': 2,
    'Orders': 3,
    'Cart': user?.role === 'CUSTOMER' ? getTotalItems() : 0,
  };

  // Determine menu items based on role
  let menuItems: Array<{ label: string; path: string; badge?: boolean }> = [];
  let roleLabel = '';
  if (user && user.role) {
    roleLabel = user.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const roleKey = getRoleKey(user.role);
    if (roleKey) menuItems = NAV_OPTIONS[roleKey].map(item => {
      if (item.label === 'Menu') {
        return {
          ...item,
          path: user.role === 'ADMIN' ? '/admin/menu' : item.path
        };
      }
      return item;
    });
  }
  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {      en: {
        home: 'Home',
        menu: 'Menu',
        myOrders: 'My Orders',
        branches: 'Branches',
        staff: 'Staff',
        restaurants: 'Restaurants',
        settings: 'Settings',
        reports: 'Reports',
        kitchen: 'Kitchen',
        orders: 'Orders',
        pos: 'POS',
        receipts: 'Receipts',
        login: 'Login',
        signup: 'Sign Up',
        logout: 'Logout',
        inventory: 'Inventory',
        menuItems: 'Menu Items',
        preferences: 'Preferences',
        customerFeedback: 'Customer Feedback'
      },      sv: {
        home: 'Hem',
        menu: 'Meny',
        myOrders: 'Mina Beställningar',
        branches: 'Restauranger',
        staff: 'Personal',
        restaurants: 'Restauranger',
        settings: 'Inställningar',
        reports: 'Rapporter',
        kitchen: 'Kök',
        orders: 'Beställningar',
        pos: 'Kassa',
        receipts: 'Kvitton',
        login: 'Logga In',
        signup: 'Registrera',
        logout: 'Logga Ut',
        inventory: 'Lager',
        menuItems: 'Menyartiklar',
        preferences: 'Inställningar',
        customerFeedback: 'Kundåterkoppling'
      },      es: {
        home: 'Inicio',
        menu: 'Menú',
        myOrders: 'Mis Pedidos',
        branches: 'Sucursales',
        staff: 'Personal',
        restaurants: 'Restaurantes',
        settings: 'Configuración',
        reports: 'Informes',
        kitchen: 'Cocina',
        orders: 'Pedidos',
        pos: 'TPV',
        receipts: 'Recibos',
        login: 'Iniciar Sesión',
        signup: 'Registrarse',
        logout: 'Cerrar Sesión',
        inventory: 'Inventario',
        menuItems: 'Artículos del Menú',
        preferences: 'Preferencias',
        customerFeedback: 'Comentarios de Clientes'
      },      de: {
        home: 'Startseite',
        menu: 'Speisekarte',
        myOrders: 'Meine Bestellungen',
        branches: 'Filialen',
        staff: 'Personal',
        restaurants: 'Restaurants',
        settings: 'Einstellungen',
        reports: 'Berichte',
        kitchen: 'Küche',
        orders: 'Bestellungen',
        pos: 'Kasse',
        receipts: 'Belege',
        login: 'Anmelden',
        signup: 'Registrieren',
        logout: 'Abmelden',
        inventory: 'Inventar',
        menuItems: 'Menüartikel',
        preferences: 'Einstellungen',
        customerFeedback: 'Kundenfeedback'
      },      fr: {
        home: 'Accueil',
        menu: 'Menu',
        myOrders: 'Mes Commandes',
        branches: 'Succursales',
        staff: 'Personnel',
        restaurants: 'Restaurants',
        settings: 'Paramètres',
        reports: 'Rapports',
        kitchen: 'Cuisine',
        orders: 'Commandes',
        pos: 'Caisse',
        receipts: 'Reçus',
        login: 'Se connecter',
        signup: 'S\'inscrire',
        logout: 'Déconnexion',
        inventory: 'Inventaire',
        menuItems: 'Articles du Menu',
        preferences: 'Préférences',
        customerFeedback: 'Commentaires Clients'
      }
    };
    return texts[language]?.[key] || texts.en[key] || key;
  };
  const getTranslatedLabel = (label: string) => {    const labelMap: Record<string, string> = {
      'Home': 'home',
      'Menu': 'menu',
      'My Orders': 'myOrders',
      'Branches': 'branches',
      'Staff': 'staff',
      'Restaurants': 'restaurants',
      'Settings': 'settings',
      'Reports': 'reports',
      'Kitchen': 'kitchen',
      'Orders': 'orders',
      'POS': 'pos',
      'Receipts': 'receipts',
      'Inventory': 'inventory',
      'Menu Items': 'menuItems',
      'Preferences': 'preferences',
      'Customer Feedback': 'customerFeedback'
    };
    const key = labelMap[label] || label.toLowerCase().replace(/\s+/g, '').replace('myorders', 'myOrders');
    return getText(key);
  };
  // SPACED-inspired navbar styles
  const navbarStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#0a0a0a',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    transition: 'all 0.3s ease'
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '0 60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '80px'
  };

  const logoStyle: React.CSSProperties = {
    fontSize: '1.4rem',
    fontWeight: '400',
    color: '#ffffff',
    textDecoration: 'none',
    letterSpacing: '4px',
    textTransform: 'uppercase',
    transition: 'opacity 0.3s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const navMenuStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    gap: '60px'
  };

  const navLinkStyle: React.CSSProperties = {
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: '400',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    position: 'relative',
    transition: 'opacity 0.3s ease',
    padding: '20px 0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const activeLinkStyle: React.CSSProperties = {
    ...navLinkStyle,
    opacity: 1
  };

  const userMenuStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '30px'
  };

  const roleStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const logoutButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    padding: '12px 24px',
    fontSize: '0.8rem',
    fontWeight: '400',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    borderRadius: '0',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };
  const mobileMenuStyle: React.CSSProperties = {
    display: menuOpen ? 'flex' : 'none',
    position: 'absolute',
    top: '80px',
    left: 0,
    right: 0,
    backgroundColor: '#0a0a0a',
    flexDirection: 'column',
    padding: '40px 60px',
    gap: '30px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
  };

  const hamburgerStyle: React.CSSProperties = {
    display: 'none',
    flexDirection: 'column',
    cursor: 'pointer',
    gap: '5px',
    padding: '15px 10px'
  };

  const hamburgerLineStyle: React.CSSProperties = {
    width: '24px',
    height: '1px',
    backgroundColor: '#ffffff',
    transition: 'all 0.3s ease'
  };

  const badgeStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    color: '#0a0a0a',
    fontSize: '0.65rem',
    fontWeight: '600',
    padding: '1px 5px',
    borderRadius: '2px',
    marginLeft: '8px',
    position: 'absolute',
    top: '-2px',
    right: '-12px'
  };

  const preferencesButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    padding: '8px 12px',
    fontSize: '0.8rem',
    fontWeight: '400',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    borderRadius: '0',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
  };

  const preferencesDropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: '#1a1a1a',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
    padding: '8px 0',
    minWidth: '180px',
    zIndex: 1000,
    display: preferencesOpen ? 'block' : 'none',
  };

  const preferencesItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    color: '#ffffff',
    fontSize: '0.8rem',
    fontWeight: '400',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const toggleSwitchStyle: React.CSSProperties = {
    position: 'relative',
    width: '40px',
    height: '20px',
    backgroundColor: isDarkMode ? '#4ade80' : '#6b7280',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  };

  const toggleSwitchHandleStyle: React.CSSProperties = {
    position: 'absolute',
    top: '2px',
    left: isDarkMode ? '22px' : '2px',
    width: '16px',
    height: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    transition: 'left 0.3s ease',
  };

  // Close preferences dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (preferencesOpen && !target.closest('[data-preferences-dropdown]')) {
        setPreferencesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [preferencesOpen]);

  return (
    <>      <nav style={navbarStyle}>
        <div style={containerStyle}>
          {/* Logo */}          <Link 
            to="/" 
            style={logoStyle}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            STEAKZ
          </Link>

          {/* Desktop Navigation */}
          <ul style={{ ...navMenuStyle, display: window.innerWidth <= 1024 ? 'none' : 'flex' }}>
            <li>
              <NavLink 
                to={user?.role === 'CASHIER' ? '/cashier' : '/'} 
                style={({ isActive }) => ({ 
                  ...navLinkStyle, 
                  opacity: isActive ? 1 : 0.7 
                })}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => {
                  const isActive = location.pathname === (user?.role === 'CASHIER' ? '/cashier' : '/');
                  e.currentTarget.style.opacity = isActive ? '1' : '0.7';
                }}
              >
                {getText('home')}
              </NavLink>
            </li>
            
            {!user && (
              <>
                <li>
                  <NavLink 
                    to="/login" 
                    style={({ isActive }) => ({ 
                      ...navLinkStyle, 
                      opacity: isActive ? 1 : 0.7 
                    })}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => {
                      const isActive = location.pathname === '/login';
                      e.currentTarget.style.opacity = isActive ? '1' : '0.7';
                    }}
                  >
                    {getText('login')}
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/signup" 
                    style={({ isActive }) => ({ 
                      ...navLinkStyle, 
                      opacity: isActive ? 1 : 0.7 
                    })}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => {
                      const isActive = location.pathname === '/signup';
                      e.currentTarget.style.opacity = isActive ? '1' : '0.7';
                    }}
                  >
                    {getText('signup')}
                  </NavLink>
                </li>
              </>
            )}
            
            {user && menuItems.filter(item => item.label !== 'Home').map(({ label, path, badge }) => (
              <li key={path} style={{ position: 'relative' }}>
                <NavLink
                  to={path}
                  style={({ isActive }) => ({ 
                    ...navLinkStyle, 
                    opacity: isActive ? 1 : 0.7 
                  })}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => {
                    const isActive = location.pathname === path;
                    e.currentTarget.style.opacity = isActive ? '1' : '0.7';
                  }}
                >
                  {getTranslatedLabel(label)}
                  {badge && badgeCounts[label] && (
                    <span style={badgeStyle}>{badgeCounts[label]}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>          {/* Language & User Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>            {/* Language Dropdown */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: '8px 12px',
                fontSize: '0.8rem',
                fontWeight: '400',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                borderRadius: '0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              <option value="en" style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>EN</option>
              <option value="sv" style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>SV</option>
              <option value="es" style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>ES</option>
              <option value="de" style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>DE</option>
              <option value="fr" style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>FR</option>            </select>            {/* Preferences Dropdown */}
            <div style={{ position: 'relative' }} data-preferences-dropdown>              <button
                onClick={() => setPreferencesOpen(!preferencesOpen)}
                style={preferencesButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                ⚙️ PREFS
              </button>
                <div style={preferencesDropdownStyle}>                <div
                  style={preferencesItemStyle}
                  onClick={() => {
                    toggleTheme();
                    setPreferencesOpen(false);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span>{isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}</span>
                  <div style={toggleSwitchStyle}>
                    <div style={toggleSwitchHandleStyle}></div>
                  </div>
                </div>
                
                <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    color: 'rgba(255, 255, 255, 0.5)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px',
                    marginBottom: '6px'
                  }}>
                    Currency
                  </div>                  <select
                    value={currency}
                    onChange={(e) => {
                      setCurrency(e.target.value);
                      setPreferencesOpen(false);
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      padding: '4px 8px',
                      fontSize: '0.7rem',
                      width: '100%',
                      borderRadius: '2px',
                      outline: 'none',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    <option value="EUR" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>EUR - Euro</option>
                    <option value="USD" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>USD - Dollar</option>
                    <option value="GBP" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>GBP - Pound</option>
                    <option value="SEK" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>SEK - Krona</option>
                    <option value="CHF" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>CHF - Franc</option>
                  </select>
                </div>
              </div>
            </div>

            {user && (
              <div style={userMenuStyle}>
                <span style={roleStyle}>{roleLabel}</span>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  style={logoutButtonStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  {getText('logout')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div 
            style={{ 
              ...hamburgerStyle, 
              display: window.innerWidth <= 1024 ? 'flex' : 'none' 
            }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div style={hamburgerLineStyle}></div>
            <div style={hamburgerLineStyle}></div>
            <div style={hamburgerLineStyle}></div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div style={mobileMenuStyle}>
          <NavLink 
            to={user?.role === 'CASHIER' ? '/cashier' : '/'} 
            style={navLinkStyle}
            onClick={() => setMenuOpen(false)}
          >
            {getText('home')}
          </NavLink>
          
          {!user && (
            <>
              <NavLink 
                to="/login" 
                style={navLinkStyle}
                onClick={() => setMenuOpen(false)}
              >
                {getText('login')}
              </NavLink>
              <NavLink 
                to="/signup" 
                style={navLinkStyle}
                onClick={() => setMenuOpen(false)}
              >
                {getText('signup')}              </NavLink>
            </>
          )}
            {/* Language Selection in Mobile */}
          <div style={{ padding: '20px 0', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <label style={{ 
              fontSize: '0.8rem', 
              color: 'rgba(255, 255, 255, 0.5)', 
              textTransform: 'uppercase', 
              letterSpacing: '1px',
              marginBottom: '10px',
              display: 'block'
            }}>
              Language
            </label>            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: '10px 15px',
                fontSize: '0.9rem',
                width: '100%',
                borderRadius: '0',
                outline: 'none'
              }}
            >
              <option value="en" style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>English</option>
              <option value="sv" style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>Svenska</option>
              <option value="es" style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>Español</option>
              <option value="de" style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>Deutsch</option>
              <option value="fr" style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>Français</option>            </select>
          </div>

          {/* Currency Selection in Mobile */}
          <div style={{ padding: '20px 0', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <label style={{ 
              fontSize: '0.8rem', 
              color: 'rgba(255, 255, 255, 0.5)', 
              textTransform: 'uppercase', 
              letterSpacing: '1px',
              marginBottom: '10px',
              display: 'block'
            }}>
              Currency
            </label>            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: '10px 15px',
                fontSize: '0.9rem',
                width: '100%',
                borderRadius: '0',
                outline: 'none'
              }}
            >
              <option value="EUR" style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>EUR - Euro</option>
              <option value="USD" style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>USD - Dollar</option>
              <option value="GBP" style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>GBP - Pound</option>
              <option value="SEK" style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>SEK - Krona</option>
              <option value="CHF" style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>CHF - Franc</option>
            </select>
          </div>

          {/* Theme Toggle in Mobile */}
          <div style={{ padding: '20px 0', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <label style={{ 
              fontSize: '0.8rem', 
              color: 'rgba(255, 255, 255, 0.5)', 
              textTransform: 'uppercase', 
              letterSpacing: '1px',
              marginBottom: '10px',
              display: 'block'
            }}>
              Theme
            </label>
            <div
              onClick={toggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 15px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </span>
              <div style={{...toggleSwitchStyle, transform: 'scale(0.8)'}}>
                <div style={toggleSwitchHandleStyle}></div>
              </div>
            </div>
          </div>
          
          {user && menuItems.filter(item => item.label !== 'Home').map(({ label, path, badge }) => (
            <NavLink
              key={path}
              to={path}
              style={navLinkStyle}
              onClick={() => setMenuOpen(false)}
            >
              {getTranslatedLabel(label)}
              {badge && badgeCounts[label] && (
                <span style={badgeStyle}>{badgeCounts[label]}</span>
              )}
            </NavLink>
          ))}
            {user && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
              <span style={roleStyle}>{roleLabel}</span>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                  setMenuOpen(false);
                }}
                style={{...logoutButtonStyle, width: 'fit-content'}}
              >
                {getText('logout')}
              </button>
            </div>
          )}
        </div>
      </nav>
      
      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div style={{ height: '80px' }}></div>

      <style>
        {`
          @media (max-width: 1024px) {
            .navbar-desktop { display: none !important; }
            .navbar-mobile { display: flex !important; }
          }
          
          @media (min-width: 1025px) {
            .navbar-desktop { display: flex !important; }
            .navbar-mobile { display: none !important; }
          }
        `}
      </style>
    </>
  );
};

export default Navbar;
