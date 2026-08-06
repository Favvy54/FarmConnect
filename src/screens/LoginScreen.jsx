import { useState } from "react";
import { login } from "../services/auth.js";
import { requestNotificationPermission, listenForForegroundNotifications } from "../services/firebaseMessaging.js";
import { registerDeviceWithBackend } from "../notification.js";
import { logEvent } from "firebase/analytics";
import { messaging, analytics } from "../firebase.js";
import { Mail, Lock } from "lucide-react";
import AuthLayout from "../components/AuthLayout.jsx";
import TextField from "../components/TextField.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import notify from "../services/toast";

export default function LoginScreen({ onLogin, onGoSignup, onForgotPassword }) {
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <AuthLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-h2 font-bold text-ink">Welcome Back</h1>
        <p className="text-body1 text-body-text mt-3">
          Sign in to continue finding or sharing meals.
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();

            if (!e.target.checkValidity()) {
              e.target.reportValidity();
              return;
            }

            const toastId = notify.loading("Logging you in...");

            try {
              setLoading(true);
            
              const data = await login(email, password);
            
              logEvent(analytics, "login", {
                method: "email",
                role: data.user.role,
              });
            
              const fcmToken = await requestNotificationPermission();
            
              if (fcmToken) {
                await registerDeviceWithBackend(fcmToken, data.token);
              }
            
              listenForForegroundNotifications();
            
              notify.dismiss(toastId);
              notify.success("Login successful.");
            
              onLogin?.(data);
            
            } catch (error) {
              notify.dismiss(toastId);
              notify.error(error.message);
            } finally {
              setLoading(false);
            }
          }}
          className="mt-8 flex flex-col gap-4"
        >
          <TextField
            icon={Mail}
            placeholder="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            icon={Lock}
            placeholder="Password"
            isPassword
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center justify-between text-body2">
            <label className="flex items-center gap-2 text-ink">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-green-normal"
            >
              Forgot password?
            </button>
          </div>

          <PrimaryButton type="submit"  disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </PrimaryButton>

          <button
            type="button"
            onClick={onGoSignup}
            className="text-center text-body1 text-green-normal"
          >
            Don't have an account? Create one
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
