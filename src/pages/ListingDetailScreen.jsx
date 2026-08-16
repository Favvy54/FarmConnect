import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Package,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { getVendorReservations, getVendorProfile } from '../services/auth.js';

const statusStyles = {
  ACTIVE: 'bg-green-light text-green-normal',
  'SOLD OUT': 'bg-orange-light text-orange-dark',
  EXPIRED: 'bg-gray-100 text-gray-500',
  CANCELLED: 'bg-red-100 text-red-500',
};

function formatDeadline(listing) {
  let expiry = null;
  if (listing?.expiresAt) {
    expiry = new Date(listing.expiresAt);
  } else if (listing?.createdAt && listing?.expiryDuration != null) {
    expiry = new Date(
      new Date(listing.createdAt).getTime() + listing.expiryDuration * 60000,
    );
  }
  if (!expiry) return 'Not set';
  return expiry.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatCreated(listing) {
  if (!listing?.createdAt) return '—';
  return new Date(listing.createdAt).toLocaleString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ListingDetailScreen({
  onNavigate,
  onEditListing,
  onLogout,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Passed via navigate(path, { state: { listing: l.raw } }) from a row
  // click on ManageListingScreen.
  const listing = location.state?.listing || null;
  const displayStatus = location.state?.status || null;

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    if (!listing) return;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const [vendorResponse, reservationsResponse] = await Promise.all([
          getVendorProfile(),
          getVendorReservations(),
        ]);

        setVendor(vendorResponse?.data || vendorResponse);

        const all =
          reservationsResponse?.data?.reservations ||
          reservationsResponse?.data ||
          reservationsResponse ||
          [];

        const forThisListing = (Array.isArray(all) ? all : []).filter((r) => {
          const listingId =
            typeof r.listing === 'string' ? r.listing : r.listing?._id;

          return listingId === listing._id;
        });

        setReservations(forThisListing);
      } catch (err) {
        setError(err.message || 'Could not load listing information.');
      } finally {
        setLoading(false);
      }
    })();
  }, [listing]);

  if (!listing) {
    return (
      <DashboardLayout
        active="listings"
        onNavigate={onNavigate}
        onLogout={onLogout}
        title="Listing not found"
        subtitle="This listing couldn't be loaded directly — go back and select it from Manage Listings."
        location={vendor?.currentLocation || 'Location unavailable'}
        profileImage={vendor?.profileImage}>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 flex items-center gap-2 text-body1 font-medium text-green-normal">
          <ArrowLeft className="h-4 w-4" /> Back to Listing
        </button>
      </DashboardLayout>
    );
  }

  const available = Math.max(
    0,
    (listing.quantity || 0) - (listing.totalReservations || 0),
  );
  const reserved = listing.totalReservations || 0;
  const total = listing.quantity || 0;
  const percentReserved = total > 0 ? Math.round((reserved / total) * 100) : 0;

  const completedCount = reservations.filter(
    (r) => r.status === 'completed',
  ).length;
  const pendingCount = reservations.filter(
    (r) => r.status === 'reserved',
  ).length;
  const expiredCount = reservations.filter(
    (r) => r.status === 'expired',
  ).length;

  const recentReservations = reservations.slice(0, 4);

  return (
    <DashboardLayout
      active="listings"
      onNavigate={onNavigate}
      onLogout={onLogout}
      title=""
      subtitle=""
      location={vendor?.currentLocation || 'Location unavailable'}
      profileImage={vendor?.profileImage}>
      <div className="my-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-body1 font-medium text-green-normal">
          <ArrowLeft className="h-4 w-4" /> Back to Listing
        </button>

        <button
          type="button"
          onClick={() => onEditListing?.({ raw: listing })}
          className="rounded-xl border border-border-muted px-4 py-2 text-sm font-medium text-ink hover:bg-surface-secondary">
          Edit Listing
        </button>
      </div>

      {error && <p className="mb-4 text-body2 text-red-500">{error}</p>}

      {/* Listing header card */}
      <div className="rounded-2xl border border-border-muted bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row">
          <img
            src={listing.imageUrls?.[0] || '/img-placeholder.png'}
            alt={listing.foodName}
            className="h-40 w-full shrink-0 rounded-xl object-cover sm:w-56"
          />

          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-bold text-ink">{listing.foodName}</h1>
              {displayStatus && (
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-body2 font-medium ${
                    statusStyles[displayStatus] || ''
                  }`}>
                  {displayStatus}
                </span>
              )}
            </div>

            <p className="mt-1 text-body2 text-body-text">
              Created on {formatCreated(listing)}
            </p>

            <p className="mt-3 text-2xl font-bold text-ink">
              {listing.isFree ? 'Free' : `₦${listing.price?.toLocaleString()}`}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <p className="text-caption text-body-text">Category</p>
                <p className="text-body1 font-medium text-ink">
                  {listing.category}
                </p>
              </div>
              <div>
                <p className="text-caption text-body-text">Pick up deadline</p>
                <p className="text-body1 font-medium text-ink">
                  {formatDeadline(listing)}
                </p>
              </div>
            </div>

            {listing.description && (
              <div className="mt-4">
                <p className="text-caption text-body-text">Description</p>
                <p className="text-body1 text-ink">{listing.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* LEFT — performance + summary */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border-muted bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold text-ink">
              Listing Performance
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border-muted p-3">
                <p className="flex items-center gap-1 text-caption text-body-text">
                  <Package className="h-3.5 w-3.5" /> Total Quantity
                </p>
                <p className="mt-1 text-lg font-bold text-ink">{total} Meals</p>
              </div>
              <div className="rounded-xl border border-border-muted p-3">
                <p className="flex items-center gap-1 text-caption text-body-text">
                  <Users className="h-3.5 w-3.5" /> Reserved
                </p>
                <p className="mt-1 text-lg font-bold text-ink">
                  {reserved} Meals
                </p>
              </div>
              <div className="rounded-xl border border-border-muted p-3">
                <p className="flex items-center gap-1 text-caption text-body-text">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Available
                </p>
                <p className="mt-1 text-lg font-bold text-ink">
                  {available} Meals
                </p>
              </div>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-border-muted">
              <div
                className="h-full rounded-full bg-green-normal"
                style={{ width: `${percentReserved}%` }}
              />
            </div>
            <p className="mt-1 text-caption text-body-text">
              {percentReserved}% of food reserved
            </p>
          </div>

          <div className="rounded-2xl border border-border-muted bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold text-ink">
              Reservation Summary
            </h2>
            <div className="divide-y divide-border-muted">
              <div className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2 text-body2 text-body-text">
                  <Calendar className="h-4 w-4 text-green-normal" /> Total
                  Reservation
                </span>
                <span className="text-body2 font-medium text-ink">
                  {reservations.length}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2 text-body2 text-body-text">
                  <CheckCircle2 className="h-4 w-4 text-green-normal" />{' '}
                  Completed Pickups
                </span>
                <span className="text-body2 font-medium text-ink">
                  {completedCount}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2 text-body2 text-body-text">
                  <Clock className="h-4 w-4 text-orange-normal" /> Pending
                  Pickups
                </span>
                <span className="text-body2 font-medium text-ink">
                  {pendingCount}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2 text-body2 text-body-text">
                  <AlertCircle className="h-4 w-4 text-red-500" /> Expired
                </span>
                <span className="text-body2 font-medium text-ink">
                  {expiredCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — recent reservations */}
        <div className="rounded-2xl border border-border-muted bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">
              Recent Reservations
            </h2>
            <button
              onClick={() => onNavigate?.('reservations')}
              className="flex items-center gap-1 text-body2 font-medium text-green-normal">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {loading ? (
            <p className="text-body-text">Loading…</p>
          ) : recentReservations.length === 0 ? (
            <p className="text-body-text">No reservations yet.</p>
          ) : (
            <div className="space-y-4">
              {recentReservations.map((r) => (
                <div
                  key={r._id || r.reservationId}
                  className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-light text-body1 font-semibold text-green-normal">
                    {(r.user?.fullName || 'U')[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-body1 font-bold text-ink">
                      {r.user?.fullName || 'User'}
                    </p>
                    <p className="text-caption text-body-text">
                      {r.reservedAt
                        ? new Date(r.reservedAt).toLocaleTimeString([], {
                            hour: 'numeric',
                            minute: '2-digit',
                          })
                        : '—'}
                    </p>
                  </div>
                  <span className="rounded-full bg-green-light px-3 py-1 text-caption font-medium capitalize text-green-normal">
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
