const mongoose = require('mongoose');

const mealSelectionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: String,
      required: true // YYYY-MM-DD format
    },
    breakfast: {
      type: Boolean,
      default: true
    },
    lunch: {
      type: Boolean,
      default: true
    },
    dinner: {
      type: Boolean,
      default: true
    },
    passToken: {
      type: String,
      required: true
    },
    isSubmitted: {
      type: Boolean,
      default: false
    },
    submittedAt: {
      type: Date
    },
    status: {
      breakfast: {
        type: String,
        enum: ['opted-in', 'opted-out', 'served'],
        default: 'opted-in'
      },
      lunch: {
        type: String,
        enum: ['opted-in', 'opted-out', 'served'],
        default: 'opted-in'
      },
      dinner: {
        type: String,
        enum: ['opted-in', 'opted-out', 'served'],
        default: 'opted-in'
      }
    }
  },
  {
    timestamps: true
  }
);

mealSelectionSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('MealSelection', mealSelectionSchema);
