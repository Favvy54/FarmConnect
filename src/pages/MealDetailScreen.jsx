import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { Clock, Timer, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { getAllListings } from '../services/auth.js';

// Same derivation used on ManageListingScreen / UserDashboardScreen.
function computeMsLeft(listing) {
  let expiry = null;

  if (listing?.expiresAt) {
    expiry = new Date(listing.expiresAt);
  } else if (listing?.createdAt && listing?.expiryDuration != null) {
    expiry = new Date(
      new Date(listing.createdAt).getTime() + listing.expiryDuration * 60000
    );
  }

  if (!expiry) return 0;
  return Math.max(0, expiry - new Date());
}

function formatCountdown(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

function MiniMealCard({ listing, onClick }) {
  const image = listing.imageUrls?.[0] || '/img-placeholder.png';
  const mealsLeft = Math.max(
    0,
    (listing.quantity || 0) - (listing.totalReservations || 0)
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-60 shrink-0 rounded-2xl border border-border-muted bg-white overflow-hidden shadow-sm flex flex-col text-left">
      <img src={image} alt={listing.foodName} className="h-32 w-full object-cover" />
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-body1 font-bold text-ink truncate">{listing.foodName}</p>
        <p className="text-body2 text-charcoal truncate">
          {listing.vendorName || listing.vendorId?.businessName}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-body1 font-semibold text-green-normal">
            {listing.isFree ? 'Free' : `₦${listing.price}`}
          </span>
          <span
            className={
              mealsLeft <= 3
                ? 'text-caption font-medium text-error'
                : 'text-caption text-charcoal'
            }>
            {mealsLeft} left
          </span>
        </div>
      </div>
    </button>
  );
}

export default function MealDetailScreen({ onNavigate, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // Passed via navigate(path, { state: { listing } }) from the dashboard card click.
  const [listing, setListing] = useState(location.state?.listing || null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [msLeft, setMsLeft] = useState(() => computeMsLeft(location.state?.listing));
  const [moreListings, setMoreListings] = useState([]);

  // If someone lands here directly (refresh / shared link) with no state,
  // there's currently no "get one listing by id" endpoint to fall back on.
  // Flagging this clearly rather than pretending it works.
  const missingListing = !listing;

  useEffect(() => {
    if (!listing) return;
    const interval = setInterval(() => {
      setMsLeft(computeMsLeft(listing));
    }, 1000);
    return () => clearInterval(interval);
  }, [listing]);

  useEffect(() => {
    (async () => {
      try {
        const all = await getAllListings();
        const filtered = (Array.isArray(all) ? all : [])
          .filter((l) => l._id !== id)
          .slice(0, 6);
        setMoreListings(filtered);
      } catch {
        setMoreListings([]);
      }
    })();
  }, [id]);

  if (missingListing) {
    return (
      <DashboardLayout
        active="home"
        onNavigate={onNavigate}
        onLogout={onLogout}
        title="Meal not found"
        subtitle="This listing couldn't be loaded directly — go back and select it from the dashboard.">
        <button
          onClick={() => navigate(-1)}
          className="mt-4 flex items-center gap-2 text-body1 font-medium text-green-normal">
          <ChevronLeft className="h-4 w-4" /> Back to home
        </button>
      </DashboardLayout>
    );
  }

  const images = listing.imageUrls?.length ? listing.imageUrls : ['/img-placeholder.png'];
  const mealsLeft = Math.max(
    0,
    (listing.quantity || 0) - (listing.totalReservations || 0)
  );
  const isExpired = msLeft <= 0;

  return (
    <DashboardLayout
      active="home"
      onNavigate={onNavigate}
      onLogout={onLogout}
      title={listing.foodName}
      subtitle="">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-body1 font-medium text-green-normal">
        <ChevronLeft className="h-4 w-4" /> Back to home
      </button>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* LEFT — image, title, description */}
        <div>
          <div className="relative overflow-hidden rounded-2xl border border-border-muted">
            <img
              src={images[activeImage]}
              alt={listing.foodName}
              className="h-72 w-full object-cover sm:h-96"
            />
            <span className="absolute left-3 bottom-3 rounded-full bg-orange-dark px-3 py-1 text-caption font-semibold text-white">
              {mealsLeft} meals left
            </span>
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex justify-center gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === activeImage ? 'bg-green-normal' : 'bg-border-muted'
                  }`}
                />
              ))}
            </div>
          )}

          <h1 className="mt-4 text-xl font-bold text-ink">{listing.foodName}</h1>
          <p className="text-body1 text-charcoal">
            {listing.vendorName || listing.vendorId?.businessName}
          </p>
          {listing.category && (
            <span className="mt-2 inline-block rounded-full bg-green-light px-3 py-1 text-caption font-medium text-green-normal">
              {listing.category}
            </span>
          )}

          {listing.description && (
            <div className="mt-6">
              <h2 className="mb-2 text-lg font-semibold text-ink">About this meal</h2>
              <p className="text-body1 text-body-text">{listing.description}</p>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-border-muted p-5">
            <h2 className="mb-3 text-lg font-semibold text-ink">Pickup Information</h2>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-body-text" />
              <p className="text-body1 text-ink">
                {listing.pickupLocation || 'Pickup location unavailable'}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT — price, countdown, reservation */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border-muted bg-white p-5">
            <p className="text-2xl font-bold text-green-normal">
              {listing.isFree ? 'Free' : `₦${listing.price}`}
            </p>
            <p className="text-caption text-charcoal">per meal</p>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-orange-normal p-4">
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4.75 w-4.75 text-orange-dark" />
                <div>
                  <p className="text-normal font-medium text-orange-dark">
                    Pickup Deadline
                  </p>
                  <p className="text-caption text-orange-dark">
                    {isExpired ? 'This listing has expired' : 'Today'}
                  </p>
                </div>
              </div>
              {!isExpired && (
                <div className="text-right">
                  <p className="text-caption text-orange-dark">Ends in</p>
                  <p className="font-mono text-body2 font-semibold text-orange-dark">
                    {formatCountdown(msLeft)}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-xl bg-green-light p-4">
              <Timer className="mt-0.5 h-4.75 w-4.75 shrink-0 text-green-normal" />
              <div>
                <p className="text-body2 font-medium text-green-normal">Reservation Hold</p>
                <p className="text-caption text-green-normal">
                  Your reservation would be held for 1 hour
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-body1 font-semibold text-ink">Quantity</p>
              <div className="flex items-center justify-between rounded-full border border-border-muted px-4 py-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(0, q - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-green-normal text-white">
                  −
                </button>
                <span className="text-body1 font-medium text-ink">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(mealsLeft, q + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-green-normal text-white">
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={quantity === 0 || isExpired}
              // TODO: wire to a real reservation endpoint once backend confirms one
              onClick={() => alert('Reservation flow not wired up yet — no backend endpoint confirmed.')}
              className="mt-4 w-full rounded-xl bg-green-normal py-3 text-body1 font-semibold text-white disabled:opacity-50">
              {isExpired ? 'Listing Expired' : 'Reserve Meal'}
            </button>
          </div>
        </div>
      </div>

      {moreListings.length > 0 && (
        <div className="mt-8 rounded-2xl border border-border-muted bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">More Listing</h2>
            <button
              onClick={() => onNavigate?.('listings')}
              className="text-body2 font-medium text-green-normal">
              View more <ChevronRight className="inline-block h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden pb-2">
            {moreListings.map((l) => (
              <MiniMealCard
                key={l._id}
                listing={l}
                onClick={() =>
                  navigate(`/user/meal/${l._id}`, { state: { listing: l } })
                }
              />
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
