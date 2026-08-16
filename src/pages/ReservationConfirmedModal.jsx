import { useState, useEffect } from 'react';
import { CircleCheckBig, X } from 'lucide-react';

export default function ReservationConfirmedModal({
  holdMinutes = 60,
  pickupDeadlineLabel,
  onClose,
  onViewReservation,
}) {
  const [secondsLeft, setSecondsLeft] = useState(holdMinutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(
    2,
    '0',
  );
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 ">
      <div className="relative bg-white rounded-2xl p-8 max-w-sm w-full text-center">
        <button onClick={onClose} className="absolute top-4 right-4">
          <X className="w-5 h-5 text-ink" />
        </button>

        <CircleCheckBig
          className="w-25 h-25 text-green-normal mx-auto mb-4"
          strokeWidth={1.5}
        />

        <h2 className="text-h4 font-bold text-ink">Reservation Confirmed</h2>
        <p className="text-normal text-ink mt-2">
          Your meal has been reserved for the next
        </p>

        <p className="text-h1 font-bold text-green-normal my-4">
          {hours}:{minutes}:{seconds}
        </p>

        <p className="text-body1 text-charcoal mb-6">
          Collect your meal before {pickupDeadlineLabel}.
        </p>

        <button
          onClick={onViewReservation}
          className="w-full rounded-xl bg-green-normal hover:bg-green-normal-hover text-white text-body1 font-medium py-3 transition-colors">
          View My Reservation
        </button>
      </div>
    </div>
  );
}
