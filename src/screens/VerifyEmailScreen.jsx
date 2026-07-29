import { useRef, useState, useEffect } from 'react';
import { verifyOtp } from '../services/auth.js';
import AuthLayout from '../components/AuthLayout.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import BackToLogin from '../components/BackToLogin.jsx';

const CODE_LENGTH = 6;

export default function VerifyEmailScreen({
  email,
  onConfirm,
  onBack,
  onChangeEmail,
}) {
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(20);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < CODE_LENGTH - 1) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  return (
    <AuthLayout>
      <BackToLogin onClick={onBack} />
      <div className="w-full">
        <h1 className="text-h2 font-bold text-ink">Verify your Email</h1>
        <p className="text-body1 text-body-text mt-3">
          We've sent a 6-digit verification code to{' '}
          <span className="text-green-normal">{email}</span>
        </p>
        <p className="text-body1 text-body-text mt-1">
          Enter the code below to continue.
        </p>

        <div className="flex gap-2 w-100%  md:gap-5 justify-center mt-8">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              maxLength={1}
              inputMode="numeric"
              className="w-14 h-15 text-center text-h2 border-2 border-ink/40 rounded-xl focus:outline-none focus:border-2 focus:border-green-normal mb-8"
            />
          ))}
        </div>

        <PrimaryButton
          onClick={async () => {
            const otp = digits.join('');

            if (otp.length !== 6) {
              alert('Please enter the complete OTP.');
              return;
            }

            try {
              setLoading(true);

              const data = await verifyOtp(email, otp);

              console.log(data);

              onConfirm?.();
            } catch (error) {
              alert(error.message);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}>
          {loading ? 'Verifying...' : 'Confirm code'}
        </PrimaryButton>

        <div className="text-center mt-4 text-body2">
          {secondsLeft > 0 ? (
            <span className="text-body-text">
              Resend code{' '}
              <span className="text-ink">in {secondsLeft} seconds</span>
            </span>
          ) : (
            <button
              onClick={() => setSecondsLeft(20)}
              className="text-green-normal">
              Resend code
            </button>
          )}
        </div>
        <div className="text-center mt-2 text-body2 text-ink">
          Wrong email?{' '}
          <button onClick={onChangeEmail} className="text-green-normal">
            Change email
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
