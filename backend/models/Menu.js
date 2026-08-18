const mongoose = require('mongoose');

const mealDetailsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  items: [{ type: String }],
  timeSlot: { type: String, required: true },
  price: { type: Number, default: 50 }
});

const menuSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
      unique: true
    },
    meals: {
      breakfast: mealDetailsSchema,
      lunch: mealDetailsSchema,
      dinner: mealDetailsSchema
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Menu', menuSchema);
