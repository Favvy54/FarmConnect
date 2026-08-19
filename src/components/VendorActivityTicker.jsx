import { useEffect, useState } from 'react';
import { getVendorActivities } from '../services/auth.js';

export default function VendorActivityTicker() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadActivities = async () => {
      try {
        const response = await getVendorActivities();

        if (cancelled) return;

        const activities =
          response?.data || [];

        setItems(
          Array.isArray(activities)
            ? activities
            : [],
        );
      } catch (error) {
        console.error(
          'Failed to load vendor activities:',
          error,
        );
      }
    };

    // Load immediately
    loadActivities();

    // Poll every 5 seconds
    const interval = setInterval(
      loadActivities,
      5000,
    );

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!items.length) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 overflow-hidden border-t border-border-muted bg-white">
      <div className="flex h-10 items-center">
        <div className="shrink-0 bg-green-normal px-4 py-2 text-sm font-semibold text-white">
          Live Activity
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div className="animate-activity-ticker flex w-max items-center gap-12 whitespace-nowrap px-6">
            {[...items, ...items].map(
              (activity, index) => (
                <span
                  key={`${activity._id}-${index}`}
                  className="text-sm font-medium text-ink">
                  • {activity.message}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
