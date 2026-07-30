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
  onNavigate,
  onLogout,
  title,
  subtitle,
  location,
  topBarRight,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <div className="fixed md:hidden top-0 left-0 w-full h-16 bg-white border-b border-border-muted z-30 flex items-center gap-4 justify-between px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-10 h-10 flex items-center justify-center">
          <Menu className="w-6 h-6 text-ink" />
        </button>
        <div className="flex items-center gap-2">
          <p className="text-regular font-semibold text-ink">
            Farm
            <span className="font-normal text-regular">Connect</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center">
                <MapPin className="w-5 h-5" />
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-fit">{location}</PopoverContent>
          </Popover>
          <Bell className="w-5 h-5 text-ink" />
          <UserCircle className="w-5 h-5 text-ink" />
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
          onNavigate={(key) => {
            setSidebarOpen(false);
            onNavigate?.(key);
          }}
          onLogout={onLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          className="fixed top-0 left-0 h-screen w-64 z-30 bg-white"
        />

        <div className="relative md:ml-64 px-4 md:py-9.5">
          <VendorTopBar
            title={title}
            subtitle={subtitle}
            location={location}
            rightSlot={topBarRight}
          />
          {children}
        </div>
      </div>
    </>
  );
}
