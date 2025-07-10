// const mongoose = require("mongoose");

// const roomSchema = new mongoose.Schema({
//   // department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", },
//   department: { type: String },
//   roomNumber: { type: String,  },
//   wardType: { type: String },
//   bedCount: { type: Number, },
//   availableBeds: { type: Number, },
//   equipment: [{ type: String, }],
//   floor: { type: Number, },
//   // assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
//   assignedDoctor: { type: String },
//   features: [{ type: String }],
//   charges: { type: Number,}
// }, {
//   timestamps: true, 
// }
// );

// const Room = mongoose.model("Room", roomSchema);
// module.exports = Room; 



const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema({
  number: { type: Number },
  status: { type: String },  // "available", "occupied", etc.
  otherInfo: { type: String, default: "" },  // You can add other details for each bed.
}, { timestamps: true });

const roomSchema = new mongoose.Schema({
  department: { type: String },
  roomNumber: { type: String },
  wardType: { type: String },
  bedCount: { type: Number },
  availableBeds: { type: Number },
  equipment: [{ type: String }],
  floor: { type: Number },
  assignedDoctor: { type: String },
  features: [{ type: String }],
  charges: { type: Number },
  beds: [bedSchema],  // Array of beds
  deleted: { type: Boolean, default: false }

}, { timestamps: true });

const Room = mongoose.model("Room", roomSchema);
module.exports = Room;
