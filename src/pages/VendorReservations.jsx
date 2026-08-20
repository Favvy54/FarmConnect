import { useEffect, useState } from 'react';
import { Search, X, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import TextField from '@/components/TextField.jsx';
import SuccessToast from '../components/SuccessToast.jsx';
import {
  getVendorProfile,
  getVendorReservations,
  getVendorReservationHistory,
  completeReservation,
  cancelVendorReservation,
} from '../services/auth.js';

const TABS = ['All', 'Active', 'Completed', 'Expired', 'Cancelled'];

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

export default function VendorReservations({ onNavigate, onLogout }) {
  const [reservations, setReservations] = useState([]);
    const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const [selected, setSelected] = useState(null);
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

const loadAll = async () => {
  setLoading(true);
  setError(null);

  try {
    const [vendorResponse, reservationsResponse] =
      await Promise.all([
        getVendorProfile(),
        getVendorReservations(),
      ]);

    setVendor(vendorResponse?.data);

    const data =
      reservationsResponse?.data?.reservations ||
      reservationsResponse?.data ||
      reservationsResponse ||
      [];

    setReservations(Array.isArray(data) ? data : []);
  } catch (err) {
    setError(
      err.message ||
      'Could not load reservations.',
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadAll();
  }, []);

  const counts = {
    All: reservations.length,
    Active: reservations.filter((r) => r.status === 'reserved').length,
    Completed: reservations.filter((r) => r.status === 'completed').length,
    Expired: reservations.filter((r) => r.status === 'expired').length,
    Cancelled: reservations.filter((r) => r.status === 'cancelled').length,
  };

  const tabStatusMap = {
    Active: 'reserved',
    Completed: 'completed',
    Expired: 'expired',
    Cancelled: 'cancelled',
  };

  const filtered = reservations
    .filter((r) =>
      activeTab === 'All' ? true : r.status === tabStatusMap[activeTab],
    )
    .filter((r) => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        r.foodName?.toLowerCase().includes(q) ||
        r.user?.fullName?.toLowerCase().includes(q)
      );
    });

  const handleMarkComplete = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await completeReservation(selected.reservationId || selected._id);
      setSelected(null);
      await loadAll();
      setToast({
        title: 'Food picked up successfully',
        message: 'Pickup complete! The customer has collected their food',
      });
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
      await loadAll();
      setToast({
        title: 'Reservation Cancelled Successfully',
        message:
          'The reserved meals are now available for other customers, and the customer has been notified.',
      });
    } catch (err) {
      setError(err.message || 'Could not cancel this reservation.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout
      active="reservations"
      onNavigate={onNavigate}
      onLogout={onLogout}
      title="Reservation"
      subtitle="Manage all reservations for your listing"
      location={vendor?.currentLocation || 'Location unavailable'}
      profileImage={vendor?.profileImage}>
      {toast && (
        <SuccessToast
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {error && <p className="mb-4 text-body2 text-error">{error}</p>}

      <div className="md:pl-2 w-full mt-10 flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
      <TextField
        icon={Search}
        placeholder="Search Reservation"
        variant="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full shrink-0"
      />

      <div className="mt-6 flex gap-2 md:gap-6 border-b border-border-muted pb-px shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 md:px-0 text-caption md:text-body1 font-medium transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'border-b-2 border-green-normal text-green-normal'
                : 'text-body-text'
            }`}>
            {tab}<span className="ml-0.5">({counts[tab]})</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto mt-4 scrollbar-hide">
      {loading ? (
        <p className="mt-6 text-body-text">Loading reservations…</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 text-center py-10">
          <div className="w-30.75 h-22.25 md:w-56.75 md:h-41 rounded-full bg-green-light flex items-center justify-center mb-4">
            <img
              src="/empty-reservation.png"
              alt="No Reservation"
              className=" w-full h-full object-cover"
            />
          </div>
          <p className="text-regular font-medium text-ink">
            No reservation yet
          </p>
          <p className="text-normal font text-ink mt-1 max-w-xs">
            Once someone reserves your listing, it will appear here
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border-muted scrollbar-hide">
            <div className="min-w-[1000px]">
              <div className="grid grid-cols-[minmax(240px,1fr)_180px_150px_150px_140px_90px] items-center bg-[#f3f3f3] px-6 py-3 text-charcoal text-normal font-bold">
                <span>Customer</span>
                <span>Reserved At</span>
                <span>Pickup Before</span>
                <span>Time remaining</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              <div className="divide-y divide-border-muted">
                {filtered.map((r) => {
                  const deadline = getDeadline(r);
                  const customerName = r.user?.fullName || 'Customer';
                  return (
                    <div
                      key={r._id || r.reservationId}
                      className="grid grid-cols-[minmax(240px,1fr)_180px_150px_150px_140px_90px] items-center px-6 py-4">
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
                      <span className="text-body2 text-ink">
                        {formatTime(r.reservedAt)}
                      </span>
                      <span className="text-body2 text-ink">
                        {formatTime(deadline)}
                      </span>
                      <TimeRemaining reservation={r} />
                      <span
                        className={`w-fit rounded-full px-3 py-1 text-body2 font-medium ${
                          statusStyles[r.status] || ''
                        }`}>
                        {statusLabels[r.status] || r.status}
                      </span>
                      <button
                        onClick={() => setSelected(r)}
                        className="rounded-lg border border-border-muted px-4 py-1.5 text-body2 text-ink w-fit">
                        View
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
        </div>
      )}
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
  );
}
