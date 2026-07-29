import { useState } from "react";
import { register } from "../services/auth.js";
import { logEvent } from "firebase/analytics";
import { analytics } from "../firebase.js";
import { User, Mail, Phone, Lock, User as UserIcon, Store } from "lucide-react";
import AuthLayout from "../components/AuthLayout.jsx";
import TextField from "../components/TextField.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import { auth } from "../libs/cloudinaryImages.js";

export default function SignupScreen({ onSignup, onGoLogin }) {
  const [role, setRole] = useState("find"); // 'find' | 'share'
  const [agreed, setAgreed] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!e.target.checkValidity()) {
      e.target.reportValidity();
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    setPasswordError("");

    try {
      setLoading(true);

      const data = await register({
        fullName,
        email,
        password,
        confirmPassword,
        phone,
        role: role === "find" ? "user" : "vendor",
      });

      logEvent(analytics, "sign_up", {
        method: "email",
        role: role === "find" ? "user" : "vendor",
      });

      console.log(data);

      onSignup?.(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      showTagline={false}
      showLogo={false}
      photoFit="fi"
      rightAlign="items-start"
      photoSrc={auth.signup}
      photoAlt="Vendor plating a meal while a customer reserves it on their phone, with nearby, reserved, and pickup deadline callouts">
      <div>
        <h1 className="text-h2 font-bold text-ink leading-tight">
          <span className="text-green-normal">Create your</span>
          <br />
          FarmConnect account
        </h1>
        <p className="text-body1 text-body-text mt-4">
          Join FarmConnect to share surplus food, discover affordable meals, and
          help reduce food waste.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <TextField
            icon={User}
            placeholder="Full name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <TextField
            icon={Mail}
            placeholder="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            icon={Phone}
            placeholder="Phone Number"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            icon={Lock}
            placeholder="Password"
            isPassword
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div>
            <TextField
              icon={Lock}
              placeholder="Confirm Password"
              isPassword
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {passwordError && (
              <p className="text-caption text-error mt-1">{passwordError}</p>
            )}
          </div>

          <div>
            <p className="text-body1 text-ink mb-3">I am signing up as</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('find')}
                className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-3 transition-colors
                ${role === 'find' ? 'border-green-normal bg-green-light' : 'border-border-muted'}`}>
                <UserIcon className="w-5 h-5 text-ink" />
                <span className="text-body1 text-ink">I want to find food</span>
                <span className="text-caption text-body-text">
                  For students, families, etc.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole('share')}
                className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-3 transition-colors
                ${role === 'share' ? 'border-green-normal bg-green-light' : 'border-border-muted'}`}>
                <Store className="w-5 h-5 text-ink" />
                <span className="text-body1 text-ink">
                  I want to share food
                </span>
                <span className="text-caption text-body-text">
                  For caterers, restaurants, etc.
                </span>
              </button>
            </div>
          </div>

          <label className="flex items-start text-body2 text-ink mt-2">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              required
              className="mt-1"
            />
            <span className="ml-2">
              I agree to the{' '}
              <a href="#" className="text-green-normal">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-green-normal">
                Privacy Policy
              </a>
            </span>
          </label>

          <PrimaryButton type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </PrimaryButton>

          <button
            type="button"
            onClick={onGoLogin}
            className="text-center text-body1 text-green-normal">
            Already have an account? Log in
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
