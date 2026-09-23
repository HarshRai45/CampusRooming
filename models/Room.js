const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    roomType: {
      type: String,
      enum: ['Single', 'Shared', 'Studio', 'Dormitory'],
      default: 'Single',
    },
    price: { type: Number, required: true, min: 0 },
    location: { type: String, required: true, trim: true },
    distanceToCampus: { type: String, trim: true }, // e.g. "5 min walk"
    amenities: [{ type: String, trim: true }],
    images: [{ type: String }], // stored filenames under /public/img/rooms
    contactPhone: { type: String, trim: true },
    contactEmail: { type: String, trim: true },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String, trim: true },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

roomSchema.index({ title: 'text', location: 'text', description: 'text' });

module.exports = mongoose.model('Room', roomSchema);
