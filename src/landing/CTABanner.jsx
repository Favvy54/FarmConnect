import Button from './Button.jsx';
import { AdvancedImage } from "@cloudinary/react";
import { backgrounds } from "../libs/cloudinaryImages";

export default function CTABanner({ onFindFood, onListSurplus }) {
  return (
    <section className=" max-w-full mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-8">
      <div className="w-[20%] relative">
        <AdvancedImage
          cldImg={backgrounds.cta}
          alt="Bowl of surplus meal ready for pickup"
          className=" absolute -left-20 top-1/2 -translate-y-1/2 w-67.25 h-64 rounded-full object-cover shrink-0"
        />
      </div>

      <div className="w-[50%] -ml-20 text-center md:text-left">
        <h2 className="text-h2 text-3xl font-bold text-white">
          Ready to Find or Share Your Next Meal?
        </h2>
        <p className="text-body1 text-white/85 mt-2 max-w-xl">
          Whether you're listing surplus food or reserving a meal, FarmConnect
          makes the process simple, fast, and reliable.
        </p>
      </div>

      <div className="w-[30%] flex gap-4 justify-center">
        <Button
          label="Find food near me"
          variant="filled-white"
          onClick={onFindFood}
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
