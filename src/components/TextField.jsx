import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function TextField({
  icon: Icon,
  type = 'text',
  placeholder,
  isPassword = false,
  value,
  onChange,
  required = false,
}) {
  const [show, setShow] = useState(false)
  const resolvedType = isPassword ? (show ? 'text' : 'password') : type

  return (
    <div className="relative w-full">
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-body-text" />
      )}
      <input
        type={resolvedType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-ink bg-white pl-12 pr-12 py-2.5 text-body1 placeholder:text-ink focus:outline-none focus:border-2 focus:border-green-normal"
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-body-text"
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
  )
}
