import { useState } from "react";
import { forgotPassword } from "../services/auth.js";
import { Mail } from "lucide-react";
import AuthLayout from "../components/AuthLayout.jsx";
import TextField from "../components/TextField.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import BackToLogin from "../components/BackToLogin.jsx";

export default function ForgotPasswordScreen({ onSendReset, onBack }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <AuthLayout>
      <BackToLogin onClick={onBack} />
      <div>
        <h1 className="text-h2 font-bold text-ink">Forgot Password</h1>
        <p className="text-body1 text-body-text mt-3">
          No worries. Enter the email address associated with your account and
          we'll send you a password reset link.
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();

            if (!e.target.checkValidity()) {
              e.target.reportValidity();
              return;
            }

            try {
              setLoading(true);

              const data = await forgotPassword(email);

              console.log(data);

              onSendReset?.(email);
            } catch (error) {
              alert(error.message);
            } finally {
              setLoading(false);
            }
          }}
          className="mt-8 flex flex-col gap-8"
        >
          <TextField
            icon={Mail}
            placeholder="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PrimaryButton type="submit" disabled={loading} className="w-[35%] mx-auto rounded-2xl text-center py-4 mt-2">
            {loading ? "Sending..." : "Send Reset Link"}
          </PrimaryButton>
        </form>
      </div>
    </AuthLayout>
  );
}
