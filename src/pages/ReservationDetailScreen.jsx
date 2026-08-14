import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Info,
  CircleX,
  CircleCheck,
  MapPin,
  Package,
  Clock,
  Hash,
  CreditCard,
  Trash2,
  ArrowRight,
  CircleXIcon,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { cancelReservation } from '../services/auth.js';

function formatDateTime(date) {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatCountdown(ms) {
  if (ms <= 0) return '00:00';
  const totalMinutes = Math.floor(ms / 60000);
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const secs = Math.floor((ms % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return hrs > 0 ? `${hrs}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
}

// Business rule: reservations expire 60 minutes after reservedAt. There's
// no separate deadline field on the reservation object — it's computed.
function getDeadline(reservation) {
  if (!reservation?.reservedAt) return null;
  return new Date(new Date(reservation.reservedAt).getTime() + 60 * 60000);
}

const STATUS_CONFIG = {
  reserved: {
    label: 'Active Reservation',
    panelClass: 'bg-green-light',
    labelClass: 'text-green-normal',
    dotClass: 'bg-green-normal',
  },
  completed: {
    label: 'Completed',
    panelClass: 'bg-green-light',
    labelClass: 'text-green-normal',
    dotClass: 'bg-green-normal',
  },
  cancelled: {
    label: 'Cancelled',
    panelClass: 'bg-error-light',
    labelClass: 'text-error',
    dotClass: 'bg-error',
  },
  expired: {
    label: 'Expired',
    panelClass: 'bg-orange-normal',
    labelClass: 'text-orange-dark',
    dotClass: 'bg-orange-dark',
  },
};

export default function ReservationDetailScreen({ onNavigate, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [reservation, setReservation] = useState(location.state?.reservation || null);
  const [msLeft, setMsLeft] = useState(0);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const deadline = getDeadline(reservation);

  useEffect(() => {
    if (!reservation || reservation.status !== 'reserved' || !deadline) return;
    const update = () => setMsLeft(Math.max(0, deadline - new Date()));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [reservation, deadline]);

  const handleCancel = async () => {
    if (!reservation) return;
    setCancelError(null);
    setCancelling(true);
    try {
      await cancelReservation(reservation.reservationId || reservation._id);
      setReservation((prev) => ({ ...prev, status: 'cancelled' }));
    } catch (err) {
      setCancelError(err.message || 'Could not cancel this reservation.');
    } finally {
      setCancelling(false);
    }
  };

  if (!reservation) {
    return (
      <DashboardLayout
        active="reservations"
        role="user"
        onNavigate={onNavigate}
        onLogout={onLogout}
        title="Reservation not found"
        subtitle="This reservation couldn't be loaded directly — go back and select it from your reservations list.">
        <button
          onClick={() => navigate(-1)}
          className="mt-4 flex items-center gap-2 text-body1 font-medium text-green-normal">
          <ArrowLeft className="h-4 w-4" /> Back to reservations
        </button>
      </DashboardLayout>
    );
  }

  const status = reservation.status || 'reserved';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.reserved;
  const image = reservation.listing?.imageUrls?.[0] || '/img-placeholder.png';
  const vendorName = reservation.vendor?.businessName || 'Vendor';

  const pickupBadge = {
    reserved: { icon: Clock, text: 'Pickup Today', className: 'bg-green-light text-green-normal' },
    completed: { icon: CircleCheck, text:'Pickup Completed', className: 'bg-green-light text-green-normal' },
    cancelled: {icon: CircleX, text: 'Pickup Cancelled', className: 'bg-error-light text-error' },
    expired: { icon: Info, text: 'Pickup Expired', className: 'bg-orange-badge text-orange-dark' },
  }[status];

  return (
    <DashboardLayout
      active="reservations"
      role="user"
      onNavigate={onNavigate}
      onLogout={onLogout}
      title=""
      subtitle="">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-body1 font-medium text-green-normal">
        <ArrowLeft className="h-4 w-4" /> Back to reservation
      </button>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* LEFT — meal + status */}
        <div className="rounded-2xl border border-border-muted bg-white p-5">
          <div className="flex items-start gap-4">
            <img
              src={image}
              alt={reservation.foodName}
              className="h-28 w-28 shrink-0 rounded-xl object-cover"
            />
            <div>
              <h1 className="text-lg font-bold text-ink">{reservation.foodName}</h1>
              <p className="text-body1 text-charcoal">{vendorName}</p>
              {pickupBadge && (
                <span
                  className={`mt-2 inline-block rounded-full px-3 py-1 text-caption font-medium ${pickupBadge.className}`}>
                  {pickupBadge.text}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — status panel */}
        <div className={`rounded-2xl p-6 text-center ${config.panelClass}`}>
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />
            <span className={`text-body1 font-semibold ${config.labelClass}`}>
              {config.label}
            </span>
          </div>

          <div className="mx-auto flex justify-center">
            {status === 'reserved' && (
              <div className="text-center">
                <p className="text-caption text-body-text">Expires in</p>
                <p className="font-mono text-xl font-bold text-green-normal">
                  {formatCountdown(msLeft)}
                </p>
              </div>
            )}
            {status === 'completed' && <img src='/completed.png'></img>}
            {status === 'cancelled' && <img src='/cancelled.png'></img>}
            {status === 'expired' && <img src='/expired.png'></img>}
          </div>

          <p className="mt-4 text-body1 font-semibold text-ink">
            {status === 'reserved' && deadline
              ? `Pickup before ${deadline.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
              : status === 'completed'
                ? `Completed on ${formatDateTime(reservation.completedAt)}`
                : status === 'cancelled'
                  ? `Cancelled${reservation.cancellationReason ? `: ${reservation.cancellationReason}` : ''}`
                  : status === 'expired'
                    ? `Expired on ${formatDateTime(deadline)}`
                    : ''}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Pickup Location + Reservation Summary */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border-muted bg-white p-5">
            <h2 className="mb-3 flex items-center gap-2 text-body1 font-bold text-ink">
              <MapPin className="h-5 w-5 text-green-normal" /> Pickup Location
            </h2>
            <p className="font-medium text-ink">{vendorName}</p>
            <p className="mt-1 text-body2 text-body-text">
              {reservation.pickupLocation || 'Pickup location unavailable'}
            </p>
            {/* No maps integration wired up yet — placeholder only */}
            <div className="mt-3 flex h-32 items-center justify-center rounded-xl bg-green-light/40">
              <MapPin className="h-8 w-8 text-green-normal" />
            </div>
          </div>

          <div className="rounded-2xl border border-border-muted bg-white p-5">
            <h2 className="mb-3 text-body1 font-bold text-ink">Reservation Summary</h2>
            <div className="divide-y divide-border-muted">
              <div className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2 text-body2 text-body-text">
                  <Package className="h-4 w-4 text-green-normal" /> Quantity
                </span>
                <span className="text-body2 font-medium text-ink">
                  {reservation.quantityRequested} Packs
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2 text-body2 text-body-text">
                  <Clock className="h-4 w-4 text-green-normal" /> Reserved At
                </span>
                <span className="text-body2 font-medium text-ink">
                  {formatDateTime(reservation.reservedAt)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2 text-body2 text-body-text">
                  <Clock className="h-4 w-4 text-green-normal" /> Pickup Deadline
                </span>
                <span className="text-body2 font-medium text-ink">
                  {formatDateTime(deadline)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2 text-body2 text-body-text">
                  <Hash className="h-4 w-4 text-green-normal" /> Reservation ID
                </span>
                <span className="text-body2 font-medium text-ink">
                  {reservation.reservationId}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2 text-body2 text-body-text">
                  <CreditCard className="h-4 w-4 text-green-normal" /> Pickup Code
                </span>
                <span className="text-body2 font-medium text-ink">
                  {reservation.pickupCode || '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Collection Instructions + Cancel */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border-muted bg-white p-3">
            <h2 className="mb-3 text-body1 font-bold text-ink">Collection Instruction</h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-body2 text-ink">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-normal" />
                Arrive before the pickup deadline.
              </li>
              <li className="flex items-start gap-2 text-body2 text-ink">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-normal" />
                Tell the vendor your reservation name or code.
              </li>
              <li className="flex items-start gap-2 text-body2 text-ink">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-normal" />
                Collect your food before the timer ends.
              </li>
            </ul>
          </div>

          {status === 'reserved' && (
            <div className="rounded-2xl border border-border-muted bg-white p-5">
              {cancelError && (
                <p className="mb-3 text-body2 text-red-500">{cancelError}</p>
              )}
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="flex w-full items-center justify-between text-left disabled:opacity-50">
                <span className="flex items-center gap-2 font-medium text-red-500">
                  <Trash2 className="h-4 w-4" />
                  {cancelling ? 'Cancelling...' : 'Cancel Reservation'}
                </span>
                <ArrowRight className="h-4 w-4 text-red-500" />
              </button>
              <p className="mt-1 text-caption text-body-text">
                Release your reserved meal back to the listing.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
