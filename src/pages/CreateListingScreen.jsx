import { useEffect, useRef, useState } from 'react';
import { Upload, Clock, MapPin, X, CheckCircle2 } from 'lucide-react';

import DashboardLayout from '../components/DashboardLayout.jsx';
import TextField from '../components/TextField.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { createListing, getVendorProfile } from '../services/auth.js';
import { uploadImageToCloudinary } from '../services/uploadImage.js';

const CATEGORY_OPTIONS = [
  'Cooked Meals',
  'Rice Dishes',
  'Pastries',
  'Bread',
  'Drinks',
  'Desserts',
  'Fast Food',
  'Snacks',
];

export default function CreateListingScreen({ onNavigate, onBack, onLogout }) {
  const fileInputRef = useRef(null);

  const [mealName, setMealName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState(2);
  const [price, setPrice] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  const [pickupDeadline, setPickupDeadline] = useState('');
  const [locationMode, setLocationMode] = useState('vendor'); // 'vendor' | 'custom'
  const [vendorAddress, setVendorAddress] = useState('');
  const [customStreet, setCustomStreet] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [customState, setCustomState] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);

  const [photoFile, setPhotoFile] = useState([]);
  const [photoPreview, setPhotoPreview] = useState([]);

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch the vendor's business address so "Use Business Address" actually populates
  useEffect(() => {
    (async () => {
      try {
        const res = await getVendorProfile();
        console.log('vendor profile response:', res); // TEMP — remove once shape is confirmed

        const vendor = res?.data;
        const parts = [vendor?.businessName, vendor?.permanentAddress].filter(
          Boolean,
        );
        setVendorAddress(parts.join(' — ') || 'No business address on file');
      } catch (err) {
        console.error('Failed to load vendor profile:', err);
        setVendorAddress('Could not load business address');
      }
    })();
  }, []);

  const MAX_PHOTOS = 3;

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (photoFile.length >= MAX_PHOTOS) {
      setError(`You can only upload up to ${MAX_PHOTOS} photos.`);
      e.target.value = '';
      return;
    }

    const remainingSlots = MAX_PHOTOS - photoFile.length;
    const filesToAdd = files.slice(0, remainingSlots);
    const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file));

    setPhotoFile((prev) => [...prev, ...filesToAdd]);
    setPhotoPreview((prev) => [...prev, ...newPreviews]);

    e.target.value = '';
  };

  const removePhoto = (index) => {
    setPhotoFile((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const customAddress = [customStreet, customCity, customState]
    .filter(Boolean)
    .join(', ');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let imageUrls = [];

      if (photoFile.length) {
        imageUrls = await Promise.all(
          photoFile.map((file) => uploadImageToCloudinary(file)),
        );
      }

      const payload = {
        foodName: mealName,
        category,
        description,
        quantity: Number(quantity),
        useVendorLocation: locationMode === 'vendor',
        pickupLocation:
          locationMode === 'vendor' ? vendorAddress : customAddress,
        imageUrls,
        isHealthy: false,
        isFree,
        price: isFree ? 0 : Number(price),
      };

      const res = await createListing(payload);
      const created = res?.data?.listing || res?.data || res;

      setLoading(false);
      setShowSuccess(true);
    } catch (err) {
      setError(err.message || 'Something went wrong publishing your listing.');
      setLoading(false);
    }
  };

  const handleViewListings = () => {
    setShowSuccess(false);
    onNavigate?.('listings');
  };

  return (
    <DashboardLayout
      active="listings"
      onNavigate={onNavigate}
      onLogout={onLogout}
      title="Create New Listing"
      subtitle="Add details about the food you want to share"
      location="Ikeja, Lagos">
      {error && <p className="mb-4 text-body2 text-error">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* LEFT COLUMN — LISTING INFORMATION (one card, incl. buttons) */}
        <div className="order-2 lg:order-0">
          <div className="rounded-2xl border border-border-fade bg-white p-5">
            <h2 className="mb-5 text-lg font-semibold text-ink">
              Listing Information
            </h2>

            <div className="space-y-5">
              <div>
                <label className="mb-1 block text-body1 font-semibold text-ink">
                  1. Food Name <span className="text-error">*</span>
                </label>
                <TextField
                  placeholder="Enter your food name"
                  required
                  variant="profile"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                />
                <p className="mt-1 text-caption text-body-text">
                  Give your food a clear and appealing name.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-body1 font-semibold text-ink">
                  2. Category <span className="text-error">*</span>
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-border-muted px-4 py-3 text-body1 text-ink focus:outline-none focus:ring-2 focus:ring-green-normal">
                  <option value="">Select</option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-caption text-body-text">
                  Choose the category that best fits your food.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-body1 font-semibold text-ink">
                  3. Price <span className="text-error">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <TextField
                    type="number"
                    placeholder="Enter your price"
                    variant="profile"
                    value={price}
                    disabled={isFree}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  <label className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm text-body-text">
                    <input
                      type="checkbox"
                      checked={isFree}
                      onChange={(e) => {
                        setIsFree(e.target.checked);
                        if (e.target.checked) setPrice('');
                      }}
                      className="h-4 w-4 rounded border-border-muted text-green-normal focus:ring-green-normal"
                    />
                    This listing is free
                  </label>
                </div>
                <p className="mt-1 text-caption text-body-text">
                  Set a fair price or offer it for free.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-body1 font-semibold text-ink">
                  4. Quantity <span className="text-error">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex w-[70%] items-center gap-3 rounded-full border border-border-muted px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Number(q) + 1)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-normal text-white">
                      +
                    </button>
                    <span className="flex-1 text-center text-body1 font-medium text-ink">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Math.max(1, Number(q) - 1))
                      }
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-normal text-white">
                      −
                    </button>
                  </div>

                  <div className=" flex gap-3 max-w-[30%] w-full">
                    <button
                      type="button"
                      onClick={() => setCategory('Cooked Meals')}
                      className={`shrink-0 rounded-2xl border px-6 py-3 text-normal font-medium transition-colors ${
                        category === 'Cooked Meals'
                          ? 'border-green-normal bg-green-light text-green-normal'
                          : 'border-border-muted text-body-text'
                      }`}>
                      Meals
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategory('Drinks')}
                      className={`shrink-0 rounded-2xl border px-6 py-3 text-normal font-medium transition-colors ${
                        category === 'Drinks'
                          ? 'border-green-normal bg-green-light text-green-normal'
                          : 'border-border-muted text-body-text'
                      }`}>
                      Drinks
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-caption text-body-text">
                  How many portions are available?
                </p>
              </div>

              <div>
                <label className="mb-1 block text-body1 font-semibold text-ink">
                  5. Pickup Location <span className="text-error">*</span>
                </label>
                <div className="flex items-center gap-3 rounded-xl bg-green-light p-4">
                  <MapPin className="h-5 w-5 shrink-0 text-green-normal" />
                  <div className="flex-1">
                    <p className="font-medium text-ink">
                      {locationMode === 'vendor'
                        ? vendorAddress ||
                          'Your business address would appear here'
                        : customAddress || 'No address entered yet'}
                    </p>
                    <p className="text-sm text-body-text">
                      This is where the user will pick up the food
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLocationModal(true)}
                    className="shrink-0 rounded-full border border-green-normal bg-white px-4 py-2 text-sm font-semibold text-green-normal transition-colors hover:bg-green-light">
                    Change Location
                  </button>
                </div>
                <p className="mt-1 text-caption text-body-text">
                  Ensure the location is accurate for smooth pickups
                </p>
              </div>

              <div>
                <label className="mb-1 block text-body1 font-semibold text-ink">
                  6. Pickup Deadline <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    type="time"
                    required
                    value={pickupDeadline}
                    onChange={(e) => setPickupDeadline(e.target.value)}
                    className="w-full rounded-xl border border-border-muted px-4 py-3 pr-10 text-body1 text-ink focus:outline-none focus:ring-2 focus:ring-green-normal"
                  />
                </div>
                <p className="mt-1 text-caption text-body-text">
                  Listing would end at this time
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 rounded-xl border border-border-muted px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface-secondary">
                Cancel
              </button>
              <PrimaryButton
                type="submit"
                className="flex-1 rounded-2xl px-2 py-2"
                disabled={loading}>
                {loading ? 'Publishing...' : 'Publish Listing'}
              </PrimaryButton>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — FOOD IMAGE + DESCRIPTION */}
        <div className="order-1 space-y-6 lg:order-0">
          <div className="rounded-2xl border border-border-fade bg-white p-5">
            <h2 className="mb-1 text-lg font-semibold text-ink">
              Food image <span className="text-error">*</span>
            </h2>
            <p className="mb-4 text-caption text-body-text">
              Add a clear photo of your food
            </p>
            {photoPreview.length < MAX_PHOTOS && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-border-muted p-8 text-center transition-colors hover:bg-green-light/40">
                <Upload className="mx-auto mb-3 h-8 w-8 text-body-text" />
                <p className="font-semibold text-ink">Upload photos</p>
                <p className="mt-1 text-sm text-body-text">or drag and drop</p>
                <p className="text-caption text-body-text">PNG,JPG up to 5MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="hidden"
            />
            {photoPreview.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4">
                {photoPreview.map((preview, index) => (
                  <div
                    key={index}
                    className="relative h-30 w-30 shrink-0 overflow-hidden rounded-xl">
                    <img
                      src={preview}
                      alt={`Listing photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-normal text-white">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border-fade bg-white p-5">
            <h2 className="mb-3 text-lg font-semibold text-ink">
              Description <span className="text-error">*</span>
            </h2>
            <textarea
              rows={6}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a short description of your food"
              className="w-full rounded-xl border border-border-muted px-4 py-3 text-body1 text-body-text placeholder:text-body-text focus:outline-none focus:ring-2 focus:ring-green-normal"
            />
          </div>
        </div>
      </form>

      {/* CHANGE LOCATION MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink">
                  Change pickup location
                </h3>
                <p className="text-sm text-body-text">
                  Choose how you want to set the pickup location for this
                  listing
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="text-body-text">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
                  locationMode === 'vendor'
                    ? 'border-green-normal bg-green-light'
                    : 'border-border-muted'
                }`}>
                <input
                  type="radio"
                  name="locationMode"
                  checked={locationMode === 'vendor'}
                  onChange={() => setLocationMode('vendor')}
                  className="mt-1 h-4 w-4 text-green-normal focus:ring-green-normal"
                />
                <div>
                  <p className="font-medium text-ink">Use Business Address</p>
                  <p className="text-sm text-body-text">
                    {vendorAddress || 'Loading your business address…'}
                  </p>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
                  locationMode === 'custom'
                    ? 'border-green-normal bg-green-light'
                    : 'border-border-muted'
                }`}>
                <input
                  type="radio"
                  name="locationMode"
                  checked={locationMode === 'custom'}
                  onChange={() => setLocationMode('custom')}
                  className="mt-1 h-4 w-4 text-green-normal focus:ring-green-normal"
                />
                <div>
                  <p className="font-medium text-ink">
                    Enter Another Pickup Location
                  </p>
                  <p className="text-sm text-body-text">
                    Add a different location for this specific listing
                  </p>
                </div>
              </label>
            </div>

            {locationMode === 'custom' && (
              <div className="mt-4 space-y-4 border-t border-border-muted pt-4">
                <div>
                  <label className="mb-2 block text-body1 font-semibold text-ink">
                    Street Name
                  </label>
                  <TextField
                    placeholder="e.g 15, Sogundade street.."
                    variant="profile"
                    value={customStreet}
                    onChange={(e) => setCustomStreet(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-body1 font-semibold text-ink">
                      City
                    </label>
                    <TextField
                      placeholder="City"
                      variant="profile"
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-body1 font-semibold text-ink">
                      State
                    </label>
                    <TextField
                      placeholder="State"
                      variant="profile"
                      value={customState}
                      onChange={(e) => setCustomState(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <PrimaryButton
              className="rounded-2xl py-2 px-2 mt-6"
              onClick={() => setShowLocationModal(false)}>
              Save Location
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-light">
              <CheckCircle2 className="h-9 w-9 text-green-normal" />
            </div>

            <h3 className="text-xl font-bold text-ink">Listing Published</h3>

            <p className="mt-2 text-body2 text-body-text">
              Your surplus food listing is now live and visible to nearby users.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowSuccess(false)}
                className="flex-1 rounded-xl border border-border-muted px-4 py-3 text-sm font-medium text-ink hover:bg-surface-secondary transition-colors">
                Create Another
              </button>

              <PrimaryButton className="flex-1 rounded-2xl py-2 px-2" onClick={handleViewListings}>
                View Listings
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
