import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import '../pages/styles/Home.css';

const NotFound: React.FC = () => {
  const { t } = useSettings();
  
  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '80px' }}>
      <h1 style={{ fontSize: '5rem', marginBottom: '1rem' }}>404</h1>
      <h2>{t('pageNotFound')}</h2>
      <p>{t('pageNotFoundDesc')}</p>
      <Link to="/" className="btn" style={{ marginTop: '2rem' }}>
        {t('backToHome')}
      </Link>
    </div>
  );
};

export default NotFound;
