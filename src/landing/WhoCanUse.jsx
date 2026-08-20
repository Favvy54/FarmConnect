import { useState } from 'react'
import { AdvancedImage } from "@cloudinary/react";
import { backgrounds } from "../libs/cloudinaryImages";

const USER_TYPES = ['Restaurant', 'Students', 'Bakeries', 'Families', 'Event Caterers', 'Charities']

const TYPE_IMAGES = {
  Restaurant: null,
  Students: '/student.png',
  Bakeries: '/bakers.png',
  Families: '/family.png',
  'Event Caterers': '/caterers.png',
  Charities: '/charities.png',
}

export default function WhoCanUse() {
  const [activeType, setActiveType] = useState('Restaurant')

  const activeImage = TYPE_IMAGES[activeType]

  return (
    <section className="flex flex-col-reverse gap-16 px-3 pb-20 pt-20 md:pb-50 lg:flex-row md:justify-between md:items-center">
      <div className=" w-full lg:w-[50%]">
        <h2 className="text-h3 md:text-h2 font-bold text-green-normal">Who can use FarmConnect?</h2>
        <p className="text-body2 md:text-body1 text-body-text mt-3">
          Whether you're a restaurant with surplus meals or a student looking for affordable food,
          FarmConnect connects the right people at the right time.
        </p>

        <div className="rounded-2xl border border-green-normal p-3 grid grid-cols-2 gap-3 mt-8 w-full">
          {USER_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`text-center rounded-xl px-2 py-2.5 text-body2 md:text-body1 font-medium transition-colors
                ${activeType === type ? 'bg-green-normal text-white' : 'text-green-normal'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>


      <div className=" relative rounded-3xl max-h-1/2 h-full aspect-4/5 max-w-[70%] mx-auto lg:max-h-125">
        <div className="absolute -bottom-10 right-5 md:-bottom-15 md:right-10 w-full h-full bg-linear-to-b from-green-normal to-white rounded-3xl"/>
        <div className="relative w-full h-full rounded-3xl overflow-hidden">
          {activeImage ? (
            <img
              src={activeImage}
              alt={`${activeType} using FarmConnect`}
              className="w-full h-full object-cover"
            />
          ) : (
            <AdvancedImage
              cldImg={backgrounds.restaurant}
              alt="Chef packaging surplus meals for pickup"
              className="w-full h-full object-cover z-50"
            />
          )}
        </div>
      </div>

    </section>
  )
}
