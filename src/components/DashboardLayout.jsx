import { useState } from 'react';
import VendorSidebar from '../components/VendorSidebar.jsx';
import VendorTopBar from '../components/VendorTopBar.jsx';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Menu, X, MapPin, Bell, UserCircle } from 'lucide-react';

export default function DashboardLayout({
  active,
  role = 'vendor',
  onNavigate,
  onLogout,
  title,
  subtitle,
  location,
  topBarRight,
  profileImage,
  hideTopBar= false,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [locationPopoverOpen, setLocationPopoverOpen] = useState(false);

  return (
    <>
      <div className="fixed max-w-screen h-16 md:hidden top-0 left-0 w-full  bg-white border-b border-border-muted z-30 flex items-center  gap-6 justify-between px-2 ">
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-10 h-10 flex  items-center justify-center">
          <Menu className="w-6 h-6 text-ink" />
        </button>
        <div>
          <p className="text-body1 text-center font-semibold text-ink">
            Farm
            <span className="font-normal text-body1">Connect</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Popover
            open={locationPopoverOpen}
            onOpenChange={setLocationPopoverOpen}>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-lg px-2 py-1 transition-colors"
                />
              }>
              <MapPin
                className="w-7 h-7 shrink-0"
                style={{
                  color: locationPopoverOpen
                    ? '#22C55E' /* your green-normal hex */
                    : '#2e2e2e',
                }}
              />
            </PopoverTrigger>

            <PopoverContent align="end" className="w-72 p-4">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-green-normal mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Business location
                  </p>
                  <p className="text-sm text-body-text mt-1 wrap-break-word">
                    {location}
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Bell className="w-7 h-7 text-ink" />
          <div className="w-8 h-8 rounded-full overflow-hidden  flex items-center justify-center">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserCircle className="w-7 h-7 text-ink" />
            )}
          </div>
        </div>
      </div>

      {/* Backdrop — tapping outside the open sidebar closes it, mobile only */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/30 z-20"
        />
      )}

      <div className="relative">
        <VendorSidebar
          active={active}
          role={role}
          onNavigate={(key) => {
            setSidebarOpen(false);
            onNavigate?.(key);
          }}
          onLogout={onLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          className="fixed top-0 left-0 h-screen w-64 z-30 bg-white"
        />

        <div
          className={`relative md:ml-64 px-4 ${
            hideTopBar ? 'mt-20 md:mt-4 md:py-4' : 'mt-20 md:mt-4 md:py-9.5'
          }`}>
          {!hideTopBar && (
            <VendorTopBar
              title={title}
              subtitle={subtitle}
              location={location}
              rightSlot={topBarRight}
              profileImage={profileImage}
            />
          )}

          {children}
        </div>
      </div>
    </>
  );
}
