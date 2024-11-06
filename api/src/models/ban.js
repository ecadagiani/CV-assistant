import mongoose from 'mongoose';

const BanSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['IP', 'IP_REGEX', 'COUNTRY'],
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true, strict: false });

BanSchema.index({
  type: 1, value: 1, expiresAt: 1, active: 1,
});

// Index for efficient querying
BanSchema.index({ type: 1, value: 1 }, { unique: true });

// Compound index for active bans
BanSchema.index({ active: 1 });

const BanModel = mongoose.model('Ban', BanSchema);

export default BanModel;
