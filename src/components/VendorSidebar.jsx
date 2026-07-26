import { Home, Store, Calendar, TrendingUp, Settings, LogOut, X } from 'lucide-react'

const NAV_ITEMS = [
  { icon: Home, label: 'Home', key: 'home' },
  { icon: Store, label: 'Listings', key: 'listings' },
  { icon: Calendar, label: 'Reservations', key: 'reservations' },
  { icon: TrendingUp, label: 'Analytics', key: 'analytics' },
  { icon: Settings, label: 'Settings', key: 'settings' },
]

export default function VendorSidebar({
  active = 'home',
  onNavigate,
  onLogout,
  isOpen = false,
  onClose,
  className = '',
}) {
  return (
    <aside
      className={`border border-border-muted p-6 flex flex-col 
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${className}`}
    >
     
      <button onClick={onClose} className="md:hidden self-end mb-4">
        <X className="w-5 h-5 text-ink" />
      </button>

      <div className="flex items-center gap-2 mb-10">
        <img src="/logo-mark.svg" alt="FarmConnect logo" className="w-7 h-7" />
        <span className="text-sh1 text-lg font-bold text-ink">
          Farm<span className="font-normal text-body-text">Connect</span>
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ icon: Icon, label, key }) => (
          <button
            key={key}
            onClick={() => onNavigate?.(key)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-body1 text-left transition-colors
              ${active === key ? 'bg-green-light text-green-normal' : 'text-ink hover:bg-green-light'}`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="mt-auto flex items-center gap-2 text-red-500 text-body1 px-4 py-3"
      >
        <LogOut className="w-4 h-4" />
        Log out
      </button>
    </aside>
  )
}