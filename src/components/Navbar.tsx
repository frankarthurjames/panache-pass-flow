
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { User, LogOut, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  variant?: "transparent" | "orange";
}

const navLinks = [
  { to: "/", label: "accueil", match: (p: string) => p === "/" },
  { to: "/events", label: "événements", match: (p: string) => p.startsWith("/events") },
  { to: "/clubs", label: "clubs", match: (p: string) => p.startsWith("/clubs") },
  { to: "/calendar", label: "calendrier", match: (p: string) => p.startsWith("/calendar") },
];

export const Navbar = ({ variant = "transparent" }: NavbarProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isOrange = variant === "orange";

  return (
    <nav className="absolute top-0 left-0 w-full z-50">
      {isOrange && (
        <div
          className="absolute inset-0 bg-black h-[120px] -z-10"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)" }}
        />
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="text-white">
            <Logo size="md" />
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-medium text-sm uppercase tracking-wide transition-colors ${link.match(location.pathname) ? 'text-white font-bold' : 'text-white/90 hover:text-white'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 text-white rounded-full px-4 hover:opacity-90 transition-opacity"
                    style={{
                      background: isOrange ? "#FFFFFF" : "#F97316",
                      color: isOrange ? "#000000" : "#FFFFFF"
                    }}
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {user.user_metadata?.display_name || user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                className="hidden sm:inline-flex rounded-full px-6 font-semibold border-0"
                style={{
                  background: isOrange ? "#FFFFFF" : "#F97316",
                  color: isOrange ? "#000000" : "#FFFFFF"
                }}
              >
                <Link to="/auth?tab=signup">Vous êtes organisateur ?</Link>
              </Button>
            )}

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-white/10"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-sm border-t border-white/10">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`py-3 px-4 rounded-lg text-sm uppercase tracking-wide font-medium transition-colors ${link.match(location.pathname) ? 'text-white bg-white/10' : 'text-white/80 hover:text-white hover:bg-white/5'}`}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link
                to="/auth?tab=signup"
                onClick={() => setMobileOpen(false)}
                className="mt-2 py-3 px-4 rounded-lg text-sm font-semibold text-center"
                style={{ background: "#F97316", color: "#111827" }}
              >
                Vous êtes organisateur ?
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};