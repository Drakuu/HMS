// models/counter.model.js
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  date: { type: String, required: true }, // Store date in YYYY-MM-DD format
  tokenCount: { type: Number, default: 0 }, // Keeps track of the token number
});

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
