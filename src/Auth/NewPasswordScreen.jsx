import { useState } from "react";
import { resetPassword } from "../services/auth.js";
import { Lock } from "lucide-react";
import AuthLayout from "../components/AuthLayout.jsx";
import TextField from "../components/TextField.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import BackToLogin from "../components/BackToLogin.jsx";

export default function NewPasswordScreen({onUpdate, onBack }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

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

      const data = await resetPassword(password, confirmPassword);

      console.log(data);

      onUpdate?.();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <BackToLogin onClick={onBack} />
      <div>
        <h1 className="text-h2 font-bold text-ink">Create a New Password</h1>
        <p className="text-body1 text-body-text mt-3">
          Your identity has been verified. Create a new password to secure your
          account.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          <TextField
            icon={Lock}
            placeholder="Password"
            isPassword
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError("");
            }}
          />
          <div>
            <TextField
              icon={Lock}
              placeholder="Confirm Password"
              isPassword
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
            />
            {passwordError && (
              <p className="text-caption text-error mt-1">{passwordError}</p>
            )}
          </div>
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </PrimaryButton>
        </form>
      </div>
    </AuthLayout>
  );
}
