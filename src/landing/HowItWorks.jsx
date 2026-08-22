import { useState } from 'react'
import { Search, Store } from 'lucide-react'
import { backgrounds } from "../libs/cloudinaryImages";

const FIND_STEPS = [
  {
    number: '01',
    title: 'Discover',
    body: 'Browse surplus meals from nearby restaurants, caterers, and bakeries.',
  },
  {
    number: '02',
    title: 'Reserve',
    body: 'Reserve your meal before someone else does.',
  },
  {
    number: '03',
    title: 'Collect',
    body: 'Pick up your meal at the scheduled location before the pickup deadline.',
  },
]

const SHARE_STEPS = [
  {
    number: '01',
    title: 'List Your Surplus',
    body: 'Create a listing with the meal details, quantity, price (or free), and pickup time.',
  },
  {
    number: '02',
    title: 'Get Reservations',
    body: 'Interested users reserve your available meals.',
  },
  {
    number: '03',
    title: 'Hand Over',
    body: 'Confirm collection and reduce unnecessary food waste while recovering value.',
  },
]

export default function HowItWorks() {
  const [mode, setMode] = useState('find') // 'find' | 'share'

  return (
    <section id="how-it-works" className="bg-center bg-cover bg-no-repeat min-h-screen px-3 py-3 md:px-6"
    style={{ backgroundImage: `url(${backgrounds.food.toURL()})` }}>
      <div className=" text-center min-h-screen my-20">
        <h2 className="text-2xl md:text-h2 font-bold text-white md:text-center lg:text-left">How FarmConnect works</h2>
        <p className="text-body2 text-center md:text-body1 text-white/85 mt-3 max-w-full md:text-center md:max-w-md md:mx-auto lg:w-full lg:mx-0 lg:text-left">
          Whether you're finding food or sharing it, FarmConnect gets you there in three simple
          steps.
        </p>

        {/* Pill toggle */}
        <div className="inline-flex bg-white rounded-[20px] p-1.5 mt-8">
          <button
            onClick={() => setMode('find')}
            className={` text-body2 flex items-center gap-2 rounded-[10px] px-5.5 py-2.5 md:text-body1 font-medium text-orange-dark transition-colors
              ${mode === 'find' ? 'bg-orange-dark text-white' : 'text-orange-dark'}`}
          >
            <Search className="w-4 h-4" />
            Find food
          </button>
          <button
            onClick={() => setMode('share')}
            className={`text-body2 flex items-center gap-2 rounded-full px-5 py-2.5 md:text-body1 font-medium transition-colors
              ${mode === 'share' ? 'bg-orange-dark text-white' : 'text-orange-dark'}`}
          >
            <Store className="w-4 h-4" />
            Share food
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-10 md:gap-6 mt-16 text-left">
          {(mode === 'find' ? FIND_STEPS : SHARE_STEPS).map(({ number, title, body }, i) => (
            <div
              key={number}
              className={`pr-8 md:px-8 ${i < 2 ? ' pr-8 border-r-2 [border-image:linear-gradient(to_bottom,#fff_0%,#4e8b45_100%)_1] ' : '' }`}
            >
              <span className="block text-[128px] font-bold bg-linear-to-b from-green-normal to-white bg-clip-text text-transparent">{number}</span>
              <h3 className="text-h2 text-4xl font-bold text-white mt-2">{title}</h3>
              <p className="text-body1 text-white/85 mt-2">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
