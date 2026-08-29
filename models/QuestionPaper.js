const mongoose = require('mongoose');

const questionPaperSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Exam ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Paper title is required'],
      trim: true,
    },
    paperType: {
      type: String,
      enum: ['MCQ', 'Descriptive', 'Mixed'],
      default: 'MCQ',
    },
    setCode: {
      type: String,
      default: 'A',
      trim: true,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    totalMarks: {
      type: Number,
      default: 0,
    },
    answerKey: {
      uploaded: { type: Boolean, default: false },
      fileName: { type: String, default: null },
      path: { type: String, default: null },
      published: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Closed'],
      default: 'Draft',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('QuestionPaper', questionPaperSchema);
