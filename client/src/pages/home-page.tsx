import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import PlaylistCard from "@/components/playlist/PlaylistCard";
import CreatePlaylistModal from "@/components/playlist/CreatePlaylistModal";
import SearchResults from "@/components/search/SearchResults";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { Playlist } from "@/types";
import { Plus, Music } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Fetch user playlists
  const {
    data: playlistsData,
    isLoading: playlistsLoading,
    refetch: refetchPlaylists,
  } = useQuery({
    queryKey: ["/api/playlists"],
    queryFn: async () => {
      const response = await api.get("/api/playlists");
      return response.data;
    },
  });

  const handleCreatePlaylist = () => {
    setIsCreateModalOpen(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(query.length > 0);
  };

  const handlePlaylistCreated = () => {
    refetchPlaylists();
    setIsCreateModalOpen(false);
  };

  const handlePlaylistDeleted = () => {
    refetchPlaylists();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <Sidebar onCreatePlaylist={handleCreatePlaylist} />
      
      <div className="flex-1 flex flex-col ml-64">
        <TopBar onSearch={handleSearch} />
        
        <main className="flex-1 p-6 overflow-y-auto">
          {isSearching ? (
            <SearchResults 
              query={searchQuery} 
              onClose={() => setIsSearching(false)}
              onPlaylistCreated={refetchPlaylists}
            />
          ) : (
            <>
              {/* Welcome Section */}
              <section className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                  Good {getTimeOfDay()}, {user?.name || "there"}!
                </h1>
                <p className="text-gray-400 mb-6">
                  {playlistsData?.data?.length || 0} playlists in your library
                </p>

                {/* Quick Access Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {playlistsLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-colors">
                        <div className="flex items-center">
                          <Skeleton className="w-16 h-16 rounded-lg mr-4 bg-gray-700" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-24 mb-2 bg-gray-700" />
                            <Skeleton className="h-3 w-16 bg-gray-700" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    playlistsData?.data?.slice(0, 6).map((playlist: Playlist) => (
                      <Link key={playlist._id} href={`/playlist/${playlist._id}`}>
                        <div className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 cursor-pointer transition-colors group">
                          <div className="flex items-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center mr-4">
                              <Music className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-white group-hover:text-primary transition-colors">
                                {playlist.name}
                              </h3>
                              <p className="text-gray-400 text-sm">
                                {playlist.songs?.length || 0} songs
                              </p>
                            </div>
                            <Button
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 bg-primary hover:bg-primary/90 transition-all"
                            >
                              <Music className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </section>

              {/* All Playlists Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Your Playlists</h2>
                  <Button 
                    onClick={handleCreatePlaylist}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Playlist
                  </Button>
                </div>

                {playlistsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="aspect-square rounded-lg bg-gray-800" />
                        <Skeleton className="h-4 w-3/4 bg-gray-800" />
                        <Skeleton className="h-3 w-1/2 bg-gray-800" />
                      </div>
                    ))}
                  </div>
                ) : playlistsData?.data?.length === 0 ? (
                  <div className="text-center py-12">
                    <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No playlists yet</h3>
                    <p className="text-gray-400 mb-6">
                      Create your first playlist to get started organizing your music.
                    </p>
                    <Button 
                      onClick={handleCreatePlaylist}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Playlist
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {playlistsData.data.map((playlist: Playlist) => (
                      <PlaylistCard
                        key={playlist._id}
                        playlist={playlist}
                        onDeleted={handlePlaylistDeleted}
                      />
                    ))}
                    
                    {/* Create Playlist Card */}
                    <div
                      className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-4 hover:border-primary cursor-pointer transition-all group"
                      onClick={handleCreatePlaylist}
                    >
                      <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-600 transition-colors">
                        <Plus className="h-8 w-8 text-gray-400 group-hover:text-primary transition-colors" />
                      </div>
                      <h4 className="font-medium text-gray-400 group-hover:text-white transition-colors">
                        Create Playlist
                      </h4>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>

      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handlePlaylistCreated}
      />
    </div>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
