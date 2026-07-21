import { useState } from 'react'
import { Search, Store } from 'lucide-react'
import { AdvancedImage } from "@cloudinary/react";
import { backgrounds } from "../libs/cloudinaryImages";

const STEPS = [
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

export default function HowItWorks() {
  const [mode, setMode] = useState('find') // 'find' | 'share'

  return (
    <section className="bg-center bg-cover bg-no-repeat min-h-screen px-6 py-20"
    style={{ backgroundImage: `url(${backgrounds.food.toURL()})` }}>
      <div className="max-w-full mx-auto  text-center min-h-screen">
        <h2 className="text-h2 font-bold text-white text-left">How FarmConnect works</h2>
        <p className="text-body1 text-white/85 mt-3 max-w-full  text-left">
          Whether you're finding food or sharing it, FarmConnect gets you there in three simple
          steps.
        </p>

        {/* Pill toggle */}
        <div className="inline-flex bg-white rounded-full p-1.5 mt-8">
          <button
            onClick={() => setMode('find')}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-body1 font-medium transition-colors
              ${mode === 'find' ? 'bg-orange-normal text-white' : 'text-orange-normal'}`}
          >
            <Search className="w-4 h-4" />
            Find food
          </button>
          <button
            onClick={() => setMode('share')}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-body1 font-medium transition-colors
              ${mode === 'share' ? 'bg-orange-normal text-white' : 'text-orange-normal'}`}
          >
            <Store className="w-4 h-4" />
            Share food
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-10 md:gap-6 mt-16 text-left">
          {STEPS.map(({ number, title, body }, i) => (
            <div
              key={number}
              className={`px-0 md:px-8 ${i > 0 ? 'border-l-2 [border-image:linear-gradient(to_bottom,#fff_0%,#4e8b45_100%)_1] ' : '' }`}
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
