import { useState,useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { requestNotificationPermission, listenForForegroundNotifications } from "../src/services/firebaseMessaging.js";
import LandingPage from "./screens/LandingPage.jsx";
import SignupScreen from "./screens/SignupScreen.jsx";
import LoginScreen from "./screens/LoginScreen.jsx";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen.jsx";
import VerifyEmailScreen from "./screens/VerifyEmailScreen.jsx";
import NewPasswordScreen from "./screens/NewPasswordScreen.jsx";
import PasswordUpdatedScreen from "./screens/PasswordUpdatedScreen.jsx";
import WelcomeOnboardingScreen from "./screens/WelcomeOnboardingScreen.jsx";

//is edits possible

export default function App() {
  const navigate = useNavigate();
  const [resetEmail, setResetEmail] = useState("");
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
              onLogin={() => navigate("/login")}
              onSignup={() => navigate("/signup")}
            />
          }
        />

        <Route
          path="/signup"
          element={
            <SignupScreen
              onSignup={() => navigate("/login")}
              onGoLogin={() => navigate("/login")}
            />
          }
        />

        <Route
          path="/login"
          element={
            <LoginScreen
              onLogin={() => navigate("/welcome-onboarding")}
              onGoSignup={() => navigate("/signup")}
              onForgotPassword={() => navigate("/forgot-password")}
            />
          }
        />

        <Route
          path="/forgot-password"
          element={
            <ForgotPasswordScreen
              onSendReset={(email) => {
                setResetEmail(email);
                navigate("/verify-email");
              }}

              onBack={() => navigate("/login")}
            />
          }
        />

        <Route
          path="/verify-email"
          element={
            <VerifyEmailScreen
              email={resetEmail}
              onConfirm={() => navigate("/new-password")}
              onBack={() => navigate("/login")}
              onChangeEmail={() => navigate("/forgot-password")}
            />
          }
        />

        <Route
          path="/new-password"
          element={
            <NewPasswordScreen
              email={resetEmail}
              onUpdate={() => navigate("/password-updated")}
              onBack={() => navigate("/login")}
            />
          }
        />

        <Route
          path="/password-updated"
          element={<PasswordUpdatedScreen onBack={() => navigate("/login")} />}
        />

        <Route
          path="/welcome-onboarding"
          element={<WelcomeOnboardingScreen onContinue={() => navigate("/")} />}
        />
      </Routes>
    </div>
  );
}
