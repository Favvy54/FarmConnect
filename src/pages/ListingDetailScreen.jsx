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
  MoreVertical,
  Trash2
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import {
  getVendorReservations,
  getVendorProfile,
  deleteListing,
  getListingDetails,
} from '../services/auth.js';

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
  return expiry.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
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

function DeleteConfirmDialog({ onCancel, onConfirm, deleting, error }) {
  return (
    <div className="bg-black/40 fixed flex inset-0 items-center justify-center p-4 z-50">
      <div className="bg-white max-w-sm p-6 rounded-3xl shadow-xl text-center w-full">
        <div className="border-2 border-red-500 flex h-14 items-center justify-center mb-4 mx-auto rounded-full w-14">
          <Trash2 className="h-6 text-red-500 w-6" />
        </div>

        <h3 className="font-bold text-ink text-xl">Delete Listing?</h3>
        <p className="mt-2 text-body-text text-body2">
          This action cannot be undone. All listing details and data will
          permanently removed.
        </p>

        {error && <p className="mt-3 text-body2 text-red-500">{error}</p>}

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="border border-border-muted disabled:opacity-50 flex-1 font-medium hover:bg-surface-secondary px-4 py-3 rounded-xl text-ink text-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="bg-red-500 disabled:opacity-50 flex-1 font-semibold hover:bg-red-600 px-4 py-3 rounded-xl text-sm text-white">
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
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
  const [listingDetails, setListingDetails] = useState(null);

  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    if (!listing) return;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const [vendorResponse, detailsResponse] = await Promise.all([
          getVendorProfile(),
          getListingDetails(listing.listingId),
        ]);

        setVendor(vendorResponse?.data || vendorResponse);

        const details =
          detailsResponse?.data ||
          detailsResponse;

        setListingDetails(details);

        setReservations(
          details?.recentReservations || []
        );

      } catch (err) {
        setError(
          err.message ||
          'Could not load listing information.',
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [listing]);

  const handleDelete = async () => {
    setDeleteError(null);
    setDeleting(true);
    try {
    await deleteListing(listing.listingId);
      navigate('/vendor/listings', {
        state: { success: 'Listing Deleted' },
      });
    } catch (err) {
      setDeleteError(err.message || 'Could not delete this listing.');
      setDeleting(false);
    }
  };

  if (!listing) {
    return (
      <DashboardLayout
        active="listings"
        onNavigate={onNavigate}
        onLogout={onLogout}
        title="Listing not found"
        subtitle="This listing couldn't be loaded directly — go back and select it from Manage Listings.">
        <button
          onClick={() => navigate(-1)}
          className="flex font-medium gap-2 items-center mt-4 text-body1 text-green-normal">
          <ArrowLeft className="h-4 w-4" /> Back to Listing
        </button>
      </DashboardLayout>
    );
  }

  const total =
    listingDetails?.totalQuantity || 0;

  const reserved =
    listingDetails?.reservedQuantity || 0;

  const available =
    listingDetails?.availableQuantity || 0;

  const percentReserved =
    listingDetails?.reservedPercentage || 0;

  const totalReservations =
    listingDetails?.reservationSummary?.totalReservations || 0;

  const completedCount =
    listingDetails?.reservationSummary?.completedPickups || 0;

  const pendingCount =
    listingDetails?.reservationSummary?.pendingPickups || 0;

  const expiredCount =
    listingDetails?.reservationSummary?.expired || 0;
  
  const recentReservations = reservations.slice(0, 4);

  return (
    <DashboardLayout
      active="listings"
      onNavigate={onNavigate}
      onLogout={onLogout}
      hideTopBar
    >
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex font-medium gap-1 items-center text-body1 text-green-normal">
          <ArrowLeft className="h-4 w-4" /> Back to Listing
        </button>

        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={() => onEditListing?.({ raw: listing })}
            className="border border-border-muted font-medium hover:bg-surface-secondary px-4 py-2 rounded-xl text-ink text-sm">
            Edit Listing
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu((v) => !v)}
              className="border border-border-muted flex h-9 hover:bg-surface-secondary items-center justify-center rounded-xl text-ink w-9">
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute bg-white border border-border-muted mt-2 overflow-hidden right-0 rounded-xl shadow-lg w-44 z-20">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="flex font-medium gap-2 hover:bg-red-50 items-center px-4 py-3 text-left text-red-500 text-sm w-full">
                    <Trash2 className="h-4 w-4" />
                    Delete Listing
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {error && <p className="mb-4 text-body2 text-red-500">{error}</p>}

      {/* Listing header card */}
      <div className="bg-white border border-border-muted p-5 rounded-2xl">
        <div className="flex flex-col gap-4 sm:flex-row">
          <img
            src={listing.imageUrls?.[0] || '/img-placeholder.png'}
            alt={listing.foodName}
            className="h-40 object-cover rounded-xl shrink-0 sm:w-56 w-full"
          />

          <div className="flex-1">
            <div className="flex gap-3 items-start justify-between">
              <h1 className="font-bold text-ink text-xl">{listing.foodName}</h1>
              {displayStatus && (
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-body2 font-medium ${
                    statusStyles[displayStatus] || ''
                  }`}>
                  {displayStatus}
                </span>
              )}
            </div>

            <p className="mt-1 text-body-text text-body2">
              Created on {formatCreated(listing)}
            </p>

            <p className="font-bold mt-3 text-2xl text-ink">
              {listing.isFree ? 'Free' : `₦${listing.price?.toLocaleString()}`}
            </p>

            <div className="gap-2 grid grid-cols-1 mt-4 sm:grid-cols-2">
              <div>
                <p className="text-body-text text-caption">Category</p>
                <p className="font-medium text-body1 text-ink">
                  {listing.category}
                </p>
              </div>
              <div>
                <p className="text-body-text text-caption">Pick up deadline</p>
                <p className="font-medium text-body1 text-ink">
                  {formatDeadline(listing)}
                </p>
              </div>
            </div>

            {listing.description && (
              <div className="mt-4">
                <p className="text-body-text text-caption">Description</p>
                <p className="text-body1 text-ink">{listing.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="gap-6 grid lg:grid-cols-[1fr_360px] mt-6">
        {/* LEFT — performance + summary */}
        <div className="space-y-6">
          <div className="bg-white border border-border-muted p-5 rounded-2xl">
            <h2 className="font-semibold mb-4 text-ink text-lg">
              Listing Performance
            </h2>
            <div className="gap-3 grid grid-cols-3">
              <div className="border border-border-muted p-3 rounded-xl">
                <p className="flex gap-1 items-center text-body-text text-caption">
                  <Package className="h-3.5 w-3.5" /> Total Quantity
                </p>
                <p className="font-bold mt-1 text-ink text-lg">{total} Meals</p>
              </div>
              <div className="border border-border-muted p-3 rounded-xl">
                <p className="flex gap-1 items-center text-body-text text-caption">
                  <Users className="h-3.5 w-3.5" /> Reserved
                </p>
                <p className="font-bold mt-1 text-ink text-lg">
                  {reserved} Meals
                </p>
              </div>
              <div className="border border-border-muted p-3 rounded-xl">
                <p className="flex gap-1 items-center text-body-text text-caption">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Available
                </p>
                <p className="font-bold mt-1 text-ink text-lg">
                  {available} Meals
                </p>
              </div>
            </div>

            <div className="bg-border-muted h-2 mt-4 overflow-hidden rounded-full w-full">
              <div
                className="bg-green-normal h-full rounded-full"
                style={{ width: `${percentReserved}%` }}
              />
            </div>
            <p className="mt-1 text-body-text text-caption">
              {percentReserved}% of food reserved
            </p>
          </div>

          <div className="bg-white border border-border-muted p-5 rounded-2xl">
            <h2 className="font-semibold mb-4 text-ink text-lg">
              Reservation Summary
            </h2>
            <div className="divide-border-muted divide-y">
              <div className="flex items-center justify-between py-3">
                <span className="flex gap-2 items-center text-body-text text-body2">
                  <Calendar className="h-4 text-green-normal w-4" /> Total
                  Reservation
                </span>
                <span className="font-medium text-body2 text-ink">
                  {totalReservations}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="flex gap-2 items-center text-body-text text-body2">
                  <CheckCircle2 className="h-4 text-green-normal w-4" />{' '}
                  Completed Pickups
                </span>
                <span className="font-medium text-body2 text-ink">
                  {completedCount}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="flex gap-2 items-center text-body-text text-body2">
                  <Clock className="h-4 text-orange-dark w-4" /> Pending
                  Pickups
                </span>
                <span className="font-medium text-body2 text-ink">
                  {pendingCount}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="flex gap-2 items-center text-body-text text-body2">
                  <AlertCircle className="h-4 text-red-500 w-4" /> Expired
                </span>
                <span className="font-medium text-body2 text-ink">
                  {expiredCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — recent reservations */}
        <div className="bg-white border border-border-muted p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink text-lg">
              Recent Reservations
            </h2>
            <button
              onClick={() => onNavigate?.('reservations')}
              className="flex font-medium gap-1 items-center text-body2 text-green-normal">
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
                  className="flex gap-3 items-center">
                    {r.user?.profileImage ? (
                      <img
                        src={r.user.profileImage}
                        alt={r.user?.fullName || 'User'}
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="bg-green-light flex font-semibold h-10 items-center justify-center rounded-full shrink-0 text-body1 text-green-normal w-10">
                        {(r.user?.fullName || 'U')[0]}
                      </div>
                    )}
                  <div className="flex-1">
                    <p className="font-bold text-body1 text-ink">
                      {r.user?.fullName || 'User'}
                    </p>
                    <p className="text-body-text text-caption">
                      {r.reservedAt
                        ? new Date(r.reservedAt).toLocaleTimeString([], {
                            hour: 'numeric',
                            minute: '2-digit',
                          })
                        : '—'}
                    </p>
                  </div>
                  <span className="bg-green-light capitalize font-medium px-3 py-1 rounded-full text-caption text-green-normal">
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <DeleteConfirmDialog
          deleting={deleting}
          error={deleteError}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
        />
      )}
    </DashboardLayout>
  );
}
