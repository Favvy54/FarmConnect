import { useState } from 'react'
import { Camera, Upload } from 'lucide-react'
import TextField from '../components/TextField.jsx'
import PrimaryButton from '../components/PrimaryButton.jsx'
import { createVendorProfile } from '../services/auth.js'

const BUSINESS_TYPES = ['Restaurant', 'Event Caterer', 'Bakery']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function VendorProfileScreen({ onComplete }) {
  const [businessType, setBusinessType] = useState(null)
  const [selectedDays, setSelectedDays] = useState([])
  const [businessName, setBusinessName] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [businessPhone, setBusinessPhone] = useState('')
  const [description, setDescription] = useState('')
  const [openTime, setOpenTime] = useState('')
  const [closeTime, setCloseTime] = useState('')
  const [imageUrl, setImageUrl] = useState('') // set this once you wire actual image upload
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await createVendorProfile({
        businessName,
        businessType,
        phoneNumber: businessPhone,
        currentLocation: businessAddress,
        description,
        openingHours: `${openTime}-${closeTime}`, // confirm this is the format the backend expects
        imageUrl,
      })
      onComplete?.()
    } catch (err) {
      setError(err.message || 'Something went wrong creating your profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-12">
      {/* Left column — form fields */}
      <div>
        <h1 className="text-h2 font-bold text-ink">Complete your vendor profile</h1>
        <p className="text-body1 text-body-text mt-2">
          This helps us to personalize your experience
        </p>

        {error && (
          <p className="text-body2 text-red-500 mt-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          <div>
            <label className="block text-body1 font-bold text-ink mb-2">Business Name</label>
            <TextField
              placeholder="Business Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-body1 font-bold text-ink mb-2">Business Type</label>
            <div className="flex flex-wrap gap-3">
              {BUSINESS_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setBusinessType(type)}
                  className={`rounded-xl border px-5 py-3 text-body1 transition-colors
                    ${businessType === type
                      ? 'border-green-normal bg-green-light text-ink'
                      : 'border-border-muted text-body-text'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-body1 font-bold text-ink mb-2">Business Address</label>
            <TextField
              placeholder="Business Address"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-body1 font-bold text-ink mb-2">
              Business Phone Number
            </label>
            <TextField
              placeholder="Business Phone number"
              type="tel"
              value={businessPhone}
              onChange={(e) => setBusinessPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-body1 font-bold text-ink mb-2">Operating Hours</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-body2 text-body-text mb-1">Open at</p>
                <select
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full rounded-xl border border-border-muted px-4 py-3 text-body1 text-body-text"
                >
                  <option value="">Select time</option>
                  {Array.from({ length: 24 }).map((_, h) => (
                    <option key={h} value={`${String(h).padStart(2, '0')}:00`}>
                      {String(h).padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-body2 text-body-text mb-1">Close at</p>
                <select
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full rounded-xl border border-border-muted px-4 py-3 text-body1 text-body-text"
                >
                  <option value="">Select time</option>
                  {Array.from({ length: 24 }).map((_, h) => (
                    <option key={h} value={`${String(h).padStart(2, '0')}:00`}>
                      {String(h).padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
              {DAYS.map((day) => (
                <label key={day} className="flex items-center gap-2 text-body1 text-ink">
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day)}
                    onChange={() =>
                      setSelectedDays((prev) =>
                        prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
                      )
                    }
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Right column — photo upload + description + submit */}
      <div>
        <div className="rounded-3xl bg-green-light p-10 flex flex-col items-center text-center">
          <div className="relative w-40 h-40 rounded-full border-2 border-dashed border-green-normal flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-2 border-green-normal bg-white flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20 text-green-normal">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
              </svg>
            </div>
            <span className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center">
              <Camera className="w-4 h-4 text-green-normal" />
            </span>
          </div>

          <h2 className="text-h4 font-bold text-ink mt-6">Add a profile photo</h2>
          <p className="text-body1 text-body-text mt-2 max-w-sm">
            Adding a photo helps build trust in the community and makes your experience more
            personal
          </p>

          {/* This button doesn't upload anything yet — see note below your files */}
          <button
            type="button"
            className="mt-6 flex items-center gap-2 rounded-xl border-2 border-green-normal text-green-normal px-6 py-3 text-body1 font-medium"
          >
            <Upload className="w-4 h-4" />
            Upload Photo
          </button>
        </div>

        <div className="mt-8">
          <label className="block text-body1 font-bold text-ink mb-2">Description</label>
          <textarea
            placeholder="Enter a description that truly describes your business"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-border-muted px-4 py-4 text-body1 text-body-text placeholder:text-body-text focus:outline-none focus:ring-2 focus:ring-green-normal"
          />
        </div>

        <PrimaryButton onClick={handleSubmit} disabled={loading} className="mt-6">
          {loading ? 'Saving...' : 'Complete Profile'}
        </PrimaryButton>
      </div>
    </div>
  )
}
