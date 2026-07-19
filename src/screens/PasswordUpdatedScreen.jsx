import AuthLayout from '../components/AuthLayout.jsx'
import PrimaryButton from '../components/PrimaryButton.jsx'
import CheckMark from "../assets/images/Done_ring_round.png"

export default function PasswordUpdatedScreen({ onBackToLogin }) {
  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center">
        <img src= {CheckMark} className="w-45 h-45 text-green-normal mb-6" strokeWidth={1.5} />
        <h1 className="text-h2 font-bold text-ink">Password Updated</h1>
        <p className="text-body1 text-body-text mt-3">
          Your password has been successfully reset.
        </p>
        <PrimaryButton onClick={onBackToLogin} className="mt-8">
          Back to Login
        </PrimaryButton>
      </div>
    </AuthLayout>
  )
}
