const mongoose = require('mongoose');

const STATUS_ACTIVE = 'active';
const STATUS_STOPPED = 'stopped';
const STATUS_EXPIRED = 'expired';

const labSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    sessionType: {
      type: String,
      required: [true, 'Session type is required'],
      enum: ['code-server', 'desktop'],
    },
    status: {
      type: String,
      default: STATUS_ACTIVE,
      enum: [STATUS_ACTIVE, STATUS_STOPPED, STATUS_EXPIRED],
    },
    containerId: {
      type: String,
      default: null,
      trim: true,
    },
    port: {
      type: Number,
      default: null,
    },
    url: {
      type: String,
      default: '',
      trim: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    stoppedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

labSessionSchema.index({ userId: 1, status: 1 });
labSessionSchema.index({ expiresAt: 1 });

labSessionSchema.statics.STATUS_ACTIVE = STATUS_ACTIVE;
labSessionSchema.statics.STATUS_STOPPED = STATUS_STOPPED;
labSessionSchema.statics.STATUS_EXPIRED = STATUS_EXPIRED;

module.exports = mongoose.model('LabSession', labSessionSchema);
module.exports.STATUS_ACTIVE = STATUS_ACTIVE;
module.exports.STATUS_STOPPED = STATUS_STOPPED;
module.exports.STATUS_EXPIRED = STATUS_EXPIRED;