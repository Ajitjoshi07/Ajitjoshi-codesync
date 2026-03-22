const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  language: { type: String, default: 'javascript' },
  content: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

const sessionSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true, index: true },
  name: { type: String, default: 'Untitled Session' },
  files: [fileSchema],
  createdBy: { type: String, default: 'Anonymous' },
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now }
});

sessionSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

module.exports = mongoose.model('Session', sessionSchema);
