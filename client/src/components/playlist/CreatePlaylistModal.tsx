import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Playlist } from "@/types";
import { Loader2 } from "lucide-react";

const playlistSchema = z.object({
  name: z.string().min(1, "Playlist name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
});

type PlaylistFormData = z.infer<typeof playlistSchema>;

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  playlist?: Playlist;
  isEdit?: boolean;
}

export default function CreatePlaylistModal({
  isOpen,
  onClose,
  onCreated,
  playlist,
  isEdit = false,
}: CreatePlaylistModalProps) {
  const { toast } = useToast();

  const form = useForm<PlaylistFormData>({
    resolver: zodResolver(playlistSchema),
    defaultValues: {
      name: playlist?.name || "",
      description: playlist?.description || "",
    },
  });

  const createPlaylistMutation = useMutation({
    mutationFn: async (data: PlaylistFormData) => {
      if (isEdit && playlist) {
        await api.put(`/api/playlists/${playlist._id}`, data);
      } else {
        await api.post("/api/playlists", data);
      }
    },
    onSuccess: () => {
      toast({
        title: isEdit ? "Playlist updated" : "Playlist created",
        description: isEdit 
          ? "Your playlist has been updated successfully."
          : "Your new playlist has been created successfully.",
      });
      onCreated();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} playlist`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: PlaylistFormData) => {
    createPlaylistMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Playlist" : "Create New Playlist"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEdit 
              ? "Update your playlist details below."
              : "Create a new playlist to organize your favorite songs."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Playlist Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter playlist name"
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a description for your playlist..."
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={createPlaylistMutation.isPending}
              >
                {createPlaylistMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEdit ? "Update Playlist" : "Create Playlist"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
