export default function PrimaryButton({ children, onClick, type = 'button', className = 'w-full rounded-2xl text-center py-4 mt-2' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${className} bg-green-normal hover:bg-green-normal-hover active:bg-green-normal-active text-white text-body1 font-medium transition-colors`}
    >
      {children}
    </button>
  )
}
