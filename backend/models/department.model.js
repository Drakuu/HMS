const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
    name: { type: String, unique: true, },
    description: { type: String, default: "", },
    location: { type: String, default: "", },
    status: { type: String, default: "active" },
    role: { type: String },
    servicesOffered: [{ type: String }],
    ward: [{ type: String }],
    deleted: { type: Boolean, default: false },
}, {
    timestamps: true,
});

const Department = mongoose.model("Department", departmentSchema);
module.exports = Department;
