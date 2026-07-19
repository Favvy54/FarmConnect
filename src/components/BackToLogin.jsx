import { ArrowLeft } from 'lucide-react'

export default function BackToLogin({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-10 flex items-center gap-2 text-green-normal font-medium text-body1 mb-10"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to Login
    </button>
  )
}
