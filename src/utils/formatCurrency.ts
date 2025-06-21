export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    SEK: 'kr',
    CHF: 'CHF'
  };

  const symbol = currencySymbols[currency] || currency;
  
  if (currency === 'SEK' || currency === 'CHF') {
    return `${amount.toLocaleString()} ${symbol}`;
  }
  
  return `${symbol}${amount.toLocaleString()}`;
};

export const getTranslation = (key: string, language: string): string => {
  const translations: Record<string, Record<string, string>> = {    en: {
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      totalSales: 'Total Sales',
      dailySales: 'Daily Sales',
      todaysOrders: 'Today\'s Orders',
      monthlyRevenue: 'Monthly Revenue',
      customerSatisfaction: 'Customer Satisfaction',
      branchPerformance: 'Branch Performance',
      quickStats: 'Quick Stats',
      recentActivity: 'Recent Activity',
      viewAll: 'View All',
      generateReport: 'Generate Report',
      settings: 'Settings',
      logout: 'Logout'
    },
    sv: {
      welcome: 'Välkommen',
      dashboard: 'Instrumentpanel',
      totalSales: 'Total försäljning',
      dailySales: 'Daglig försäljning',
      todaysOrders: 'Dagens beställningar',
      monthlyRevenue: 'Månadsintäkter',
      customerSatisfaction: 'Kundnöjdhet',
      branchPerformance: 'Filialens prestanda',
      quickStats: 'Snabbstatistik',
      recentActivity: 'Senaste aktivitet',
      viewAll: 'Visa alla',
      generateReport: 'Generera rapport',
      settings: 'Inställningar',
      logout: 'Logga ut'
    },
    es: {
      welcome: 'Bienvenido',
      dashboard: 'Panel de control',
      totalSales: 'Ventas totales',
      dailySales: 'Ventas diarias',
      todaysOrders: 'Pedidos de hoy',
      monthlyRevenue: 'Ingresos mensuales',
      customerSatisfaction: 'Satisfacción del cliente',
      branchPerformance: 'Rendimiento de la sucursal',
      quickStats: 'Estadísticas rápidas',
      recentActivity: 'Actividad reciente',
      viewAll: 'Ver todo',
      generateReport: 'Generar informe',
      settings: 'Configuración',
      logout: 'Cerrar sesión'
    },    de: {
      welcome: 'Willkommen',
      dashboard: 'Dashboard',
      totalSales: 'Gesamtumsatz',
      dailySales: 'Täglicher Umsatz',
      todaysOrders: 'Heutige Bestellungen',
      monthlyRevenue: 'Monatsumsatz',
      customerSatisfaction: 'Kundenzufriedenheit',
      branchPerformance: 'Filialleistung',
      quickStats: 'Schnellstatistiken',
      recentActivity: 'Letzte Aktivität',
      viewAll: 'Alle anzeigen',
      generateReport: 'Bericht erstellen',
      settings: 'Einstellungen',
      logout: 'Abmelden'
    },
    fr: {
      welcome: 'Bienvenue',
      dashboard: 'Tableau de bord',
      totalSales: 'Ventes totales',
      dailySales: 'Ventes quotidiennes',
      todaysOrders: 'Commandes d\'aujourd\'hui',
      monthlyRevenue: 'Revenus mensuels',
      customerSatisfaction: 'Satisfaction client',
      branchPerformance: 'Performance de la succursale',
      quickStats: 'Statistiques rapides',
      recentActivity: 'Activité récente',
      viewAll: 'Voir tout',
      generateReport: 'Générer un rapport',
      settings: 'Paramètres',
      logout: 'Se déconnecter'
    }
  };

  return translations[language]?.[key] || translations.en[key] || key;
};
