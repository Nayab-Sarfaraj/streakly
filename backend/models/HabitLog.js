const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema({
  userId: { type: String, required: true, default: 'default' },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  habits: {
    gym:         { type: Boolean, default: false },
    reading:     { type: Boolean, default: false },
    company:     { type: Boolean, default: false },
    learning:    { type: Boolean, default: false },
    sideproject: { type: Boolean, default: false },
    pixlreel:    { type: Boolean, default: false },
    kastreel:    { type: Boolean, default: false },
    post:        { type: Boolean, default: false },
    jobhunt:     { type: Boolean, default: false },
  },
  completedCount: { type: Number, default: 0 },
  scorePercent:   { type: Number, default: 0 },
}, { timestamps: true });

habitLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('HabitLog', habitLogSchema);
