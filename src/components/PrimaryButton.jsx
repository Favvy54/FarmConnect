export default function PrimaryButton({ children, onClick, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full rounded-2xl bg-green-normal hover:bg-green-normal-hover active:bg-green-normal-active text-white text-body1 font-medium py-4 transition-colors ${className}`}
    >
      {children}
    </button>
  )
}
