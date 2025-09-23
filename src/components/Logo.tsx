import { Link } from "react-router-dom";
import panacheLogoText from "@/assets/panache-logo-text.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export const Logo = ({ size = "md", showText = false, className = "" }: LogoProps) => {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8", 
    lg: "h-12"
  };

  return (
    <Link 
      to="/" 
      className={`flex items-center hover:opacity-80 transition-opacity ${className}`}
    >
      <img 
        src={panacheLogoText} 
        alt="Panache" 
        className={`${sizeClasses[size]} w-auto object-contain`} 
      />
      {showText && (
        <div className="ml-2 flex flex-col">
          <span className="text-sm text-muted-foreground">Event Management</span>
        </div>
      )}
    </Link>
  );
};