export default function Button({ label, icon: Icon, variant = 'filled', onClick, className = '' }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-body1 font-medium transition-colors whitespace-nowrap'
  const styles = {
    filled: 'bg-green-normal text-white hover:bg-green-normal-hover active:bg-green-normal-active',
    outline: 'bg-transparent border-2 border-green-normal text-green-normal hover:bg-green-light',
    'filled-white': 'bg-white text-green-normal hover:bg-green-light',
  }

  return (
    <button onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>
      {Icon && <Icon className="w-5 h-5"/>}
      {label}
    </button>
  )
}
