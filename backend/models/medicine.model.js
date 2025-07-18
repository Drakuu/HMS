const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
    {
        medicine_Name: { type: String, },
        medicine_Category: { type: String },
        medicine_Company: { type: String },
        medicine_PurchaseData: { type: String },
        medicine_Price: { type: String },
        medicine_ManufactureDate: { type: String },
        medicine_ExpiryData: {
            type: String,
        },
        medicine_Stock: { type: String },
    }, {
    timestamps: true,
}
);
const Medicine = mongoose.model("Medicine", medicineSchema);

module.exports = Medicine;