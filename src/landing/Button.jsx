export default function Button({ label, icon: Icon, variant = 'filled', onClick, className = '' }) {
  const base =
    'flex items-center justify-center gap-1.5 rounded-2xl px-2 py-2 text-caption md:text-body1 font-medium transition-colors whitespace-nowrap'
  const styles = {
    filled: 'bg-green-normal text-white hover:bg-green-normal-hover active:bg-green-normal-active',
    outline: 'bg-transparent border-2 border-green-normal text-green-normal hover:bg-green-light',
    'filled-white': 'bg-white text-green-normal hover:bg-green-light',
  }

  return (
    <button onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>
      {Icon && <Icon className="w-4 h-4 md:w-5 md:h-5"/>}
      {label}
    </button>
  )
}
