import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft, ChevronRight, Search, Plus } from "lucide-react";

interface TopBarProps {
  onSearch: (query: string) => void;
  onCreatePlaylist?: () => void;
}

export default function TopBar({ onSearch, onCreatePlaylist }: TopBarProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, onSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoForward = () => {
    window.history.forward();
  };

  return (
    <header className="bg-gray-800 h-16 flex items-center justify-between px-6 border-b border-gray-700">
      {/* Navigation Controls */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoBack}
          className="text-gray-400 hover:text-white p-2 rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoForward}
          className="text-gray-400 hover:text-white p-2 rounded-full"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search songs, artists, albums..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        {onCreatePlaylist && (
          <Button
            onClick={onCreatePlaylist}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Playlist
          </Button>
        )}
        
        <div className="text-sm text-gray-400">
          Welcome back, <span className="text-white">{user?.name?.split(' ')[0]}</span>!
        </div>
      </div>
    </header>
  );
}
