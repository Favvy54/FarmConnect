import { FaFacebookF, FaLinkedinIn, FaInstagram, FaXTwitter, } from "react-icons/fa6"
import { AdvancedImage } from "@cloudinary/react";
import { logos } from "../libs/cloudinaryImages"

const QUICK_LINKS = ['How It Works', 'Benefits', 'Who Its For']
const FOR_USERS = ['Find Food', 'List Food', 'Become a Vendor']

export default function Footer() {
  return (
    <footer className=" text-white">
      <div className=" px-6 py-16 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AdvancedImage cldImg={logos.footer} />
            <span className="text-body1 font-bold">FarmConnect</span>
          </div>
          <p className="text-body2 text-white/80">
            Connecting surplus food with people who need it the most.
          </p>
          <div className="flex gap-3 mt-5">
            <FaFacebookF className="w-5 h-5" />
            <FaLinkedinIn className="w-5 h-5" />
            <FaInstagram className="w-5 h-5" />
            <FaXTwitter className="w-5 h-5" />
          </div>
        </div>

        <div>
          <h4 className="text-body1 font-bold mb-4">Quick Links</h4>
          <ul className="flex flex-col gap-3 text-body2 text-white/85">
            {QUICK_LINKS.map((l) => (
              <li key={l}>
                <a href="#">{l}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-body1 font-bold mb-4">For Users</h4>
          <ul className="flex flex-col gap-3 text-body2 text-white/85">
            {FOR_USERS.map((l) => (
              <li key={l}>
                <a href="#">{l}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-body1 font-bold mb-4">Contacts</h4>
          <ul className="flex flex-col gap-3 text-body2 text-white/85">
            <li>hello@farmconnect.com</li>
            <li>+234 813 444 567</li>
            <li>Lagos, Nigeria</li>
          </ul>
        </div>
      </div>

      <div className="text-center text-caption text-white/70 pb-8">
        ©2026 FarmConnect. All right reserved.
      </div>
    </footer>
  )
}
