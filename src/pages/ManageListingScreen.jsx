import { useState, useEffect } from 'react';
import {
  SearchIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import TextField from '@/components/TextField.jsx';
import { useLocation, useNavigate } from 'react-router';
import SuccessToast from '../components/SuccessToast.jsx';

import { getMyListings, getVendorProfile } from '../services/auth';

const TABS = ['All', 'Active', 'Sold Out', 'Expired'];

const statusStyles = {
  ACTIVE: 'bg-green-light text-green-normal',
  'SOLD OUT': 'bg-orange-light text-orange-dark',
  EXPIRED: 'bg-gray-100 text-gray-500',
  CANCELLED: 'bg-red-100 text-red-500',
};
export default function ManageListingScreen({
  initialListings = [], // [{ image, name, createdOn, status, available, reserved, left, pickupEnds }]
  onCreateListing,
  onEditListing,
  onNavigate,
  onLogout,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [listings, setListings] = useState(initialListings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [search, setSearch] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (location.state?.success) {
      setSuccessMessage(location.state.success);

      // Clear router state so it doesn't show again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    let cancelled = false;

    async function loadListings(searchTerm = '') {
      setLoading(true);
      setError(null);

      try {
        const vendorProfile = await getVendorProfile();

        if (!cancelled) {
          setVendor(vendorProfile.data);
        }

        const listings = await getMyListings(searchTerm);

          console.log(
            'raw listings:',
            listings.map((l) => ({
              id: l._id,
              foodName: l.foodName,
              expiryDuration: l.expiryDuration,
              expiresAt: l.expiresAt,
              updatedAt: l.updatedAt,
              createdAt: l.createdAt,
            })),
          );

        if (!cancelled) {
          const formatted = listings.map((listing) => ({
            id: listing._id,
            raw: listing, // full original listing needed to prefill the edit form
            image: listing.imageUrls?.[0] || '/img-placeholder.png',
            name: listing.foodName,
            createdOn: new Date(listing.createdAt).toLocaleDateString(),

            status:
              listing.status === 'available'
                ? 'ACTIVE'
                : listing.status === 'completed'
                  ? 'SOLD OUT'
                  : listing.status === 'expired'
                    ? 'EXPIRED'
                    : 'CANCELLED',

            available: listing.quantity,
            reserved: listing.totalReservations,
            left: listing.quantity - listing.totalReservations,
            pickupEnds: listing.expiresAt
              ? new Date(listing.expiresAt).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })
              : 'Not set',
          }));

          setListings(formatted);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not load listings.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    const timeout = setTimeout(() => {
      loadListings(search);
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [search]);

  const counts = {
    All: listings.length,

    Active: listings.filter((l) => l.status === 'ACTIVE').length,

    'Sold Out': listings.filter((l) => l.status === 'SOLD OUT').length,

    Expired: listings.filter((l) => l.status === 'EXPIRED').length,
  };

  const filtered =
    activeTab === 'All'
      ? listings
      : listings.filter((l) => l.status === activeTab.toUpperCase());

  return (
    <DashboardLayout
      active="listings"
      onNavigate={onNavigate}
      onLogout={onLogout}
      title="Manage Listings"
      subtitle="Here's what happening with your business today."
      location={vendor?.currentLocation || 'Location unavailable'}
      profileImage={vendor?.profileImage}>
      {successMessage && (
        <SuccessToast
          title={
            successMessage === 'Listing Deleted'
              ? 'Listing deleted successfully!'
              : successMessage === 'Listing Updated'
                ? 'Listing updates successfully!'
                : 'Listing published successfully!'
          }
          message={
            successMessage === 'Listing Deleted'
              ? 'Your food listing is no longer available to users'
              : successMessage === 'Listing Updated'
                ? 'Your food listing has been updated for users'
                : 'Your food listing is now available to nearby users'
          }
          onClose={() => setSuccessMessage(null)}
        />
      )}
      <div className=" w-full md:pl-2">
        {/* Tabs */}
        {error && <p className="text-body2 text-red-500 mb-4">{error}</p>}

        <div className="flex w-full items-center justify-between my-4 gap-7">
          <TextField
            icon={SearchIcon}
            placeholder="Search Listings"
            variant="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:w-[60%] lg:w-[80%] flex items-center py-3"
          />
          <PrimaryButton
            onClick={onCreateListing}
            className=" md:w-[35%] lg:w-[30%]  flex items-center justify-center  py-2 px-2 rounded-xl md:px-3 md:py-3">
            <span
              className="flex
                            justify-center items-center
                            md:text-normal text-white gap-1">
              <Plus className="w-6 h-6 sm:text-center" />
              <p className="hidden md:block">Create Listing </p>
            </span>
          </PrimaryButton>
        </div>
        <div className="flex justify-between border-b-4 border-border-muted mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-caption md:text-regular border-b-4 -mb-1 transition-colors
                ${
                  activeTab === tab
                    ? ' border-b-2 border-green-normal text-green-normal font-medium'
                    : 'border-transparent text-body-text'
                }`}>
              {tab}({counts[tab]})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-border-muted border-t-green-normal" />
            <p className="mt-3 text-body2 text-body-text">
              Loading your listings...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center text-center py-6 w-[50%] mx-auto">
                          <div className="w-27 h-24  md:w-33.75 md:h-30 rounded-full bg-green-light flex items-center justify-center mb-4">
                            <img
                              src="/empty-listing.png"
                              alt="No Listing"
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <p className="text-regular font-medium text-ink">
                            No active listing
                          </p>
                          <p className="text-normal text-ink mt-1 max-w-xs">
                            Create your first surplus food listing and start reaching
                            nearby people
                          </p>
                          <PrimaryButton onClick={onCreateListing}>
                            <span
                              className="flex 
                            justify-center items-center
                            text-normal text-white gap-1">
                              <Plus className="w-6 h-6" /> Create Listing
                            </span>
                          </PrimaryButton>
                        </div>
        ) : (
          <>
            <div className="rounded-2xl border border-border-muted overflow-auto">
              <div className="overflow-auto">
                <div className="min-w-180">
                  <div className="grid grid-cols-[2fr_1fr_1.2fr_1fr_auto] bg-[#f3f3f3] px-6 py-3.25  text-charcoal text-normal font-bold">
                    <span>Listing</span>
                    <span>Status</span>
                    <span>Availability</span>
                    <span>Pickup ends</span>
                    <span>Action</span>
                  </div>

                  <div className="divide-y divide-border-muted">
                    {filtered.map((l) => (
                      <div
                        key={l.id}
                        onClick={() =>
                          navigate(`/vendor/listings/${l.id}`, {
                            state: { listing: l.raw, status: l.status },
                          })
                        }
                        className="grid grid-cols-[2fr_1fr_1.2fr_1fr_auto] items-center px-6 py-4 cursor-pointer transition-colors hover:bg-surface-secondary">
                        <div className="flex items-center gap-3">
                          <img
                            src={l.image}
                            alt={l.name}
                            className=" w-12 h-12 lg:w-14 lg:h-14 rounded-xl object-cover"
                          />
                          <div>
                            <p className="text-body1 font-bold text-ink">
                              {l.name}
                            </p>
                            <p className="text-body2 text-charcoal">
                              Created on {l.createdOn}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`w-fit text-body2 font-medium rounded-full px-3 py-1 ${statusStyles[l.status] || ''}`}>
                          {l.status}
                        </span>
                        <div className="text-body2 text-ink">
                          {l.available} Available
                          <br />
                          {l.reserved} Reserved
                          <br />
                          {l.left} Left
                        </div>
                        <span className="text-body2 lg:text-body1 text-ink">
                          {l.pickupEnds}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditListing?.(l);
                          }}
                          disabled={l.status !== 'ACTIVE'}
                          className={`rounded-lg border px-4 py-1.5 text-body2 w-fit ${
                            l.status === 'ACTIVE'
                              ? 'border-border-muted text-ink'
                              : 'border-border-muted text-gray-400 cursor-not-allowed'
                          }`}>
                          Edit
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 text-body2 text-body-text">
              <span>
                Showing 1 to {filtered.length} of {filtered.length} listings
              </span>
              <div className="flex items-center gap-3">
                <ChevronLeft className="w-4 h-4" />
                <span className="text-green-normal font-medium">1</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
