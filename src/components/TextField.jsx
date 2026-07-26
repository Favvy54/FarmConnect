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
  className="py-"
}) {
  const [show, setShow] = useState(false)
  const resolvedType = isPassword ? (show ? 'text' : 'password') : type

  return (
    <div className="relative w-full">
      {Icon && (
        <Icon
          className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
            type === 'search' ? 'text-grayscale' : 'text-ink'
          }`}
        />
      )}
      <input
        type={resolvedType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full border bg-white pl-12 focus:outline-none focus:border-2 focus:border-green-normal
          ${type === 'search' ? 'rounded-[21px] placeholder:text-grayscale text-regular  border-border-fade py-2' : 'rounded-xl placeholder:text-ink text-body1 pr-12  border-ink py-3'}`}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-body-text">
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
}
