import BakerImg from "../assets/images/restaurant.png"
const USER_TYPES = ['Restaurant', 'Students', 'Bakeries', 'Families', 'Event Caterers', 'Charities']

export default function WhoCanUse() {
  return (
    <section className="max-w-7xl flex flex-col mx-auto px-6 pt-20 pb-50 md:flex-row justify-between items-center">
      <div className="w-[50%]">
        <h2 className="text-h2 font-bold text-green-normal">Who can use FarmConnect?</h2>
        <p className="text-body1 text-body-text mt-3">
          Whether you're a restaurant with surplus meals or a student looking for affordable food,
          FarmConnect connects the right people at the right time.
        </p>

        <div className="rounded-2xl border border-green-normal p-3 grid grid-cols-2 gap-3 mt-8 max-w-sm">
          {USER_TYPES.map((type, i) => (
            <span
              key={type}
              className={`text-center rounded-xl px-4 py-2.5 text-body1 font-medium
                ${i === 0 ? 'bg-green-normal text-white' : 'text-green-normal'}`}
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      
      <div className=" relative rounded-3xl  aspect-4/5 max-w-md max-h-125">
        <div className="absolute -bottom-15 right-10 w-full h-full bg-linear-to-b from-green-normal to-white rounded-3xl"/>
        <div className="relative w-full h-full rounded-3xl overflow-hidden">
            <img
          src={BakerImg}
          alt="Chef packaging surplus meals for pickup"
          className="w-full h-full object-cover z-50"
        />
        </div>
      
      
           </div>
      
    </section>
  )
}
