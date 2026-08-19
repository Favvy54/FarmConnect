import { useEffect, useState } from 'react';

const activities = [
  'Make your Orders Now!!!!',
  'Emeka Cuisine just put up free food',
  'Mama Grace Kitchen just added a new listing',
  'Green Harvest just shared fresh meals',
  'A user just reserved a meal!',
  'Emeka Cuisine just added 10 meals',
  'Fresh Bites just put up a new food listing',
];

export default function ActivityTicker() {
  const [items, setItems] = useState(activities);

  useEffect(() => {
    // Later, this can come from your backend activity API.
    setItems(activities);
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
            {[...items, ...items].map((activity, index) => (
              <span
                key={index}
                className="text-sm font-medium text-ink">
                • {activity}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
