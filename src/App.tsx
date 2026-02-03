import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from '@/context/AppContext';
import { AppSwitcher } from '@/components/ui-custom';
import { LoginPage, RegisterPage } from '@/pages/Auth';

// User App Pages
import { HomePage, OrderFlow, TrackingPage, HistoryPage } from '@/pages/UserApp';

// Driver App Pages
import { DriverHome, JobBoard, ActiveJob } from '@/pages/DriverApp';

// Admin Console Pages
import { AdminDashboard, OrderQueue, DriverMonitor } from '@/pages/AdminConsole';

// Loading Screen
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"
      />
      <h1 className="text-2xl font-bold text-white">Jasa Suruh</h1>
      <p className="text-blue-100">Memuat...</p>
    </motion.div>
  </div>
);

// Main App Content
const AppContent: React.FC = () => {
  const { 
    isAuthenticated, 
    isLoading, 
    userType, 
    appMode, 
    currentPage, 
    setCurrentPage,
  } = useApp();
  
  const [showRegister, setShowRegister] = React.useState(false);

  // Note: appMode is now managed by AppContext based on userType

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show register page
  if (showRegister) {
    return <RegisterPage onBackToLogin={() => setShowRegister(false)} />;
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onRegisterClick={() => setShowRegister(true)} />;
  }

  // Render page based on current page and app mode
  const renderPage = () => {
    // User App Pages
    if (appMode === 'user') {
      switch (currentPage) {
        case 'home':
          return <HomePage />;
        case 'order-flow':
          return <OrderFlow />;
        case 'tracking':
          return <TrackingPage />;
        case 'history':
          return <HistoryPage />;
        default:
          return <HomePage />;
      }
    }

    // Driver App Pages
    if (appMode === 'driver') {
      switch (currentPage) {
        case 'driver-home':
        case 'home':
          return <DriverHome />;
        case 'job-board':
          return <JobBoard />;
        case 'active-job':
          return <ActiveJob />;
        default:
          return <DriverHome />;
      }
    }

    // Admin Console Pages
    if (appMode === 'admin') {
      switch (currentPage) {
        case 'admin-dashboard':
        case 'home':
          return <AdminDashboard />;
        case 'order-queue':
          return <OrderQueue />;
        case 'driver-monitor':
          return <DriverMonitor />;
        default:
          return <AdminDashboard />;
      }
    }

    return <HomePage />;
  };

  // Bottom Navigation for Mobile
  const renderBottomNav = () => {
    // Hide bottom nav on order-flow page
    if (currentPage === 'order-flow') return null;
    
    if (appMode === 'user') {
      return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 z-50 safe-area-bottom">
          <div className="max-w-lg mx-auto flex items-center justify-around">
            <NavButton 
              active={currentPage === 'home'}
              onClick={() => setCurrentPage('home')}
              icon={<HomeIcon />}
              label="Beranda"
            />
            <NavButton 
              active={currentPage === 'order-flow'}
              onClick={() => setCurrentPage('order-flow')}
              icon={<PlusIcon />}
              label="Order"
            />
            <NavButton 
              active={currentPage === 'history'}
              onClick={() => setCurrentPage('history')}
              icon={<HistoryIcon />}
              label="Riwayat"
            />
          </div>
        </nav>
      );
    }

    if (appMode === 'driver') {
      return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 z-50 safe-area-bottom">
          <div className="max-w-lg mx-auto flex items-center justify-around">
            <NavButton 
              active={currentPage === 'driver-home'}
              onClick={() => setCurrentPage('driver-home')}
              icon={<HomeIcon />}
              label="Beranda"
            />
            <NavButton 
              active={currentPage === 'job-board'}
              onClick={() => setCurrentPage('job-board')}
              icon={<PackageIcon />}
              label="Order"
            />
            <NavButton 
              active={currentPage === 'active-job'}
              onClick={() => setCurrentPage('active-job')}
              icon={<ActiveIcon />}
              label="Aktif"
            />
          </div>
        </nav>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App Switcher - Fixed Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <AppSwitcher />
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${appMode}-${currentPage}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="pb-20"
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Navigation */}
      {renderBottomNav()}
    </div>
  );
};

// Navigation Button Component
interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
      active 
        ? 'text-blue-600 bg-blue-50' 
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
    }`}
  >
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

// Icons
const HomeIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PackageIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const ActiveIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

// Root App Component
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
