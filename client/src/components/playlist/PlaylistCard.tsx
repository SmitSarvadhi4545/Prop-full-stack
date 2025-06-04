import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Playlist } from "@/types";
import { Music, Play, MoreHorizontal, Edit, Trash2 } from "lucide-react";

interface PlaylistCardProps {
  playlist: Playlist;
  onDeleted: () => void;
}

export default function PlaylistCard({ playlist, onDeleted }: PlaylistCardProps) {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deletePlaylistMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/api/playlists/${playlist._id}`);
    },
    onSuccess: () => {
      toast({
        title: "Playlist deleted",
        description: "Your playlist has been deleted successfully.",
      });
      onDeleted();
      setShowDeleteDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete playlist",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deletePlaylistMutation.mutate();
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      <div className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-all duration-200 cursor-pointer group">
        <Link href={`/playlist/${playlist._id}`}>
          <div className="relative mb-4">
            <div className="w-full aspect-square bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-lg">
              <Music className="h-12 w-12 text-white" />
            </div>
            <Button
              size="sm"
              className="absolute bottom-2 right-2 bg-primary hover:bg-primary/90 text-primary-foreground w-12 h-12 rounded-full opacity-0 group-hover:opacity-100 hover:scale-105 transition-all shadow-lg"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Handle play functionality
              }}
            >
              <Play className="h-4 w-4 ml-0.5" />
            </Button>
          </div>
        </Link>
        
        <div className="space-y-1">
          <div className="flex items-start justify-between">
            <Link href={`/playlist/${playlist._id}`}>
              <h4 className="font-medium text-white group-hover:text-primary transition-colors truncate">
                {playlist.name}
              </h4>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white p-1 h-auto"
                  onClick={handleDropdownClick}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                <DropdownMenuItem 
                  className="text-white hover:bg-gray-700 cursor-pointer"
                  onClick={() => {
                    // Handle edit - could open edit modal or navigate to edit page
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit playlist
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-400 hover:bg-gray-700 hover:text-red-300 cursor-pointer"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete playlist
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <p className="text-gray-400 text-sm">
            {playlist.songs?.length || 0} songs
          </p>
          
          {playlist.description && (
            <p className="text-gray-500 text-xs truncate">
              {playlist.description}
            </p>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Playlist</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete "{playlist.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deletePlaylistMutation.isPending}
            >
              {deletePlaylistMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
