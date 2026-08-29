const mongoose = require('mongoose');

const examEnrollmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Exam ID is required'],
      index: true,
    },
    registrationNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    centerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamCenter',
      default: null,
    },
    formData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    feePaid: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['applied', 'confirmed', 'rejected'],
      default: 'applied',
    },
    adminMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

examEnrollmentSchema.index({ examId: 1, userId: 1 }, { unique: true });

examEnrollmentSchema.pre('save', async function () {
  if (this.isNew && !this.registrationNumber) {
    const coll = mongoose.connection.db.collection('counters');
    const doc = await coll.findOneAndUpdate(
      { name: 'enrollment' },
      { $inc: { value: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    const value = doc && (doc.value !== undefined ? doc.value.value : doc.value);
    const seq = value || 1;
    this.registrationNumber = `UTE${String(seq).padStart(6, '0')}`;
  }
});

module.exports = mongoose.model('ExamEnrollment', examEnrollmentSchema);
