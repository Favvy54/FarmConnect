import { useState, useRef } from 'react';
import { Camera, Upload } from 'lucide-react';
import TextField from '../components/TextField.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { getEmail } from '../services/auth.js';
// TODO: swap this for the real user-profile call once the endpoint/payload
// shape is documented — see notes at the bottom of handleSubmit.
// import { createUserProfile } from '../services/auth.js'

const GENDERS = ['Male', 'Female', 'Prefer not to'];

// Nigeria's 36 states + FCT. Swap this out if state options should come
// from the backend instead of being hardcoded here.
const STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT (Abuja)',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
];

const FOOD_CATEGORIES = [
  'Rice Dishes',
  'Cooked Meals',
  'Pastries',
  'Bread',
  'Drinks',
  'Desserts',
  'Fast Food',
  'Snacks',
  'Grilled Food',
  'Seafood',
  'Vegetables',
  'Fruits',
  'Beverages',
  'Local Delicacies',
];

export default function UserProfileScreen({ onComplete }) {
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState(null);
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [preferredFoodCategories, setPreferredFoodCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Image Upload
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const toggleFoodCategory = (category) => {
    setPreferredFoodCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const validateForm = () => {
    if (!dateOfBirth) return 'Please enter your date of birth.';
    if (!gender) return 'Please select a gender.';
    if (!state) return 'Please select a state.';
    if (!city) return 'Please select a city.';
    if (!streetAddress.trim()) return 'Street address is required.';
    if (preferredFoodCategories.length === 0)
      return 'Please select at least one preferred food category.';
    if (!photoFile) return 'Please upload a profile photo.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      // TODO: no documented endpoint/payload shape yet for user profile
      // creation. Once you have it (mirroring what /api/v1/vendors/profile
      // looked like for the vendor flow), replace this block with the
      // real call, e.g.:
      //
      // await createUserProfile({
      //   email: getEmail(),
      //   dateOfBirth,
      //   gender,
      //   state,
      //   city,
      //   streetAddress,
      //   preferredFoodCategories,
      //   profileImage,
      // })

      console.log('User profile payload (not yet sent to backend):', {
        email: getEmail(),
        dateOfBirth,
        gender,
        state,
        city,
        streetAddress,
        preferredFoodCategories,
      });

      onComplete?.();
    } catch (err) {
      setError(err.message || 'Something went wrong creating your profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid px-8 py-6 gap-12 md:grid-cols-2">
      {/* LEFT COLUMN */}
      <div className="space-y-6">
        <div>
          <h1 className="text-h2 font-bold text-ink">
            Complete your user profile
          </h1>
          <p className="mt-2 text-body1 text-body-text">
            This helps us to personalize your experience
          </p>
        </div>

        {error && <p className="text-body2 text-red-500">{error}</p>}

        <div>
          <label className="mb-2 block text-body1 font-bold text-ink">
            Date Of Birth
          </label>
          <input
            type="date"
            required
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full rounded-xl border border-border-muted px-4 py-3 text-body1 text-ink focus:outline-none focus:ring-2 focus:ring-green-normal"
          />
        </div>

        <div>
          <label className="block text-body1 font-bold text-ink mb-2">
            Gender
          </label>
          <div className="flex flex-wrap gap-3">
            {GENDERS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setGender(option)}
                className={`rounded-xl border px-5 py-3 text-body1 transition-colors
                    ${
                      gender === option
                        ? 'border-green-normal bg-green-light text-ink'
                        : 'border-border-muted text-body-text'
                    }`}>
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-body1 font-bold text-ink">
              State
            </label>
            <select
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full rounded-xl border border-border-muted px-4 py-3 text-body1 text-ink">
              <option value="">State</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-body1 font-bold text-ink">
              City
            </label>
            {/* TODO: ideally this list depends on the selected state.
               For now it's a free-text-style placeholder select — swap
               for a real city list (e.g. fetched per state) later. */}
            <TextField
              placeholder="City"
              required
              variant="profile"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-body1 font-bold text-ink">
            Street Address
          </label>
          <TextField
            placeholder="Street Address"
            required
            variant="profile"
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-body1 font-bold text-ink mb-2">
            Preferred Food Category
          </label>
          <div className="grid grid-cols-4 gap-3">
            {FOOD_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => toggleFoodCategory(category)}
                className={`rounded-xl border px-4 py-3 text-body2 text-center transition-colors
                    ${
                      preferredFoodCategories.includes(category)
                        ? 'border-green-normal bg-green-light text-ink'
                        : 'border-border-muted text-body-text'
                    }`}>
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="space-y-8">
        <div className="rounded-3xl bg-green-light p-10 flex flex-col items-center text-center">
          <div className="relative">
            <div className="w-40 h-40 rounded-full flex items-center justify-center overflow-hidden">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img src="/img-placeholder.png" alt="Profile placeholder" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-8 right-5 w-6 h-6 rounded-full bg-white shadow-xl flex items-center justify-center">
              <Camera className="w-4 h-4 text-green-normal" />
            </button>
          </div>

          <h2 className="text-3xl font-bold text-ink mt-6">
            Add a profile photo
          </h2>
          <p className="text-regular text-ink mt-2 max-w-sm">
            Adding a photo helps build trust in the community and makes your
            experience more personal
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
            className="mt-6 flex items-center gap-2 rounded-xl border-2 border-green-normal bg-white text-green-normal px-6 py-3 text-body1 font-medium">
            <Upload className="w-4 h-4" />
            {photoFile ? photoFile.name : 'Upload Photo'}
          </button>
        </div>

        <PrimaryButton disabled={loading} type="submit">
          {loading ? 'Saving...' : 'Complete Profile'}
        </PrimaryButton>
      </div>
    </form>
  );
}
