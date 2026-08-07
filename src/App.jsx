import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import {
  requestNotificationPermission,
  listenForForegroundNotifications,
} from '../src/services/firebaseMessaging.js';
import LandingPage from './screens/LandingPage.jsx';
import SignupScreen from './screens/SignupScreen.jsx';
import LoginScreen from './screens/LoginScreen.jsx';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen.jsx';
import VerifyEmailScreen from './screens/VerifyEmailScreen.jsx';
import NewPasswordScreen from './screens/NewPasswordScreen.jsx';
import PasswordUpdatedScreen from './screens/PasswordUpdatedScreen.jsx';
import WelcomeOnboardingScreen from './screens/WelcomeOnboardingScreen.jsx';
import TermsAndConditionsScreen from './legal-pages/TermsAndConditionsScreen';
import PrivacyPolicyScreen from './legal-pages/PrivacyPolicyScreen.jsx';
import VendorProfileScreen from './pages/VendorProfileScreen.jsx';
import VendorDashboardScreen from './pages/VendorDashboardScreen.jsx';
import ManageListingScreen from './pages/ManageListingScreen.jsx';
import CreateListingScreen from './pages/CreateListingScreen.jsx';
import UserProfileScreen from './pages/UserProfile.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import MealDetailScreen from './pages/MealDetailScreen.jsx';
import { getRole } from './services/auth';
import { getCurrentUser } from "./services/auth";

//is edits possible

export default function App() {
  const navigate = useNavigate();
  const [resetEmail, setResetEmail] = useState('');
  useEffect(() => {
    requestNotificationPermission();

    listenForForegroundNotifications();
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
              onLogin={() => navigate('/welcome-onboarding')}
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
          element={<PasswordUpdatedScreen onBack={() => navigate('/login')} />}
        />

        <Route
          path="/welcome-onboarding"
          element={
            <WelcomeOnboardingScreen
              onContinue={async () => {
                try {
                  const role = getRole();

                  const user = await getCurrentUser();

                  if (role === 'vendor') {
                    if (user.profileCompleted) {
                      navigate('/vendor/dashboard');
                    } else {
                      navigate('/vendor/profile');
                    }
                  } else {
                    if (user.profileCompleted) {
                      navigate('/user/dashboard');
                    } else {
                      navigate('/user/profile');
                    }
                  }
                } catch (error) {
                  console.error(error);
                  navigate('/login');
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
              onManageReservation={() => navigate('/vendor/dashboard')}
              onViewAnalytics={() => {}}
              onNavigate={(key) => {
                if (key === 'home') navigate('/vendor/dashboard');
                if (key === 'listings') navigate('/vendor/listings');
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
              onEditListing={() => {}}
              onNavigate={(key) => {
                if (key === 'home') navigate('/vendor/dashboard');
                if (key === 'listings') navigate('/vendor/listings');
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
              onNavigate={(key) => {
                if (key === 'home') navigate('/vendor/dashboard');
                if (key === 'listings') navigate('/vendor/listings');
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
                if (key === 'home') navigate('/user/dashboard');
                if (key === 'listings') navigate('/user/listings');
              }}
              onLogout={() => navigate('/login')}
            />
          }
        />
      </Routes>
    </div>
  );
}
