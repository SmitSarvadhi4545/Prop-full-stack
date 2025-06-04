import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AddToPlaylistModal from "./AddToPlaylistModal";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { SpotifyTrack } from "@/types";
import { queryClient } from "@/lib/queryClient";
import { Music, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";

interface SearchResultsProps {
  query: string;
  onClose: () => void;
  targetPlaylistId?: string;
  onPlaylistCreated: () => void;
}

export default function SearchResults({ 
  query, 
  onClose, 
  targetPlaylistId,
  onPlaylistCreated 
}: SearchResultsProps) {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSong, setSelectedSong] = useState<SpotifyTrack | null>(null);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const limit = 20;

  // Search Spotify tracks
  const {
    data: searchResults,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/spotify/search", query, currentPage],
    queryFn: async () => {
      const response = await api.get("/api/spotify/search", {
        params: {
          q: query,
          page: currentPage,
          limit,
        },
      });
      return response.data;
    },
    enabled: query.length > 0,
  });

  // Add song to database and playlist
  const addSongMutation = useMutation({
    mutationFn: async ({ spotifyTrack, playlistId }: { spotifyTrack: SpotifyTrack; playlistId?: string }) => {
      // First add song to database
      const songResponse = await api.post("/api/spotify/add-track", {
        spotifyId: spotifyTrack.id,
      });
      
      const song = songResponse.data.data;
      
      // If target playlist specified, add to that playlist
      if (playlistId) {
        await api.post(`/api/playlists/${playlistId}/songs`, {
          songId: song._id,
        });
      }
      
      return { song, playlistId };
    },
    onSuccess: ({ song, playlistId }) => {
      if (playlistId) {
        toast({
          title: "Song added",
          description: `"${song.name}" has been added to the playlist.`,
        });
        // Invalidate playlist details if we're on a playlist page
        queryClient.invalidateQueries({ queryKey: ["/api/playlists", playlistId] });
      } else {
        toast({
          title: "Song saved",
          description: `"${song.name}" has been saved to your library.`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to add song",
        variant: "destructive",
      });
    },
  });

  const handleAddSong = (track: SpotifyTrack) => {
    if (targetPlaylistId) {
      // Direct add to specific playlist
      addSongMutation.mutate({ spotifyTrack: track, playlistId: targetPlaylistId });
    } else {
      // Show playlist selection modal
      setSelectedSong(track);
      setShowAddToPlaylistModal(true);
    }
  };

  const handleAddToPlaylist = (playlistId: string) => {
    if (selectedSong) {
      addSongMutation.mutate({ spotifyTrack: selectedSong, playlistId });
      setShowAddToPlaylistModal(false);
      setSelectedSong(null);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const totalPages = searchResults?.pagination?.totalPages || 1;

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Search Results</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-400">Failed to search songs. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Search Results for "{query}"
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center p-3 bg-gray-800 rounded-lg">
              <Skeleton className="w-12 h-12 rounded mr-4 bg-gray-700" />
              <div className="flex-1">
                <Skeleton className="h-4 w-48 mb-2 bg-gray-700" />
                <Skeleton className="h-3 w-32 bg-gray-700" />
              </div>
              <Skeleton className="h-3 w-16 mr-4 bg-gray-700" />
              <Skeleton className="h-8 w-20 bg-gray-700" />
            </div>
          ))}
        </div>
      ) : searchResults?.data?.length === 0 ? (
        <div className="text-center py-8">
          <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No songs found for "{query}"</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {searchResults?.data?.map((track: SpotifyTrack) => (
              <div
                key={track.id}
                className="flex items-center p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="w-12 h-12 bg-gray-700 rounded mr-4 flex items-center justify-center overflow-hidden">
                  {track.album.images[0] ? (
                    <img
                      src={track.album.images[0].url}
                      alt={track.name}
                      className="w-12 h-12 object-cover"
                    />
                  ) : (
                    <Music className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">
                    {track.name}
                  </h4>
                  <p className="text-sm text-gray-400 truncate">
                    {track.artists.map(artist => artist.name).join(", ")}
                  </p>
                </div>
                
                <div className="text-sm text-gray-400 mr-4 hidden sm:block">
                  {track.album.name}
                </div>
                
                <div className="text-sm text-gray-400 mr-4">
                  {formatDuration(track.duration_ms)}
                </div>
                
                <Button
                  size="sm"
                  onClick={() => handleAddSong(track)}
                  disabled={addSongMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || isLoading}
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <span className="text-gray-400 px-4">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || isLoading}
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal
        isOpen={showAddToPlaylistModal}
        onClose={() => {
          setShowAddToPlaylistModal(false);
          setSelectedSong(null);
        }}
        song={selectedSong}
        onAddToPlaylist={handleAddToPlaylist}
      />
    </div>
  );
}
