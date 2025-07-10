const mongoose = require('mongoose');

// Room schema
const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, },
    capacity: { type: Number, required: true, },
    nurses: [{
        nurse: { type: String, },
        role: { type: String, }
    }],
});

// Bed schema
const bedSchema = new mongoose.Schema({
    bedNumber: { type: String, required: true, },
    occupied: {
        type: Boolean, default: false,
    },
});

// Ward schema with rooms, beds, and nurse assignments
const wardSchema = new mongoose.Schema({
    name: { type: String, required: true, },
    department_Name: { type: String, required: true, },
    wardNumber: { type: Number, required: true, },
    bedCount: { type: Number, required: true, },
    rooms: [roomSchema],
    beds: [bedSchema],
    nurses: [{
        nurse: { type: String, },
        role: { type: String, },
    }],
}, {
    timestamps: true,
});

const Ward = mongoose.model('Ward', wardSchema);

module.exports = Ward;
