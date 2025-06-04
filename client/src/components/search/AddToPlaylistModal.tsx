import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import { Playlist, SpotifyTrack } from "@/types";
import { Music, Plus } from "lucide-react";

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: SpotifyTrack | null;
  onAddToPlaylist: (playlistId: string) => void;
}

export default function AddToPlaylistModal({
  isOpen,
  onClose,
  song,
  onAddToPlaylist,
}: AddToPlaylistModalProps) {
  // Fetch user playlists
  const {
    data: playlistsData,
    isLoading,
  } = useQuery({
    queryKey: ["/api/playlists"],
    queryFn: async () => {
      const response = await api.get("/api/playlists");
      return response.data;
    },
    enabled: isOpen,
  });

  const handleAddToPlaylist = (playlistId: string) => {
    onAddToPlaylist(playlistId);
  };

  if (!song) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose a playlist to add this song to.
          </DialogDescription>
        </DialogHeader>

        {/* Selected Song Display */}
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-600 rounded mr-4 flex items-center justify-center overflow-hidden">
              {song.album.images[0] ? (
                <img
                  src={song.album.images[0].url}
                  alt={song.name}
                  className="w-12 h-12 object-cover"
                />
              ) : (
                <Music className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white truncate">
                {song.name}
              </h4>
              <p className="text-sm text-gray-400 truncate">
                {song.artists.map(artist => artist.name).join(", ")}
              </p>
            </div>
          </div>
        </div>

        {/* Playlists List */}
        <ScrollArea className="max-h-64">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center p-3 rounded-lg">
                  <Skeleton className="w-10 h-10 rounded mr-3 bg-gray-700" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1 bg-gray-700" />
                    <Skeleton className="h-3 w-20 bg-gray-700" />
                  </div>
                </div>
              ))}
            </div>
          ) : playlistsData?.data?.length === 0 ? (
            <div className="text-center py-8">
              <Music className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">No playlists found</p>
              <p className="text-sm text-gray-500">
                Create a playlist first to add songs to it.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {playlistsData?.data?.map((playlist: Playlist) => (
                <div
                  key={playlist._id}
                  className="flex items-center p-3 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                  onClick={() => handleAddToPlaylist(playlist._id)}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded mr-3 flex items-center justify-center">
                    <Music className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">
                      {playlist.name}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {playlist.songs?.length || 0} songs
                    </p>
                  </div>
                  <Plus className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-600 text-white hover:bg-gray-700"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
