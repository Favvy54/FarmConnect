import { useState, useEffect } from 'react';
import {
  Store,
  Calendar,
  TrendingUp,
  Trash2,
  CirclePlus,
  Plus,
  ArrowRight,
  X,
} from 'lucide-react';

import DashboardLayout from '../components/DashboardLayout.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import VendorActivityTicker from '../components/VendorActivityTicker.jsx';
import SuccessToast from '../components/SuccessToast.jsx';

import {
  getToken,
  getVendorProfile,
  getDashboardAnalytics,
  getVendorReservations,
  getMyListings,
  getVendorReservationAnalytics,
  completeReservation,
  cancelVendorReservation,
  getListingDetails,
} from '../services/auth.js';
import MiniFarmBot from "../components/MiniFarmBot";

const STAT_ICONS = {
  listings: Store,
  reservations: Calendar,
  saved: Store,
  discarded: Trash2,
};

const statusStyles = {
  reserved: 'bg-green-light text-green-normal',
  completed: 'bg-blue-100 text-blue-600',
  expired: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-error',
};

const statusLabels = {
  reserved: 'Reserved',
  completed: 'Completed',
  expired: 'Expired',
  cancelled: 'Cancelled',
};

function getDeadline(reservation) {
  if (!reservation?.reservedAt) return null;
  return new Date(new Date(reservation.reservedAt).getTime() + 60 * 60000);
}

function formatTime(date) {
  if (!date) return '—';
  return new Date(date).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDateTime(date) {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function TimeRemaining({ reservation }) {
  const getRemaining = () => {
    const deadline = getDeadline(reservation);
    if (!deadline) return 0;

    return Math.max(0, deadline.getTime() - Date.now());
  };

  const [msLeft, setMsLeft] = useState(getRemaining);

  useEffect(() => {
    if (reservation.status !== 'reserved') return;

    const interval = setInterval(() => {
      setMsLeft(getRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation]);

  if (reservation.status !== 'reserved') {
    return <span className="text-body-text">—</span>;
  }

  if (msLeft <= 0) {
    return <span className="font-medium text-error">Expired</span>;
  }

  const totalSeconds = Math.floor(msLeft / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const urgent = msLeft <= 15 * 60 * 1000;

  let displayTime;

  if (hours > 0) {
    displayTime = `${hours}h ${minutes}m`;
  } else {
    displayTime = `${minutes}m ${seconds}s`;
  }

  return (
    <span
      className={
        urgent
          ? 'font-medium text-orange-dark'
          : 'font-medium text-green-normal'
      }>
      {displayTime}
    </span>
  );
}

function ReservationDetailModal({
  reservation,
  onClose,
  onMarkComplete,
  onCancelClick,
  actionLoading,
}) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (reservation.status !== 'reserved') return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation.status]);

  const deadline = getDeadline(reservation);
  const msLeft = deadline ? deadline.getTime() - now : 0;
  const customerName = reservation.user?.fullName || 'Customer';

  return (
    <div className="fixed top-3 bottom-3 overflow-y-auto inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {reservation.user?.profileImage ? (
              <img
                src={reservation.user.profileImage}
                alt={customerName}
                className="h-12 w-12 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-light text-body1 font-semibold text-green-normal">
                {customerName[0]}
              </div>
            )}
            <h3 className="text-lg font-bold text-ink">{customerName}</h3>
          </div>
          <button onClick={onClose} className="text-body-text hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <h4 className="mt-6 mb-3 text-body1 font-bold text-ink">
          Reservation Information
        </h4>

        <div className="divide-y divide-border-muted">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-body2 text-body-text">Listing</span>
            <span className="text-body2 font-medium text-ink">
              {reservation.foodName || reservation.listing?.foodName || 'Meal'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-body2 text-body-text">Quantity</span>
            <span className="text-body2 font-medium text-ink">
              {reservation.quantityRequested} Meals
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-body2 text-body-text">Reserved At</span>
            <span className="text-body2 font-medium text-ink">
              {formatDateTime(reservation.reservedAt)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-body2 text-body-text">Pickup Before</span>
            <span className="text-body2 font-medium text-ink">
              {formatDateTime(deadline)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-body2 text-body-text">Time Remaining</span>
            <span className="text-body2 font-medium text-orange-normal">
              {reservation.status === 'reserved' && msLeft > 0
                ? `${Math.floor(msLeft / 60000)}m ${Math.floor((msLeft % 60000) / 1000)}s`
                : 'Expired'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-body2 text-body-text">Status</span>
            <span
              className={`rounded-full px-3 py-1 text-caption font-medium ${
                statusStyles[reservation.status] || ''
              }`}>
              {statusLabels[reservation.status] || reservation.status}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-body2 text-body-text">Reservation ID</span>
            <span className="text-body2 font-medium text-ink">
              {reservation.reservationId}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between py-2.5">
          <span className="text-body2 text-body-text">Pickup Code</span>

          <span className="text-body2 font-medium text-ink">
            {reservation.pickupCode || '—'}
          </span>
        </div>
        <div className="flex items-center justify-between py-2.5">
          <span className="text-body2 text-body-text">Category</span>

          <span className="text-body2 font-medium text-ink">
            {reservation.category || reservation.listing?.category || '—'}
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5">
          <span className="text-body2 text-body-text">Pickup Location</span>

          <span className="text-body2 font-medium text-ink">
            {reservation.pickupLocation ||
              reservation.listing?.pickupLocation ||
              '—'}
          </span>
        </div>

        {reservation.status === 'reserved' && (
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={onMarkComplete}
              disabled={actionLoading}
              className="w-full rounded-xl bg-green-normal py-3 text-body1 font-semibold text-white disabled:opacity-50">
              {actionLoading ? 'Updating...' : 'Mark as Complete'}
            </button>
            <button
              type="button"
              onClick={onCancelClick}
              disabled={actionLoading}
              className="w-full rounded-xl border border-red-500 py-3 text-body1 font-semibold text-red-500 disabled:opacity-50">
              Cancel Reservation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CancelReasonModal({ onKeep, onConfirm, cancelling }) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <h3 className="text-xl font-bold text-ink">Cancel Reservation</h3>
        <p className="mt-1 text-body2 text-body-text">
          Please provide a reason for cancelling this reservation
        </p>

        <label className="mt-5 block text-body1 font-semibold text-ink">
          Reason for cancellation <span className="text-error">*</span>
        </label>
        <textarea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Provide a short description of your food"
          className="mt-2 w-full rounded-xl border border-border-muted px-4 py-3 text-body1 text-ink placeholder:text-body-text focus:outline-none focus:ring-2 focus:ring-green-normal"
        />

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onKeep}
            disabled={cancelling}
            className="flex-1 rounded-xl border border-green-normal py-3 text-body1 font-semibold text-green-normal disabled:opacity-50">
            Keep Reservation
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || cancelling}
            className="flex-1 rounded-xl bg-red-500 py-3 text-body1 font-semibold text-white disabled:opacity-40">
            {cancelling ? 'Cancelling...' : 'Cancel Reservation'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VendorDashboardScreen({
  initialStats = {
    listings: 0,
    reservations: 0,
    saved: 0,
    discarded: 0,
  },
  initialReservations = [],
  initialActiveListings = [],
  onCreateListing,
  onManageListing,
  onManageReservation,
  onViewAnalytics,
  onNavigate,
  onLogout,
}) {
  const [stats, setStats] = useState(initialStats);
  const [rawTodayReservations, setRawTodayReservations] = useState(initialReservations);
  const [activeListings, setActiveListings] = useState(initialActiveListings);

  const [vendor, setVendor] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selected, setSelected] = useState(null);
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const token = getToken();

        const vendorResponse = await fetch(
          'https://farmconnect-backend-1.onrender.com/api/vendors/profile',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const vendorData = await vendorResponse.json();

        if (!vendorResponse.ok) {
          throw new Error(
            vendorData.message || 'Failed to load vendor profile.',
          );
        }

        if (!cancelled) {
          setVendor(vendorData.data);
        }

        // ==================== DASHBOARD ANALYTICS ====================

        const [
            analyticsResponse,
            listingsResponse,
            reservationsResponse,
            reservationAnalyticsResponse,
          ] = await Promise.all([
            getDashboardAnalytics(),
            getMyListings(),
            getVendorReservations(),
            getVendorReservationAnalytics(),
          ]);

        if (!cancelled) {
          const analytics = analyticsResponse.analytics;

          setAnalytics(analytics);

          const filteredListings = listingsResponse.filter(
            (listing) =>
              listing.status === 'available' &&
              listing.isActive === true &&
              listing.quantity > 0,
          );

          const enrichedListings = await Promise.all(
            filteredListings.map(async (listing) => {
              let reserved = 0;

              try {
                const details = await getListingDetails(listing._id);
                reserved = details?.reservedQuantity || details?.data?.reservedQuantity || 0;
              } catch {
                reserved = (listing.totalQuantity || 0) - (listing.quantity || 0);
              }

              return {
                id: listing._id,
                image: listing.imageUrls?.[0] || '/img-placeholder.png',
                name: listing.foodName,
                total: listing.totalQuantity || 0,
                available: (listing.totalQuantity || 0) - reserved,
                reserved,
                status: 'ACTIVE',
              };
            }),
          );

          setActiveListings(enrichedListings);

          const today = new Date();

          const todaysFiltered = reservationsResponse.data.filter((reservation) => {
            const reservationDate = new Date(reservation.reservedAt || reservation.createdAt);
            return (
              reservationDate.getDate() === today.getDate() &&
              reservationDate.getMonth() === today.getMonth() &&
              reservationDate.getFullYear() === today.getFullYear()
            );
          });

          setRawTodayReservations(todaysFiltered);

          setStats({
            listings: analytics.activeListings,

            reservations:
              reservationAnalyticsResponse?.data?.totalToday || 0,

            saved: analytics.mealsShared,

            discarded: analytics.discardedMeals,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not load dashboard data.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const displayedReservations = rawTodayReservations.slice(0, 6);
  const hasMore = rawTodayReservations.length > 6;

  const handleMarkComplete = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await completeReservation(selected.reservationId || selected._id);
      setSelected(null);
      setToast({
        title: 'Food picked up successfully',
        message: 'Pickup complete! The customer has collected their food',
      });
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Could not mark this reservation as complete.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelConfirm = async (reason) => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await cancelVendorReservation(
        selected.reservationId || selected._id,
        reason,
      );
      setShowCancelReason(false);
      setSelected(null);
      setToast({
        title: 'Reservation Cancelled Successfully',
        message:
          'The reserved meals are now available for other customers, and the customer has been notified.',
      });
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Could not cancel this reservation.');
    } finally {
      setActionLoading(false);
    }
  };

  const statCards = [
    {
      key: 'listings',
      label: 'Active listings',
      value: stats.listings,
      note: 'View all',
    },
    {
      key: 'reservations',
      label: 'Reservations Today',
      value: stats.reservations,
      note: 'View all',
    },
    {
      key: 'saved',
      label: 'Meals Saved',
      value: stats.saved,
      note: 'This week',
    },
    {
      key: 'discarded',
      label: 'Discarded Meals',
      value: stats.discarded,
      note: 'This week',
    },
  ];

  const displayName = vendor?.businessName || 'there';

  return (
   <> 
    <DashboardLayout
      active="home"
      onNavigate={onNavigate}
      onLogout={onLogout}
      title={`Welcome Back ${displayName} 👋`}
      subtitle="Here's what's happening with your business today."
      location={vendor?.currentLocation || 'Location unavailable'}
      profileImage={vendor?.profileImage}>
      <div className="md:pl-2 w-full">
        {toast && (
          <SuccessToast
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}

        {error && <p className="mb-4 text-body2 text-red-500">{error}</p>}

        {/* Stat cards */}
        <div className="gap-3 grid grid-cols-1 lg:grid-cols-4 mb-6 md:grid-cols-2 mt-10">
          {statCards.map(({ key, label, value, note }) => {
            const Icon = STAT_ICONS[key];
            return (
              <div
                key={key}
                className="border-2 border-border-fade p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-ink text-normal">
                    {label}
                  </span>
                  <span className="bg-green-light flex h-9 items-center justify-center rounded-full w-9">
                    <Icon className="h-6 text-green-normal text-regular w-6" />
                  </span>
                </div>
                <p className="font-medium text-dashboard text-ink">{value}</p>
                <button
                  onClick={key === 'reservations' ? onManageReservation : undefined}
                  className="flex font-semibold gap-1 items-center mt-1 text-caption text-green-normal">
                  {note} <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            );
          })}
        </div>

        <div
          className="grid gap-6 [grid-template-areas:'quick''reservation''active']
        md:[grid-template-areas:'quick''reservation''active']
        lg:grid-cols-[1fr_1fr]
        lg:[grid-template-areas:'reservation_reservation''active_quick']">
          {/* Today's Reservation */}
          <div className="[grid-area:reservation] border-2 border-border-fade mb-6 px-5 py-4.25 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink text-regular">
                Today's Reservation
              </h2>
              <button
                onClick={onManageReservation}
                className="flex font-semibold gap-1 items-center text-body2 text-green-normal">
                View all <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            {rawTodayReservations.length === 0 ? (
              <div className="flex flex-col gap-2 items-center py-10 text-center">
                <div className="bg-green-light flex h-22.25 items-center justify-center mb-4 md:h-41 md:w-56.75 rounded-full w-30.75">
                  <img
                    src="/empty-reservation.png"
                    alt="No Reservation"
                    className="h-full object-cover w-full"
                  />
                </div>
                <p className="font-medium text-ink text-regular">
                  No reservation yet
                </p>
                <p className="font max-w-xs mt-1 text-ink text-normal">
                  Once someone reserves your listing, it will appear here
                </p>
              </div>
            ) : (
              <>
                <div className="mt-4 rounded-2xl border border-border-muted overflow-auto">
                  <div className="min-w-226">
                    {/* Header */}
                    <div className="grid grid-cols-[minmax(240px,1fr)_180px_150px_150px_140px_90px] items-center bg-[#f3f3f3] px-6 py-3 text-charcoal text-normal font-bold">
                      <span>Customer</span>
                      <span>Reserved At</span>
                      <span>Pickup Before</span>
                      <span>Time remaining</span>
                      <span>Status</span>
                      <span>Action</span>
                    </div>

                    <div className="divide-y divide-border-muted">
                      {displayedReservations.map((r) => {
                        const customerName = r.user?.fullName || 'Customer';
                        return (
                          <div
                            key={r._id || r.reservationId}
                            className="grid grid-cols-[minmax(250px,1fr)_180px_150px_150px_140px_90px] items-center px-6 py-4">
                            {/* Customer */}
                            <div className="flex items-center gap-3">
                              {r.user?.profileImage ? (
                                <img
                                  src={r.user.profileImage}
                                  alt={customerName}
                                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-light text-body1 font-semibold text-green-normal">
                                  {customerName[0]}
                                </div>
                              )}

                              <div>
                                <p className="text-body1 font-bold text-ink">
                                  {customerName}
                                </p>

                                <p className="truncate text-body2 text-charcoal">
                                  {r.foodName || r.listing?.foodName || 'Meal'}
                                </p>
                              </div>
                            </div>

                            {/* Reserved At */}
                            <span className="text-body2 text-ink">
                              {formatTime(r.reservedAt)}
                            </span>

                            {/* Pickup Before */}
                            <span className="text-body2 text-ink">
                              {formatTime(getDeadline(r))}
                            </span>

                            {/* Time Remaining */}
                            <TimeRemaining reservation={r} />

                            {/* Status */}
                            <span
                              className={`w-fit rounded-full px-3 py-1 text-body2 font-medium ${
                                statusStyles[r.status] || ''
                              }`}>
                              {statusLabels[r.status] || r.status}
                            </span>

                            {/* Action */}
                            <button
                              type="button"
                              onClick={() => setSelected(r)}
                              className="w-fit rounded-lg border border-border-muted px-4 py-1.5 text-body2 text-ink">
                              View
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {hasMore && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={onManageReservation}
                      className="flex items-center gap-1 text-body1 font-semibold text-green-normal hover:underline">
                      View More <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Active Listing */}
          <div className="[grid-area:active] border-2 border-border-fade px-5 py-4.25 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink text-regular">
                Active Listing
              </h2>
              <button
                onClick={onManageListing}
                className="flex gap-1 items-center text-body2 text-green-normal">
                Manage all listing <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            {activeListings.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="bg-green-light flex h-24 items-center justify-center mb-4 md:h-30 md:w-33.75 rounded-full w-27">
                  <img
                    src="/empty-listing.png"
                    alt="No Listing"
                    className="h-full object-cover w-full"
                  />
                </div>
                <p className="font-medium text-ink text-regular">
                  No active listing
                </p>
                <p className="max-w-xs mt-1 text-ink text-normal">
                  Create your first surplus food listing and start reaching
                  nearby people
                </p>
                <PrimaryButton onClick={onCreateListing}>
                  <span
                    className="flex 
                  justify-center items-center
                  text-normal text-white gap-1">
                    <Plus className="h-6 w-6" /> Create Listing
                  </span>
                </PrimaryButton>
              </div>
            ) : (
              <div className="divide-border-muted divide-y flex flex-col">
                {activeListings.map((l, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-4">
                    <div className="flex gap-3 items-center">
                      <img
                        src={l.image}
                        alt={l.name}
                        className="h-21 object-cover rounded-xl w-21"
                      />
                      <div>
                        <p className="font-semibold text-ink text-normal">
                          {l.name}
                        </p>
                        <p className="text-body2 text-charcoal">
                          {l.total} total · {l.reserved} reserved
                        </p>
                      </div>
                    </div>
                    <span className="bg-green-light font-medium px-2.5 py-1 rounded-xl text-body2 text-green-normal">
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="[grid-area:quick] bg-green-light h-fit px-5.75 py-4.25 rounded-2xl">
            <h2 className="font-semibold mb-4.75 text-ink text-regular">
              Quick Action
            </h2>
            <div className="gap-3 grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2">
              <button
                onClick={onCreateListing}
                className="bg-white flex flex-col gap-2 items-center px-6.25 py-2.25 rounded-xl">
                <CirclePlus className="h-8.25 text-green-normal w-8.25" />
                <span className="font-medium text-center text-ink text-normal">
                  Create Listing
                </span>
              </button>
              <button
                onClick={onManageListing}
                className="bg-white flex flex-col gap-3 items-center px-6.25 py-2.25 rounded-xl">
                <Store className="h-8.25 text-green-normal w-8.25" />
                <span className="font-medium text-center text-ink text-normal">
                  Manage Listing
                </span>
              </button>
              <button
                onClick={onManageReservation}
                className="bg-white flex flex-col gap-3 items-center px-6.25 py-2.25 rounded-xl">
                <Calendar className="h-8.25 text-green-normal w-8.25" />
                <span className="font-medium text-center text-ink text-normal">
                  Manage Reservation
                </span>
              </button>
              <button
                onClick={onViewAnalytics}
                className="bg-white flex flex-col gap-3 items-center px-6.25 py-2.25 rounded-xl">
                <TrendingUp className="h-8.25 text-green-normal w-8.25" />
                <span className="font-medium text-center text-ink text-normal">
                  View Analytics
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {selected && !showCancelReason && (
        <ReservationDetailModal
          reservation={selected}
          onClose={() => setSelected(null)}
          onMarkComplete={handleMarkComplete}
          onCancelClick={() => setShowCancelReason(true)}
          actionLoading={actionLoading}
        />
      )}

      {selected && showCancelReason && (
        <CancelReasonModal
          cancelling={actionLoading}
          onKeep={() => setShowCancelReason(false)}
          onConfirm={handleCancelConfirm}
        />
      )}
    </DashboardLayout>
     {/* MINI FARM BOT */}
     <div className="fixed bottom-6 right-6 z-50">
      <MiniFarmBot />
    </div>
    <VendorActivityTicker />
   </>  
  );
}
