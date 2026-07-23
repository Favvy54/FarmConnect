import Button from './Button.jsx';
import { AdvancedImage } from "@cloudinary/react";
import { backgrounds } from "../libs/cloudinaryImages";

export default function CTABanner({ onFindFood, onListSurplus }) {
  return (
    <section className=" max-w-full px-6 py-16 flex flex-col md:flex-row items-center gap-8">
      <div className="max-w-67.25 max-h-64 w-full mt-15 md:w-[20%] relative">
        <AdvancedImage
          cldImg={backgrounds.cta}
          alt="Bowl of surplus meal ready for pickup"
          className=" absolute -left-20 top-1/2 -translate-y-1/2 w-3/4 rounded-full object-cover shrink-0"
        />
      </div>

      <div className="w-full lg:w-[50%] flex flex-col gap-3 md:-ml-20 text-center md:text-left">
        <h2 className="md:text-h2 z-50 text-h3 font-bold text-white">
          Ready to Find or Share Your Next Meal?
        </h2>
        <p className=" text-body2 md:text-body1 text-white/85 mt-2 max-w-xl">
          Whether you're listing surplus food or reserving a meal, FarmConnect
          makes the process simple, fast, and reliable.
        </p>
      </div>

      <div className="w-[30%] flex gap-4 justify-center">
        <Button
          label="Find food near me"
          variant="outline"
          onClick={onFindFood}
          className="text-body2 text-white border-2 border-white rounded-xl md:py-3.5 md:px-6.5"
        />
        <Button
          label="List surplus food"
          variant="filled-white"
          onClick={onListSurplus}
        />
      </div>
    </section>
  );
}
