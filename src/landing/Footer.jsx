import { Link } from "react-router";
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaXTwitter, } from "react-icons/fa6";
import { AdvancedImage } from "@cloudinary/react";
import { logos } from "../libs/cloudinaryImages"


const QUICK_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Benefits', href: '#benefits' },
  { label: 'Who Its For', href: '#who-its-for' },
];
const FOR_USERS = [
  { label: 'Find Food', to: '/signup' },
  { label: 'List Food', to: '/signup' },
  { label: 'Become a Vendor', to: '/signup' }]


const LEGAL_LINKS = [
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Privacy Policy', to: '/privacy' },
];


export default function Footer() {
  const currentYear = new Date().getFullYear();
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
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-body1 font-bold mb-4">For Users</h4>
          <ul className="flex flex-col gap-3 text-body2 text-white/85">
            {FOR_USERS.map((l) => (
              <li key={l}>
                <a href={l.to}>{l.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-body1 font-bold mb-4">Legal</h4>
          <ul className="flex flex-col gap-3 text-body2 text-white/85">
            {LEGAL_LINKS.map((l) => (
              <li key={l.label}>
                <Link to={l.to}>{l.label}</Link>
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
        ©{currentYear} FarmConnect. All right reserved.
      </div>
    </footer>
  );
}
