import mongoose, { Schema, Document } from 'mongoose';
import { Song } from '@shared/schema';

export interface ISong extends Omit<Song, '_id'>, Document {
  _id: string;
}

const songSchema = new Schema<ISong>({
  spotifyId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  album: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  imageUrl: {
    type: String,
    trim: true
  },
  previewUrl: {
    type: String,
    trim: true
  }
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
songSchema.index({ spotifyId: 1 });
songSchema.index({ name: 1 });
songSchema.index({ artist: 1 });

export const SongModel = mongoose.model<ISong>('Song', songSchema);
