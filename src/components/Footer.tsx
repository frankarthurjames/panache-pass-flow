import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import panacheLogoText from "@/assets/panache-logo-text.png";

export const Footer = () => {
  return (
    <footer className="bg-black text-white py-8 border-t border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center h-full relative">

          {/* Left: Links */}
          <div className="flex space-x-8 mb-8 md:mb-0 text-sm font-medium text-white z-10">
            <Link to="/about" className="hover:text-gray-300 transition-colors">À propos</Link>
            <Link to="/legal/mentions" className="hover:text-gray-300 transition-colors">Mentions légales</Link>
          </div>

          {/* Center: Logo & Copyright */}
          <div className="flex flex-col items-center md:absolute md:left-1/2 md:transform md:-translate-x-1/2 z-0 mb-8 md:mb-0">
            <div className="mb-2">
              {/* Using text for now to match the "Panache" orange look if image doesn't fit, 
                   but user said "avec le logo etc". The image provided shows orange text "Panache" with a spark.
                   I'll use the image asset if available or style text. 
                   The previous Logo component uses an image. Let's try to use that or styled text.
                   The visual has "Panache" in orange.
               */}
              <span className="text-2xl font-bold text-[#FF9933] italic flex items-center">
                Panache
                {/* Spark icon could go here */}
              </span>
            </div>
            <div className="text-[10px] text-white font-medium">
              Tout droit réservés - Panache 2021
            </div>
          </div>

          {/* Right: Social Icons */}
          <div className="flex space-x-4 z-10">
            <a href="#" className="bg-white rounded-full p-2 text-black hover:bg-gray-200 transition-colors">
              <Linkedin className="h-4 w-4" />
            </a>
            <a href="#" className="bg-white rounded-full p-2 text-black hover:bg-gray-200 transition-colors">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" className="bg-white rounded-full p-2 text-black hover:bg-gray-200 transition-colors">
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};