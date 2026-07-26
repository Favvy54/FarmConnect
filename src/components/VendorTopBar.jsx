import { MapPin, Bell, UserCircle } from 'lucide-react';

export default function VendorTopBar({
  title,
  subtitle,
  location = 'Ikeja, Lagos',
  rightSlot,
}) {
  return (
    <div className="flex flex-col gap-1 md:gap-2 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-body2 md:text-body1 lg:text-[30px] text-2xl font-bold text-ink">
            {title}
          </h1>
        </div>

        <div className="hidden md:flex md:items-center md:gap-4 md:shrink-0">
          {rightSlot}
          <span className="flex items-center gap-1 text-regular text-ink">
            <MapPin className="w-6.5 h-6.5" />
            {location}
          </span>
          <Bell className="w-8 h-8 text-ink" />
          
            <UserCircle className="w-8 h-8 text-ink" />
        </div>
      </div>
      <p className="text-body2 text-body-text">{subtitle}</p>
    </div>
  );
}
