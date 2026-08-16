import { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export default function SuccessToast({ title, message, onClose, duration= 3000 }) {
    useEffect(() => {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }, [onClose, duration]);
  
  return (
    <div className="fixed right-6 top-6 z-100 w-full max-w-md rounded-2xl bg-green-light p-4 shadow-xl">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-light">
          <CheckCircle2 className="h-6 w-6 text-green-normal" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-regular text-green-normal">{title}</h3>

          <p className="mt-1 text-sm text-green-normal">{message}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-body-text hover:text-ink">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
