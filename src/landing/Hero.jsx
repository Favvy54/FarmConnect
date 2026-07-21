import { MapPin, Store } from 'lucide-react'
import Button from './Button.jsx'
import { AdvancedImage } from "@cloudinary/react";
import { backgrounds, users } from "../libs/cloudinaryImages";

export default function Hero({ onFindFood, onListSurplus }) {
  return (
    <section className="max-w-full flex items-center justify-between mx-auto px-12 py-10 flex-col gap-8 md:flex-row">
      <div className='max-w-[45%] w-full'>
        <h1 className="text-h1 font-bold leading-tight text-ink">
          Good Food.
          <br />
          <span className="text-green-normal">Shared Smarter.</span>
        </h1>

        <p className="text-body1 leading-5.75 text-body-text mt-6 max-w-full font-normal">
          Discover quality surplus meals from restaurants, bakeries, and caterers near you.
          Reserve free or discounted meals before pickup closes.
        </p>

        <div className="flex flex-wrap gap-4 mt-8">
          <Button label="Find food near me" icon={MapPin} variant="filled" onClick={onFindFood} />
          <Button label="I have surplus food" icon={Store} variant="outline" onClick={onListSurplus} />
        </div>

        <div className="flex items-center gap-3 mt-8">
          <div className="flex -space-x-3">
            <AdvancedImage cldImg={users.user1}
              alt="FarmConnect user avatar"
              className="w-9 h-9 rounded-full border-2 border-white object-cover"
            />
            <AdvancedImage cldImg={users.user2}
              alt="FarmConnect user avatar"
              className="w-9 h-9 rounded-full border-2 border-white object-cover"
            />
            <AdvancedImage cldImg={users.user3}
              alt="FarmConnect user avatar"
              className="w-9 h-9 rounded-full border-2 border-white object-cover"
            />
          </div>
          <span className="text-body2 text-body-text">
            Join thousands of people enjoying <span className="font-medium text-ink">FarmConnect</span>
          </span>
        </div>
      </div>

     
      <div className="flex items-center justify-center w-[55%]">
        <AdvancedImage cldImg={backgrounds.hero}
          alt="Vendor preparing a meal and a customer reserving it on the FarmConnect app"
          className="w-full h-full object-contain"
        />
      </div>
    </section>
  )
}
