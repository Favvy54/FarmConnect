import { useState, useEffect } from 'react';
import {SearchIcon, Plus, ChevronLeft, ChevronRight, CheckCircle2, X } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import TextField from '@/components/TextField.jsx';

import {
  getMyListings,
  getVendorProfile,
} from "../services/auth";

const TABS = ['All', 'Active', 'Sold Out', 'Expired'];

const statusStyles = {
  ACTIVE: "bg-green-light text-green-normal",
  "SOLD OUT": "bg-orange-light text-orange-dark",
  EXPIRED: "bg-gray-100 text-gray-500",
  CANCELLED: "bg-red-100 text-red-500",
};
export default function ManageListingScreen({
  initialListings = [], // [{ image, name, createdOn, status, available, reserved, left, pickupEnds }]
  onCreateListing,
  onEditListing,
  onNavigate,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState('All');
  const [listings, setListings] = useState(initialListings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [search, setSearch] = useState("");
  const [showCreatedBanner, setShowCreatedBanner] = useState(() => {
    const flag = sessionStorage.getItem('farmconnect_listing_created');
    if (flag) {
      sessionStorage.removeItem('farmconnect_listing_created');
      return true;
    }
    return false;
  });

  useEffect(() => {
  let cancelled = false;

  async function loadListings(searchTerm = "") {
    setLoading(true);
    setError(null);

    try {
      const vendorProfile = await getVendorProfile();

      if (!cancelled) {
        setVendor(vendorProfile.data);
      }

      const listings = await getMyListings(searchTerm);

      if (!cancelled) {
        const formatted = listings.map((listing) => ({
          id: listing._id,
          image: listing.imageUrls?.[0] || "/img-placeholder.png",
          name: listing.foodName,
          createdOn: new Date(listing.createdAt).toLocaleDateString(),

          status:
            listing.status === "available"
              ? "ACTIVE"
              : listing.status === "completed"
              ? "SOLD OUT"
              : listing.status === "expired"
              ? "EXPIRED"
              : "CANCELLED",

          available: listing.quantity - listing.totalReservations,
          reserved: listing.totalReservations,
          left: listing.quantity - listing.totalReservations,
          pickupEnds: new Date(listing.expiresAt).toLocaleString(),
        }));

        setListings(formatted);
      }
    } catch (err) {
      if (!cancelled) {
        setError(err.message || "Could not load listings.");
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
    All: analytics?.totalListings ?? listings.length,
  
    Active:
      analytics?.activeListings ??
      listings.filter((l) => l.status === "ACTIVE").length,
  
    "Sold Out":
      analytics?.completedListings ??
      listings.filter((l) => l.status === "SOLD OUT").length,
  
    Expired:
      analytics?.expiredListings ??
      listings.filter((l) => l.status === "EXPIRED").length,
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
      <div className=" w-full md:pl-2">
        {/* Tabs */}
        {error && <p className="text-body2 text-red-500 mb-4">{error}</p>}
        {showCreatedBanner && (
          <div className="mb-4 flex justify-end">
            <div className="flex max-w-md items-start gap-3 rounded-2xl bg-green-light px-5 py-4">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-normal">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-ink">
                  Listing published successfully!
                </p>
                <p className="text-sm text-body-text">
                  Your food listing is now available to nearby users
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreatedBanner(false)}
                className="text-body-text">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

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

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16">
            <div className="lg:w-59.5 lg:h-53 rounded-full bg-green-light flex items-center justify-center mb-4">
              <img
                src="/empty-listing.png"
                alt="No Listing"
                className="object-cover w-full h-full"
              />
            </div>
            <p className="text-regular font-medium text-ink">
              No active listing
            </p>
            <p className="text-normal font-regular text-ink mt-1 max-w-xs">
              Create your first surplus food listing and start reaching nearby
              people
            </p>
            <PrimaryButton
              onClick={onCreateListing}
              className="md:max-w-sm mt-4 w-auto rounded-xl px-6 py-3">
              <span
                className="flex 
                            justify-center items-center
                            text-regular text-white gap-1">
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
                    {filtered.map((l, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[2fr_1fr_1.2fr_1fr_auto] items-center px-6 py-4">
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
                          onClick={() => onEditListing?.(l)}
                          className="rounded-lg border border-border-muted px-4 py-1.5 text-body2 text-ink w-fit">
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
