import { useEffect, useState } from 'react';
import { getUserActivities } from '../services/auth.js';


const formatRelativeTime = (date) => {

  const now = Date.now();
  const created = new Date(date).getTime();

  const difference = Math.max(0, now - created);

  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) {
    return 'just now';
  }

  if (minutes < 60) {
    return `${ minutes } ${ minutes === 1 ? 'min' : 'mins' } ago`;
  }

  if (hours < 24) {
    return `${ hours } ${ hours === 1 ? 'hr' : 'hrs' } ago`;
  }

  return '24 hrs ago';
};


export default function ActivityTicker() {

  const [items, setItems] = useState([]);


  useEffect(() => {

    let cancelled = false;


    const loadActivities = async () => {

      try {

        const response = await getUserActivities();

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
          'Failed to load user activities:',
          error,
        );

      }

    };


    // Load immediately
    loadActivities();


    // Refresh activities every 5 seconds
    const interval = setInterval(
      loadActivities,
      5000,
    );


    return () => {

      cancelled = true;

      clearInterval(interval);

    };

  }, []);


  return (
    <div className="bg-white border-border-muted border-t bottom-0 fixed left-0 overflow-hidden right-0 z-40">

      <div className="flex h-10 items-center">

        <div className="bg-green-normal font-semibold px-4 py-2 shrink-0 text-sm text-white">
          Live Activity
        </div>


        <div className="flex-1 overflow-hidden relative">

          {items.length > 0 ? (

            <div className="animate-activity-ticker flex gap-12 items-center px-6 w-max whitespace-nowrap">

              {[...items, ...items].map(
                (activity, index) => (

                  <span
                    key={`${ activity._id } -${ index } `}
                    className="font-medium text-ink text-sm"
                  >
                    • {activity.message} —{' '}
                    {formatRelativeTime(
                      activity.createdAt,
                    )}
                  </span>

                ),
              )}

            </div>

          ) : (

            <div className="font-medium px-6 text-ink text-sm">
              No recent activity right now.
            </div>

          )}

        </div>

      </div>

    </div>
  );

}
