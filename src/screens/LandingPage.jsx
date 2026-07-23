import LandingHeader from '../landing/LandingHeader.jsx'
import Hero from '../landing/Hero.jsx'
import HowItWorks from '../landing/HowItWorks.jsx'
import WhyChoose from '../landing/WhyChoose.jsx'
import WhoCanUse from '../landing/WhoCanUse.jsx'
import CTABanner from '../landing/CTABanner.jsx'
import Footer from '../landing/Footer.jsx'

export default function LandingPage({ onLogin, onSignup }) {
  return (
    <div>
      <LandingHeader onLogin={onLogin} onSignup={onSignup} />
      <Hero onFindFood={onSignup} onListSurplus={onSignup} />
      <HowItWorks />
       <WhyChoose />
     <WhoCanUse />
       <div className='bg-green-normal'>
        <CTABanner onFindFood={onSignup} onListSurplus={onSignup} />
       <hr className='border-t-2 border-white' />
      <Footer /> 
       </div> 
      
    </div>
  )
}
