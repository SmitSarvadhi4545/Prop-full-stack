import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import SearchResults from "@/components/search/SearchResults";
import CreatePlaylistModal from "@/components/playlist/CreatePlaylistModal";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Playlist, Song } from "@/types";
import { queryClient } from "@/lib/queryClient";
import {
  Play,
  Edit,
  Trash2,
  Music,
  ArrowLeft,
  MoreHorizontal,
  Clock,
  X,
} from "lucide-react";

export default function PlaylistDetailPage() {
  const [, params] = useRoute("/playlist/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const playlistId = params?.id;

  // Fetch playlist details
  const {
    data: playlist,
    isLoading,
    error,
  } = useQuery<Playlist>({
    queryKey: ["/api/playlists", playlistId],
    queryFn: async () => {
      const response = await api.get(`/api/playlists/${playlistId}`);
      return response.data.data;
    },
    enabled: !!playlistId,
  });

  // Delete playlist mutation
  const deletePlaylistMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/api/playlists/${playlistId}`);
    },
    onSuccess: () => {
      toast({
        title: "Playlist deleted",
        description: "Your playlist has been deleted successfully.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete playlist",
        variant: "destructive",
      });
    },
  });

  // Remove song from playlist mutation
  const removeSongMutation = useMutation({
    mutationFn: async (songId: string) => {
      await api.delete(`/api/playlists/${playlistId}/songs/${songId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists", playlistId] });
      toast({
        title: "Song removed",
        description: "Song has been removed from the playlist.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to remove song",
        variant: "destructive",
      });
    },
  });

  const handleDeletePlaylist = async () => {
    deletePlaylistMutation.mutate();
  };

  const handleRemoveSong = (songId: string) => {
    removeSongMutation.mutate(songId);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(query.length > 0);
  };

  const handleGoBack = () => {
    setLocation("/");
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getTotalDuration = () => {
    if (!playlist?.songs) return "0 min";
    const totalMs = playlist.songs.reduce((total, song) => total + (song.duration || 0), 0);
    const totalMinutes = Math.floor(totalMs / 60000);
    if (totalMinutes < 60) {
      return `${totalMinutes} min`;
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Playlist not found</h1>
          <p className="text-gray-400 mb-4">The playlist you're looking for doesn't exist.</p>
          <Button onClick={handleGoBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <Sidebar onCreatePlaylist={() => {}} />
      
      <div className="flex-1 flex flex-col ml-64">
        <TopBar onSearch={handleSearch} />
        
        <main className="flex-1 overflow-y-auto">
          {isSearching ? (
            <div className="p-6">
              <SearchResults 
                query={searchQuery} 
                onClose={() => setIsSearching(false)}
                targetPlaylistId={playlistId}
                onPlaylistCreated={() => {}}
              />
            </div>
          ) : (
            <>
              {/* Header Section */}
              <div className="p-6 pb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGoBack}
                  className="mb-6 text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Library
                </Button>

                {isLoading ? (
                  <div className="flex items-center mb-8">
                    <Skeleton className="w-48 h-48 rounded-lg mr-8 bg-gray-800" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-16 mb-2 bg-gray-800" />
                      <Skeleton className="h-8 w-64 mb-4 bg-gray-800" />
                      <Skeleton className="h-4 w-48 mb-4 bg-gray-800" />
                      <Skeleton className="h-4 w-32 bg-gray-800" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center mb-8">
                    <div className="w-48 h-48 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center mr-8">
                      <Music className="h-24 w-24 text-white" />
                    </div>
                    <div className="flex-1">
                      <Badge variant="outline" className="text-gray-400 border-gray-400 mb-2">
                        Playlist
                      </Badge>
                      <h1 className="text-4xl font-bold mb-4">{playlist?.name}</h1>
                      {playlist?.description && (
                        <p className="text-gray-400 mb-4">{playlist.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{playlist?.owner?.name}</span>
                        <span>•</span>
                        <span>{playlist?.songs?.length || 0} songs</span>
                        <span>•</span>
                        <span>{getTotalDuration()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {!isLoading && (
                  <div className="flex items-center space-x-4 mb-8">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-full">
                      <Play className="h-5 w-5 mr-2" />
                      Play
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setIsEditModalOpen(true)}
                      className="border-gray-600 text-white hover:bg-gray-800"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="lg"
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gray-800 border-gray-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Delete Playlist</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            Are you sure you want to delete "{playlist?.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeletePlaylist}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deletePlaylistMutation.isPending}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>

              {/* Songs List */}
              <div className="px-6">
                <div className="bg-gray-800 rounded-lg">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 text-sm text-gray-400 uppercase tracking-wide">
                    <div className="col-span-1">#</div>
                    <div className="col-span-5">Title</div>
                    <div className="col-span-3">Album</div>
                    <div className="col-span-2 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Duration
                    </div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Songs */}
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 last:border-b-0">
                        <div className="col-span-1">
                          <Skeleton className="h-4 w-4 bg-gray-700" />
                        </div>
                        <div className="col-span-5 flex items-center">
                          <Skeleton className="w-10 h-10 rounded mr-3 bg-gray-700" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-1 bg-gray-700" />
                            <Skeleton className="h-3 w-24 bg-gray-700" />
                          </div>
                        </div>
                        <div className="col-span-3">
                          <Skeleton className="h-4 w-28 bg-gray-700" />
                        </div>
                        <div className="col-span-2">
                          <Skeleton className="h-4 w-12 bg-gray-700" />
                        </div>
                        <div className="col-span-1">
                          <Skeleton className="h-4 w-4 bg-gray-700" />
                        </div>
                      </div>
                    ))
                  ) : playlist?.songs?.length === 0 ? (
                    <div className="text-center py-12">
                      <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No songs in this playlist</h3>
                      <p className="text-gray-400 mb-4">
                        Search for songs to add them to your playlist.
                      </p>
                    </div>
                  ) : (
                    playlist?.songs?.map((song: Song, index: number) => (
                      <div
                        key={song._id}
                        className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-700 transition-colors group"
                      >
                        <div className="col-span-1 text-gray-400 flex items-center">
                          {index + 1}
                        </div>
                        <div className="col-span-5 flex items-center">
                          <div className="w-10 h-10 bg-gray-700 rounded mr-3 flex items-center justify-center">
                            {song.imageUrl ? (
                              <img
                                src={song.imageUrl}
                                alt={song.name}
                                className="w-10 h-10 rounded object-cover"
                              />
                            ) : (
                              <Music className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-white group-hover:text-primary transition-colors">
                              {song.name}
                            </h4>
                            <p className="text-sm text-gray-400">{song.artist}</p>
                          </div>
                        </div>
                        <div className="col-span-3 text-gray-400 flex items-center">
                          {song.album}
                        </div>
                        <div className="col-span-2 text-gray-400 flex items-center">
                          {formatDuration(song.duration)}
                        </div>
                        <div className="col-span-1 flex items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSong(song._id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all"
                            disabled={removeSongMutation.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Edit Playlist Modal */}
      <CreatePlaylistModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onCreated={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/playlists", playlistId] });
          setIsEditModalOpen(false);
        }}
        playlist={playlist}
        isEdit={true}
      />
    </div>
  );
}
