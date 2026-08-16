import { useState, useEffect } from 'react';
import { X, Timer, Calendar, Clock, MapPin, Info } from 'lucide-react';
import { createReservation } from '../services/auth';
import ReservationConfirmedModal from '../pages/ReservationConfirmedModal';


function computeMsLeft(listing) {
  let expiry = null;

  if (listing?.expiresAt) {
    expiry = new Date(listing.expiresAt);
  } else if (listing?.createdAt && listing?.expiryDuration != null) {
    expiry = new Date(
      new Date(listing.createdAt).getTime() + listing.expiryDuration * 60000,
    );
  }

  if (!expiry) return null;
  return Math.max(0, expiry - new Date());
}

export function formatDeadlineTime(listing) {
  let expiry = null;
  if (listing?.expiresAt) {
    expiry = new Date(listing.expiresAt);
  } else if (listing?.createdAt && listing?.expiryDuration != null) {
    expiry = new Date(
      new Date(listing.createdAt).getTime() + listing.expiryDuration * 60000,
    );
  }
  if (!expiry) return 'Not set';
  return expiry.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function ReserveMealModal({
  listing,
  isOpen,
  onClose,
  onNavigate }) {
  const [quantity, setQuantity] = useState(0);
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState(null);
  const [confirmedReservation, setConfirmedReservation] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setQuantity(0);
      setReserveError(null);
      setConfirmedReservation(null);
    }
  }, [isOpen, listing?.id]);

  if (!isOpen || !listing) return null;

  const image = listing.imageUrls?.[0] || '/img-placeholder.png';
  const mealsLeft = Math.max(
    0,
    (listing.quantity || 0) - (listing.totalReservations || 0),
  );
  const remainingAfterSelection = mealsLeft - quantity;
  const totalPrice = listing.isFree ? 0 : (listing.price || 0) * quantity;
  const deadlineTime = formatDeadlineTime(listing);
  const msLeft = computeMsLeft(listing);
  const isExpired = msLeft !== null && msLeft <= 0;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: undefined,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

 const handleReserve = async () => {
   setReserveError(null);
   setReserving(true);
   try {
     const res = await createReservation({
       listingId: listing.listingId,
       quantityRequested: quantity,
     });
     setConfirmedReservation(res?.data || res);
   } catch (err) {
     setReserveError(err.message || 'Could not complete your reservation.');
   } finally {
     setReserving(false);
   }
 };

  
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />

      {/* Panel — full screen on mobile, slide-in from the right on larger screens */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border-muted px-5 py-4">
          <h2 className="text-lg font-bold text-ink">Reserve Meal</h2>
          <button onClick={onClose} className="text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <img
            src={image}
            alt={listing.foodName}
            className="h-48 w-full rounded-2xl object-cover"
          />

          <div className="mt-4 flex items-start gap-3 rounded-xl bg-green-light p-4">
            <Timer className="mt-0.5 h-5 w-5 shrink-0 text-green-normal" />
            <div>
              <p className="text-normal font-medium text-green-normal">
                Reservation Hold
              </p>
              <p className="text-body2 text-green-normal">
                Your reservation would be held for 1 hour
              </p>
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-body1 font-semibold text-ink">Quantity</p>
            <div className="flex items-center justify-between rounded-full border border-border-muted px-4 py-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(0, q - 1))}
                disabled={quantity === 0}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-green-normal text-white disabled:opacity-40">
                −
              </button>
              <span className="text-body1 font-medium text-ink">
                {quantity}
              </span> 
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(mealsLeft, q + 1))}
                disabled={quantity >= mealsLeft}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-green-normal text-white disabled:opacity-40">
                +
              </button>
            </div>
            <p className="mt-1 text-caption text-body-text">
              {remainingAfterSelection} more left
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-border-muted p-4">
            <h3 className="mb-3 text-body1 font-bold text-ink">
              Pickup Information
            </h3>

            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-body-text" />
              <div>
                <p className="text-body2 font-medium text-ink">Pickup Today</p>
                <p className="text-caption text-body-text">{today}</p>
              </div>
            </div>

            <div className="mt-3 flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-body-text" />
              <div>
                <p className="text-body2 font-medium text-ink">
                  Pickup Deadline
                </p>
                <p className="text-caption text-body-text">
                  {deadlineTime ? `Today, by ${deadlineTime}` : 'Not set'}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-body-text" />
              <p className="text-body2 text-ink">
                {listing.pickupLocation || 'Pickup location unavailable'}
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-xl bg-[#FFB948]/16 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-orange-dark" />

            <div className='flex flex-col gap-1'>
              <p className="text-orange-dark text-normal font-medium">
                Important note
              </p>
              <p className="text-orange-dark text-body2 font-medium">
                Please arrive before the reservation hold expires. Your
                reservation would be cancelled id not picked on time
              </p>
            </div>

          </div>

          <div className="mt-5 flex items-center justify-between">
            <span className="text-body1 font-semibold text-ink">
              Total Price:
            </span>
            <span className="text-body1 font-bold text-ink">
              {listing.isFree ? 'Free' : `₦${totalPrice.toLocaleString()}`}
            </span>
          </div>

          {reserveError && (
            <p className="mt-3 text-body2 text-error">{reserveError}</p>
          )}

          <button
            type="button"
            onClick={handleReserve}
            disabled={quantity === 0 || isExpired || reserving}
            className="mt-4 w-full rounded-xl bg-green-normal py-3 text-body1 font-semibold text-white disabled:opacity-50">
            {isExpired
              ? 'Listing Expired'
              : reserving
                ? 'Reserving...'
                : 'Reserve Meal'}
          </button>
          <p className="mt-2 text-center text-caption text-body-text">
            You won't be charged yet.
          </p>
        </div>
      </div>

      {confirmedReservation && (
              <ReservationConfirmedModal
                holdMinutes={60}
                pickupDeadlineLabel={formatDeadlineTime(listing) || 'the deadline'}
                onClose={() => setConfirmedReservation(null)}
                onViewReservation={() => {
                  setConfirmedReservation(null);
                  onNavigate?.('reservations');
                }}
              />
            )}
    </>
  );
}
