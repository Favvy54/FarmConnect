import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { placeholder } from '@cloudinary/react';


const VARIANTS = {
  default: {
    border: 'border-border-muted', icon: 'text-ink',
    placeholder: 'placeholder:text-ink', text: 'text-body1',
    padding: 'pr-12 py-3',
    rounded: 'rounded-xl',
  },
  search: {
    border: 'border-2 border-border-fade',
    icon: 'text-grayscale',
    placeholder: 'placeholder:text-grayscale',
    text:'text-regular text-grayscale',
    padding: 'py-2',
    rounded: 'rounded-[21px]'
  },
  profile: {
    border: 'border-2 border-charcoal-200',
    text: 'text-grayscale text-body1',
    padding: 'pr-12 py-3',
    rounded: 'rounded-xl',
  },
};
export default function TextField({
  icon: Icon,
  type = 'text',
  variant = 'default',
  placeholder,
  isPassword = false,
  value,
  onChange,
  required = false,
  className = "w-full"
}) {
  const [show, setShow] = useState(false);
  const resolvedType = isPassword ? (show ? 'text' : 'password') : type;
    const styles = VARIANTS[variant] || VARIANTS.default

  return (
    <div className={`relative ${className}`}>
      {Icon && (
        <Icon
          className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${styles.icon}`}
        />
      )}
      <input
        type={resolvedType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`${styles.border} ${styles.text} ${styles.placeholder} ${styles.padding}
        ${styles.rounded}  w-full border x bg-white pl-12 focus:outline-none focus:border-2 focus:border-green-normal`}
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
