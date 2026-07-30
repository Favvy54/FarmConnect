import { useRef, useState } from 'react';
import {
  Camera,
  Upload,
  Calendar,
  Clock,
  MapPin,
  Tag,
  CheckCircle2,
} from 'lucide-react';

import DashboardLayout from '../components/DashboardLayout.jsx';
import TextField from '../components/TextField.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';

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
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const addTag = () => {
    const value = tagInput.trim();
    if (!value || tags.includes(value)) return;

    setTags((prev) => [...prev, value]);
    setTagInput('');
  };

  const removeTag = (tag) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Replace with real API call
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setLoading(false);
    setShowSuccess(true);
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
      subtitle="Add surplus food so nearby people can discover and reserve it."
      location="Ikeja, Lagos">
      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border-fade bg-white p-5">
            <h2 className="text-lg font-semibold text-ink mb-5">
              Listing Details
            </h2>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-body1 font-semibold text-ink">
                  Meal Name
                </label>
                <TextField
                  placeholder="e.g. Jollof Rice & Chicken"
                  required
                  variant="profile"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-body1 font-semibold text-ink">
                    Category
                  </label>
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-border-muted px-4 py-3 text-body1 text-ink focus:outline-none focus:ring-2 focus:ring-green-normal">
                    <option value="">Select category</option>
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-body1 font-semibold text-ink">
                    Quantity Available
                  </label>
                  <TextField
                    placeholder="e.g. 10 packs"
                    required
                    variant="profile"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-body1 font-semibold text-ink">
                  Price (₦)
                </label>
                <TextField
                  type="number"
                  placeholder="Enter price"
                  required
                  variant="profile"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-body1 font-semibold text-ink">
                  Description
                </label>
                <textarea
                  rows={5}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the meal, ingredients, portion size, and pickup instructions."
                  className="w-full rounded-xl border border-border-muted px-4 py-3 text-body1 text-body-text placeholder:text-body-text focus:outline-none focus:ring-2 focus:ring-green-normal"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border-fade bg-white p-5">
            <h2 className="mb-5 text-lg font-semibold text-ink">
              Pickup Details
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-body1 font-semibold text-ink">
                  Pickup Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full rounded-xl border border-border-muted px-4 py-3 pr-10 text-body1 text-ink focus:outline-none focus:ring-2 focus:ring-green-normal"
                  />
                  <Calendar className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-body-text" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-body1 font-semibold text-ink">
                  Pickup Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    required
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full rounded-xl border border-border-muted px-4 py-3 pr-10 text-body1 text-ink focus:outline-none focus:ring-2 focus:ring-green-normal"
                  />
                  <Clock className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-body-text" />
                </div>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-body1 font-semibold text-ink">
                Pickup Location
              </label>
              <div className="relative">
                <TextField
                  placeholder="Enter pickup address"
                  required
                  variant="profile"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <MapPin className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-body-text" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border-fade bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-normal" />
              <h2 className="text-lg font-semibold text-ink">Tags</h2>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="rounded-full bg-green-light px-3 py-1 text-sm font-medium text-green-normal hover:bg-green-100 transition-colors">
                  {tag} ×
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag"
                className="flex-1 rounded-xl border border-border-muted px-4 py-3 text-body1 text-ink focus:outline-none focus:ring-2 focus:ring-green-normal"
              />

              <button
                type="button"
                onClick={addTag}
                className="rounded-xl border border-green-normal px-4 py-3 text-sm font-semibold text-green-normal hover:bg-green-light transition-colors">
                Add
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border-fade bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold text-ink">
              Listing Photo
            </h2>

            <div className="rounded-2xl border-2 border-dashed border-border-muted bg-surface-secondary p-6 text-center">
              <div className="mx-auto mb-4 flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl bg-white">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Listing preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera className="h-12 w-12 text-body-text" />
                )}
              </div>

              <p className="mb-4 text-sm text-body-text">
                Upload a clear photo of the meal
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-green-normal bg-white px-4 py-2 text-sm font-semibold text-green-normal hover:bg-green-light transition-colors">
                <Upload className="h-4 w-4" />
                {photoFile ? 'Change Photo' : 'Upload Photo'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-border-fade bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold text-ink">
              Listing Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-body-text">Meal</span>
                <span className="font-medium text-ink">{mealName || '—'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-body-text">Category</span>
                <span className="font-medium text-ink">{category || '—'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-body-text">Quantity</span>
                <span className="font-medium text-ink">{quantity || '—'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-body-text">Price</span>
                <span className="font-medium text-ink">
                  {price ? `₦${price}` : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-body-text">Pickup</span>
                <span className="font-medium text-ink text-right">
                  {pickupDate || '—'} {pickupTime || ''}
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-green-light p-3 text-sm text-green-normal">
              Listings are visible immediately after publishing.
            </div>
          </div>

          <div className="rounded-2xl border border-border-fade bg-white p-5">
            <PrimaryButton block type="submit" disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Listing'}
            </PrimaryButton>

            <button
              type="button"
              onClick={onBack}
              className="mt-3 w-full rounded-xl border border-border-muted px-4 py-3 text-sm font-medium text-ink hover:bg-surface-secondary transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </form>

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

              <PrimaryButton className="flex-1" onClick={handleViewListings}>
                View Listings
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
