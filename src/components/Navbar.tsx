
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { User, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
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

export const Navbar = ({ variant = "transparent" }: NavbarProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isOrange = variant === "orange";

  return (
    <nav className="absolute top-0 left-0 w-full z-50">
      {/* Slanted Background for Orange Variant (now Black as requested) */}
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

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`font-medium text-sm uppercase tracking-wide transition-colors ${location.pathname === '/' ? 'text-white font-bold' : 'text-white/90 hover:text-white'}`}
            >
              accueil
            </Link>
            <Link
              to="/events"
              className={`font-medium text-sm uppercase tracking-wide transition-colors ${location.pathname.startsWith('/events') ? 'text-white font-bold' : 'text-white/90 hover:text-white'}`}
            >
              activités
            </Link>
            <Link
              to="/clubs"
              className={`font-medium text-sm uppercase tracking-wide transition-colors ${location.pathname.startsWith('/clubs') ? 'text-white font-bold' : 'text-white/90 hover:text-white'}`}
            >
              clubs
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2 text-white rounded-full px-4 hover:opacity-90 transition-opacity"
                      style={{
                        background: isOrange ? "#FFFFFF" : "#F032E6",
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
              </div>
            ) : (
              <Button
                asChild
                className="rounded-full px-6 font-semibold border-0"
                style={{
                  background: isOrange ? "#FFFFFF" : "#F032E6",
                  color: isOrange ? "#000000" : "#FFFFFF"
                }}
              >
                <Link to="/auth?tab=signup">Vous êtes organisateur ?</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};