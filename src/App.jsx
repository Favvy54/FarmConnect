import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import {
  requestNotificationPermission,
  listenForForegroundNotifications,
} from '../src/services/firebaseMessaging.js';
import LandingPage from './Auth/LandingPage.jsx';
import SignupScreen from './Auth/SignupScreen.jsx';
import LoginScreen from './Auth/LoginScreen.jsx';
import ForgotPasswordScreen from './Auth/ForgotPasswordScreen.jsx';
import VerifyEmailScreen from './Auth/VerifyEmailScreen.jsx';
import NewPasswordScreen from './Auth/NewPasswordScreen.jsx';
import PasswordUpdatedScreen from './Auth/PasswordUpdatedScreen.jsx';
import WelcomeOnboardingScreen from './Auth/WelcomeOnboardingScreen.jsx';
import TermsAndConditionsScreen from './legal-pages/TermsAndConditionsScreen';
import PrivacyPolicyScreen from './legal-pages/PrivacyPolicyScreen.jsx';
import VendorProfileScreen from './pages/VendorProfileScreen.jsx';
import VendorDashboardScreen from './pages/VendorDashboardScreen.jsx';
import ManageListingScreen from './pages/ManageListingScreen.jsx';
import CreateListingScreen from './pages/CreateListingScreen.jsx';
import ListingDetailScreen from './pages/ListingDetailScreen.jsx';
import VendorReservations from './pages/VendorReservations';
import UserProfileScreen from './pages/UserProfile.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import MealDetailScreen from './pages/MealDetailScreen.jsx';
import UserListingsScreen from './pages/UserListingsScreen.jsx';
import ReservationsScreen from './pages/ReservationsScreen.jsx';
import ReservationDetailScreen from './pages/ReservationDetailScreen.jsx';
import { getRole } from './services/auth';
import { getCurrentUser } from './services/auth';
import { connectSocket } from './services/socket.js';

//is edits possible

export default function App() {
  const navigate = useNavigate();
  const [resetEmail, setResetEmail] = useState('');
  useEffect(() => {
    requestNotificationPermission();

    listenForForegroundNotifications();
  }, []);
  
  useEffect(() => {
  const token = getToken();

  if (!token) {
    console.log('ℹ️ No existing session token. Socket will connect after login.');
    return;
  }

  console.log('🔄 Existing session found. Connecting Socket.IO...');

  connectSocket(token);
}, []);

  return (
    <div>
      <Analytics />
      <SpeedInsights />
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              onLogin={() => navigate('/login')}
              onSignup={() => navigate('/signup')}
            />
          }
        />
        <Route
          path="/signup"
          element={
            <SignupScreen
              onSignup={() => navigate('/login')}
              onGoLogin={() => navigate('/login')}
            />
          }
        />
        <Route
          path="/login"
          element={
            <LoginScreen
              onLogin={async () => {
                try {
                  const role = getRole();
                  const user = await getCurrentUser();

                  if (!user.profileCompleted) {
                    // New user hasn't finished setting up their profile yet.
                    navigate('/welcome-onboarding');
                    return;
                  }

                  // Returning user skip onboarding, go straight to their dashboard.
                  if (role === 'vendor') {
                    navigate('/vendor/dashboard');
                  } else {
                    navigate('/user/dashboard');
                  }
                } catch (error) {
                  console.error(error);
                  navigate('/login');
                }
              }}
              onGoSignup={() => navigate('/signup')}
              onForgotPassword={() => navigate('/forgot-password')}
            />
          }
        />
        <Route
          path="/forgot-password"
          element={
            <ForgotPasswordScreen
              onSendReset={(email) => {
                setResetEmail(email);
                navigate('/verify-email');
              }}
              onBack={() => navigate('/login')}
            />
          }
        />
        <Route
          path="/verify-email"
          element={
            <VerifyEmailScreen
              email={resetEmail}
              onConfirm={() => navigate('/new-password')}
              onBack={() => navigate('/login')}
              onChangeEmail={() => navigate('/forgot-password')}
            />
          }
        />
        <Route
          path="/new-password"
          element={
            <NewPasswordScreen
              email={resetEmail}
              onUpdate={() => navigate('/password-updated')}
              onBack={() => navigate('/login')}
            />
          }
        />
        <Route
          path="/password-updated"
          element={<PasswordUpdatedScreen onBackToLogin={() => navigate('/login')} />}
        />
        <Route
          path="/welcome-onboarding"
          element={
            <WelcomeOnboardingScreen
              onContinue={() => {
                const role = getRole();

                if (role === 'vendor') {
                  navigate('/vendor/profile');
                } else {
                  navigate('/user/profile');
                }
              }}
            />
          }
        />
        <Route path="/terms" element={<TermsAndConditionsScreen />} />
        <Route path="/privacy" element={<PrivacyPolicyScreen />} />
        <Route
          path="/vendor/profile"
          element={
            <VendorProfileScreen
              onComplete={() => navigate('/vendor/dashboard')}
            />
          }
        />
        <Route
          path="/vendor/dashboard"
          element={
            <VendorDashboardScreen
              onCreateListing={() => navigate('/vendor/create-listing')}
              onManageListing={() => navigate('/vendor/listings')}
              onManageReservation={() => navigate('/vendor/reservations')}
              onViewAnalytics={() => {}}
              onNavigate={(key) => {
                if (key === 'home') navigate('/vendor/dashboard');
                if (key === 'listings') navigate('/vendor/listings');
                if (key === 'reservations') navigate('/vendor/reservations');
              }}
              onLogout={() => navigate('/login')}
            />
          }
        />
        <Route
          path="/vendor/listings"
          element={
            <ManageListingScreen
              onCreateListing={() => navigate('/vendor/create-listing')}
              onEditListing={(l) =>
                navigate('/vendor/create-listing', {
                  state: { editListing: l.raw },
                })
              }
              onNavigate={(key) => {
                if (key === 'home') navigate('/vendor/dashboard');
                if (key === 'listings') navigate('/vendor/listings');
                if (key === 'reservations') navigate('/vendor/reservations');
              }}
              onLogout={() => navigate('/login')}
            />
          }
        />
        <Route
          path="/vendor/create-listing"
          element={
            <CreateListingScreen
              onBack={() => navigate('/vendor/listings')}
              onNavigate={(key, state) => {
                if (key === 'home') navigate('/vendor/dashboard');
                if (key === 'listings') navigate('/vendor/listings', { state });
                if (key === 'reservations') navigate('/vendor/reservations');
              }}
              onLogout={() => navigate('/login')}
            />
          }
        />

        <Route
          path="/vendor/listings/:id"
          element={
            <ListingDetailScreen
              onNavigate={(key) => {
                if (key === 'home') navigate('/vendor/dashboard');
                if (key === 'listings') navigate('/vendor/listings');
                if (key === 'reservations') navigate('/vendor/reservations');
                if (key === 'settings') navigate('/vendor/settings');
              }}
              onEditListing={(l) =>
                navigate('/vendor/create-listing', {
                  state: { editListing: l.raw },
                })
              }
              onLogout={() => navigate('/login')}
            />
          }
        />

        <Route
          path="/vendor/reservations"
          element={
            <VendorReservations
              onNavigate={(key) => {
                if (key === 'home') navigate('/vendor/dashboard');
                if (key === 'listings') navigate('/vendor/listings');
                if (key === 'reservations') navigate('/vendor/reservations');
              }}
              onLogout={() => navigate('/login')}
            />
          }
        />

        <Route
          path="/user/profile"
          element={
            <UserProfileScreen onComplete={() => navigate('/user/dashboard')} />
          }
        />
        <Route
          path="/user/dashboard"
          element={
            <UserDashboard
              onNavigate={(key) => {
                if (key === 'home') navigate('/user/dashboard');
                if (key === 'listings') navigate('/user/listings');
                if (key === 'reservations') navigate('/user/reservations');
              }}
              onLogout={() => navigate('/login')}
            />
          }
        />
        <Route
          path="/user/meal/:id"
          element={
            <MealDetailScreen
              onNavigate={(key) => {
                if (key === 'home') navigate(-1);
                if (key === 'listings') navigate('/user/listings');
                if (key === 'reservations') navigate('/user/reservations');
              }}
              onLogout={() => navigate('/login')}
            />
          }
        />
        <Route
          path="/user/listings"
          element={
            <UserListingsScreen
              onNavigate={(key) => {
                if (key === 'home') navigate('/user/dashboard');
                if (key === 'listings') navigate('/user/listings');
                if (key === 'reservations') navigate('/user/reservations');
              }}
              onLogout={() => navigate('/login')}
            />
          }
        />
        <Route
          path="/user/reservations"
          element={
            <ReservationsScreen
              onNavigate={(key) => {
                if (key === 'home') navigate('/user/dashboard');
                if (key === 'listings') navigate('/user/listings');
                if (key === 'reservations') navigate('/user/reservations');
              }}
              onLogout={() => navigate('/login')}
            />
          }
        />
        <Route
          path="/user/reservations/:id"
          element={
            <ReservationDetailScreen
              onNavigate={(key) => {
                if (key === 'home') navigate('/user/dashboard');
                if (key === 'listings') navigate('/user/listings');
                if (key === 'reservations') navigate('/user/reservations');
              }}
              onLogout={() => navigate('/login')}
            />
          }
        />
      </Routes>
    </div>
  );
}
