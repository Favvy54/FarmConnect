import { MapPin, Store } from 'lucide-react'
import Button from './Button.jsx'
import { AdvancedImage } from "@cloudinary/react";
import { backgrounds, users } from "../libs/cloudinaryImages";

export default function Hero({ onFindFood, onListSurplus }) {
  return (
    <section className=" gap-8 w-100vw my-3 mx-3 flex flex-col items-center md:px-12 md:py-10 lg:flex-row lg:justify-between">
      <div className='flex flex-col items-center lg:max-w-[45%]  lg:items-start'>
        <h1 className="text-h2 text-center md:text-left lg:text-h1 font-bold leading-tight text-ink">
          Good Food.
          <br />
          <span className="text-green-normal">Shared Smarter.</span>
        </h1>

        <p className="text-body2 text-center md:text-body1 leading-7  md:leading-8 text-body-text mt-6 w-full font-normal md:text-left">
          Discover quality surplus meals from restaurants, bakeries, and caterers near you.
          Reserve free or discounted meals before pickup closes.
        </p>

        <div className="flex justify-center gap-4 mt-8">
          <Button label="Find food near me" icon={MapPin} variant="filled" onClick={onFindFood} className='text-body2 md:py-3.5 md:px-6.5' />
          <Button label="I have surplus food" icon={Store} variant="outline" onClick={onListSurplus} className='text-body2 md:py-3.5 md:px-6.5' />
        </div>

        <div className=" max-md:hidden md:flex items-center gap-6 mt-8">
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

     
      <div className="flex items-center justify-center lg:w-[55%]">
        <AdvancedImage cldImg={backgrounds.hero}
          fetchPriority="high"
          loading="eager"
          alt="Vendor preparing a meal and a customer reserving it on the FarmConnect app"
          className="w-full h-full object-contain"
        />
      </div>
    </section>
  )
}
