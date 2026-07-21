import { AdvancedImage } from "@cloudinary/react";
import { icons } from '../libs/cloudinaryImages';

const FEATURES = [
  {
    icon: icons.foodBasket,
    title: 'Quality Meals',
    body: 'Access free or affordable surplus food from trusted vendors.',
  },
  {
    icon: icons.lightning,
    title: 'Quick Reservation',
    body: 'Reserve meals in seconds and collect them on time.',
  },
  {
    icon: icons.recycle,
    title: 'Reduce Waste',
    body: 'Help ensure good food reaches people instead of being discarded.',
  },
  {
    icon: icons.handshake,
    title: 'Win For Everyone',
    body: 'Vendors reduce waste, while families, students, and charities gain access to quality meals.',
  },
];

export default function WhyChoose() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <h2 className="text-h2 font-bold text-green-normal">
        Why choose FarmConnect?
      </h2>
      <p className="text-body1 text-body-text mt-3 max-w-2xl">
        From discovering quality meals to helping vendors reduce waste,
        FarmConnect makes surplus food easier to share, reserve, and collect.
      </p>

      <div className="grid md:grid-cols-4 gap-6 mt-10">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-2xl border border-green-normal px-6 py-8 flex flex-col items-center text-center">
            <AdvancedImage cldImg={Icon} className="w-8 h-8 mb-4" alt={title} />
            <h3 className="text-body1 font-bold text-ink mb-2">{title}</h3>
            <p className="text-body2 text-body-text">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
