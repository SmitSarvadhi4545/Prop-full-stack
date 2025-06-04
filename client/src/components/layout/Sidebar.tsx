import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Music, Home, Search, Library, Plus, LogOut } from "lucide-react";

interface SidebarProps {
  onCreatePlaylist: () => void;
}

export default function Sidebar({ onCreatePlaylist }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    return path !== "/" && location.startsWith(path);
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-black flex flex-col">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-800">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
            <Music className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-white">PlaylistHub</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link href="/">
          <Button
            variant="ghost"
            className={`w-full justify-start px-4 py-3 text-left ${
              isActive("/")
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <Home className="h-5 w-5 mr-3" />
            Home
          </Button>
        </Link>
        
        <Button
          variant="ghost"
          className="w-full justify-start px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800"
          disabled
        >
          <Search className="h-5 w-5 mr-3" />
          Search
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800"
          disabled
        >
          <Library className="h-5 w-5 mr-3" />
          Your Library
        </Button>
      </nav>

      {/* Create Playlist Button */}
      <div className="px-4 pb-6">
        <Button
          onClick={onCreatePlaylist}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Playlist
        </Button>
      </div>

      {/* User Profile */}
      <div className="px-4 pb-4 border-t border-gray-800 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/70 rounded-full flex items-center justify-center mr-3">
              <span className="text-sm font-medium text-primary-foreground">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-white truncate block">
                {user?.name}
              </span>
              <span className="text-xs text-gray-400 truncate block">
                {user?.email}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-400 hover:text-white p-2"
            title="Logout"
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
