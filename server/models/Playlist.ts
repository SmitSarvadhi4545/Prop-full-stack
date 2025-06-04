import mongoose, { Schema, Document } from 'mongoose';
import { Playlist } from '@shared/schema';

export interface IPlaylist extends Omit<Playlist, '_id'>, Document {
  _id: string;
}

const playlistSchema = new Schema<IPlaylist>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  songs: [{
    type: Schema.Types.ObjectId,
    ref: 'Song'
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Create indexes for better performance
playlistSchema.index({ owner: 1 });
playlistSchema.index({ name: 1, owner: 1 });

export const PlaylistModel = mongoose.model<IPlaylist>('Playlist', playlistSchema);
