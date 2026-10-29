import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './services/auth/authContext';
import { TopNavbar } from './components/layout/TopNavbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/public/LandingPage';
import { RegistrationForm } from './components/public/RegistrationForm';
import { TrackingPage } from './components/public/TrackingPage';
import { DocumentVerificationPage } from './components/public/DocumentVerificationPage';
import { StaffLoginPage } from './components/auth/StaffLoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DirectorDashboard } from './components/director/DirectorDashboard';
import { ShelterDashboard } from './components/shelter/ShelterDashboard';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { TestRunnerModal } from './components/testing/TestRunnerModal';
import { LaravelCodeViewerModal } from './components/laravel/LaravelCodeViewerModal';

const AppContent: React.FC = () => {
  const { currentRole } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('public_landing');
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState<boolean>(false);
  const [isLaravelCodeOpen, setIsLaravelCodeOpen] = useState<boolean>(false);
  const [verificationToken, setVerificationToken] = useState<string | undefined>(undefined);

  // Check URL query parameters for QR code verification (?verify=TOKEN)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('verify');
    if (token) {
      setVerificationToken(token);
      setActiveTab('public_verify');
    }
  }, []);

  // When role changes, align default tab
  useEffect(() => {
    if (currentRole === 'public') {
      if (!['public_landing', 'public_register', 'public_track', 'public_verify', 'login'].includes(activeTab)) {
        setActiveTab('public_landing');
      }
    } else if (currentRole === 'health_admin') {
      if (!['admin_dashboard', 'admin_verified_queue', 'public_landing'].includes(activeTab)) {
        setActiveTab('admin_dashboard');
      }
    } else if (currentRole === 'director') {
      if (!['director_dashboard', 'director_signed_letters', 'public_landing'].includes(activeTab)) {
        setActiveTab('director_dashboard');
      }
    } else if (currentRole === 'shelter_admin') {
      if (!['shelter_dashboard', 'shelter_rooms', 'shelter_occupancy', 'public_landing'].includes(activeTab)) {
        setActiveTab('shelter_dashboard');
      }
    } else if (currentRole === 'super_admin') {
      if (!['superadmin_dashboard', 'superadmin_users', 'superadmin_doc_reqs', 'superadmin_audit', 'public_landing'].includes(activeTab)) {
        setActiveTab('superadmin_dashboard');
      }
    }
  }, [currentRole]);

  const isInternalRole = currentRole !== 'public';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* Top Navbar */}
      <TopNavbar
        onOpenTestRunner={() => setIsTestRunnerOpen(true)}
        onOpenLaravelCode={() => setIsLaravelCodeOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar for Internal Staff Roles */}
        {isInternalRole && (
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        )}

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            
            {/* PUBLIC VIEWS */}
            {activeTab === 'public_landing' && (
              <LandingPage
                onStartRegistration={() => setActiveTab('public_register')}
                onOpenTracking={() => setActiveTab('public_track')}
                onOpenVerification={() => setActiveTab('public_verify')}
                onOpenLogin={() => setActiveTab('login')}
              />
            )}

            {activeTab === 'public_register' && (
              <RegistrationForm
                onSuccess={(app, code) => {
                  // Handled in receipt view
                }}
                onCancel={() => setActiveTab('public_landing')}
              />
            )}

            {activeTab === 'public_track' && (
              <TrackingPage
                onBackToHome={() => setActiveTab('public_landing')}
                onOpenVerificationToken={(token) => {
                  setVerificationToken(token);
                  setActiveTab('public_verify');
                }}
              />
            )}

            {activeTab === 'public_verify' && (
              <DocumentVerificationPage
                initialToken={verificationToken}
                onBack={() => {
                  setVerificationToken(undefined);
                  setActiveTab('public_landing');
                }}
              />
            )}

            {/* DEDICATED STAFF LOGIN PAGE */}
            {activeTab === 'login' && (
              <StaffLoginPage
                onSuccessLogin={(targetTab) => setActiveTab(targetTab)}
                onBackToPublic={() => setActiveTab('public_landing')}
              />
            )}

            {/* HEALTH ADMIN VIEWS */}
            {(activeTab === 'admin_dashboard' || activeTab === 'admin_verified_queue') && (
              <AdminDashboard />
            )}

            {/* DIRECTOR VIEWS */}
            {(activeTab === 'director_dashboard' || activeTab === 'director_signed_letters') && (
              <DirectorDashboard />
            )}

            {/* SHELTER ADMIN VIEWS */}
            {(activeTab === 'shelter_dashboard' || activeTab === 'shelter_rooms' || activeTab === 'shelter_occupancy') && (
              <ShelterDashboard />
            )}

            {/* SUPER ADMIN VIEWS */}
            {(activeTab === 'superadmin_dashboard' ||
              activeTab === 'superadmin_users' ||
              activeTab === 'superadmin_doc_reqs' ||
              activeTab === 'superadmin_audit') && <SuperAdminDashboard />}

          </div>
        </main>
      </div>

      {/* Automated QA Test Runner Modal */}
      <TestRunnerModal
        isOpen={isTestRunnerOpen}
        onClose={() => setIsTestRunnerOpen(false)}
      />

      {/* Interactive Laravel Source Code Viewer */}
      <LaravelCodeViewerModal
        isOpen={isLaravelCodeOpen}
        onClose={() => setIsLaravelCodeOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
