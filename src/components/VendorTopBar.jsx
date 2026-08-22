import { MapPin, Bell, UserCircle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default function VendorTopBar({
  title,
  subtitle,
  location = 'Ikeja, Lagos',
  rightSlot,
  profileImage,
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      {/* LEFT SIDE — takes remaining width */}
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl md:text-body1 lg:text-[30px] font-bold text-ink truncate">
          {title}
        </h1>

        <p className="mt-1 text-body2 text-ink line-clamp-2">{subtitle}</p>
      </div>

      {/* RIGHT SIDE — fixed width */}
      <div className="hidden md:flex items-center gap-4 shrink-0">
        {rightSlot}

        <Popover>
          <PopoverTrigger
            render={
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg px-2 py-1"
              />
            }>
            <MapPin className="w-8 h-8 text-green-normal shrink-0" />

          </PopoverTrigger>

          <PopoverContent align="end" className="w-72 p-4">
            <div className="flex items-start gap-2">
              <MapPin className="w-8 h-8 text-green-normal mt-0.5 shrink-0" />

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

        <Bell className="w-8 h-8 text-ink" />

        <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <UserCircle className="w-8 h-8 text-ink" />
          )}
        </div>
      </div>
    </div>
  );
}
