import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Search,
  Package,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import TextField from '../components/TextField.jsx';
import {
  getCurrentReservations,
  getReservationHistory,
  getUserDashboardAnalytics,
} from '../services/auth.js';
import notify from '../services/toast.js';

const TABS = ['All', 'Completed', 'Expired', 'Cancelled'];

const statusStyles = {
  reserved: 'bg-green-light text-green-normal',
  completed: 'bg-green-light text-green-normal',
  expired: 'bg-orange-light text-orange-dark',
  cancelled: 'bg-red-100 text-error',
};

function getDeadline(reservation) {
  if (!reservation.reservedAt) return null;
  return new Date(new Date(reservation.reservedAt).getTime() + 60 * 60000);
}

function formatCountdown(ms) {
  if (ms <= 0) return '00:00';
  const totalMinutes = Math.floor(ms / 60000);
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const secs = Math.floor((ms % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return hrs > 0
    ? `${hrs}:${pad(mins)}:${pad(secs)}`
    : `${pad(mins)}:${pad(secs)}`;
}

function ActiveReservationCard({ reservation, onClick }) {
  const deadline = getDeadline(reservation);
  const [msLeft, setMsLeft] = useState(() =>
    deadline ? deadline - new Date() : 0,
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMsLeft(deadline ? deadline - new Date() : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const deadlineTime = deadline
    ? deadline.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl border border-border-muted bg-white p-4 text-left shadow-sm sm:w-auto">
      <img
        src={reservation.listing?.imageUrls?.[0] || '/img-placeholder.png'}
        alt={reservation.foodName}
        className="h-16 w-16 shrink-0 rounded-xl object-cover"
      />
      <div className="flex-1">
        <p className="text-body1 font-bold text-ink">{reservation.foodName}</p>
        <p className="text-body2 text-charcoal">
          {reservation.vendor?.businessName || 'Vendor'}
        </p>
        {deadlineTime && (
          <p className="text-caption text-body-text">
            Pickup before {deadlineTime}
          </p>
        )}
      </div>
      <div className="text-right">
        <p className="font-mono text-body1 font-bold text-green-normal">
          {formatCountdown(Math.max(0, msLeft))}
        </p>
        <p className="text-caption text-body-text">remaining</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-body-text" />
    </button>
  );
}

export default function ReservationsScreen({ onNavigate, onLogout }) {
  const navigate = useNavigate();
  const [current, setCurrent] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [analytics, setAnalytics] = useState({
    totalReservations: 0,
    activeReservations: 0,
    completedReservations: 0,
    cancelledReservations: 0,
    mealsRescued: 0,
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      try {
        const [currentRes, historyRes, analyticsRes] = await Promise.all([
          getCurrentReservations(),
          getReservationHistory(),
          getUserDashboardAnalytics(),
        ]);

        setCurrent(Array.isArray(currentRes) ? currentRes : []);
        setHistory(Array.isArray(historyRes) ? historyRes : []);

        setAnalytics({
          totalReservations: analyticsRes?.totalReservations || 0,
          activeReservations: analyticsRes?.activeReservations || 0,
          completedReservations: analyticsRes?.completedReservations || 0,
          cancelledReservations: analyticsRes?.cancelledReservations || 0,
          mealsRescued: analyticsRes?.mealsRescued || 0,
        });
      } catch (err) {
        const message = err.message || 'Could not load reservations.';
        setError(message);
        notify.error(message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const historyFiltered = history
    .filter((r) =>
      activeTab === 'All' ? true : r.status === activeTab.toLowerCase(),
    )
    .filter((r) => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        r.foodName?.toLowerCase().includes(q) ||
        r.vendor?.businessName?.toLowerCase().includes(q)
      );
    });

  const goToDetail = (reservation) => {
    navigate(
      `/user/reservations/${reservation.reservationId || reservation._id}`,
      {
        state: { reservation },
      },
    );
  };

  return (
    <DashboardLayout
      active="reservations"
      role="user"
      onNavigate={onNavigate}
      onLogout={onLogout}
      title="Reservation"
      subtitle="Manage your active and past food reservations">
      {error && <p className="mb-4 text-body2 text-error">{error}</p>}

      <div className=" mt-4 mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border-muted bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-body1 font-medium text-ink">
              Active reservation
            </p>
            <Package className="h-5 w-5 text-green-normal" />
          </div>
          <p className="text-2xl font-bold text-ink">
            {analytics.activeReservations}
          </p>
        </div>
        <div className="rounded-2xl border border-border-muted bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-body1 font-medium text-ink">Total reservation</p>
            <Calendar className="h-5 w-5 text-green-normal" />
          </div>
          <p className="text-2xl font-bold text-ink">
            {analytics.totalReservations}
          </p>
        </div>
        <div className="rounded-2xl border border-border-muted bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-body1 font-medium text-ink">
              Completed reservation
            </p>
            <CheckCircle2 className="h-5 w-5 text-green-normal" />
          </div>

          <p className="text-2xl font-bold text-ink">
            {analytics.completedReservations}
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-body-text">Loading reservations…</p>
      ) : (
        <>
          {current.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold text-ink">
                Active Reservation
              </h2>
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                {current.map((r) => (
                  <ActiveReservationCard
                    key={r._id || r.reservationId}
                    reservation={r}
                    onClick={() => goToDetail(r)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border-muted bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold text-ink">
              Reservation History
            </h2>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-green-normal text-white'
                        : 'border border-border-muted text-body-text'
                    }`}>
                    {tab}
                  </button>
                ))}
              </div>
              <TextField
                icon={Search}
                placeholder="Search reservations..."
                variant="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="sm:w-64"
              />
            </div>

            {historyFiltered.length === 0 ? (
              <p className="py-8 text-center text-body-text">
                No reservations found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[720px]">
                  <div className="grid grid-cols-[2fr_2fr_1.2fr_1fr_auto] px-2 py-2 text-caption font-semibold text-body-text">
                    <span>Food</span>
                    <span>Vendor</span>
                    <span>Date</span>
                    <span>Status</span>
                    <span></span>
                  </div>
                  <div className="divide-y divide-border-muted">
                    {historyFiltered.map((r) => (
                      <div
                        key={r._id || r.reservationId}
                        className="grid grid-cols-[2fr_2fr_1.2fr_1fr_auto] items-center px-2 py-3">
                        <span className="text-body1 font-medium text-ink">
                          {r.foodName}
                        </span>
                        <span className="text-body2 text-charcoal">
                          {r.vendor?.businessName || 'Vendor'}
                        </span>
                        <span className="text-body2 text-charcoal">
                          {r.reservedAt
                            ? new Date(r.reservedAt).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'long',
                                  day: '2-digit',
                                  year: 'numeric',
                                },
                              )
                            : '—'}
                        </span>
                        <span
                          className={`w-fit rounded-full px-3 py-1 text-caption font-medium capitalize ${
                            statusStyles[r.status] || ''
                          }`}>
                          {r.status}
                        </span>
                        <button
                          onClick={() => goToDetail(r)}
                          className="flex items-center gap-1 text-body2 font-medium text-green-normal">
                          View more <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
