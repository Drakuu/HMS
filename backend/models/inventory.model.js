const mongoose = require('mongoose');
const { Schema } = mongoose;

const inventorySchema = new Schema({

  category: {
    type: String,
    
  },

  name: { type: String},
  description: { type: String },
  quantity: { type: Number, min: 0 },
  currentStock: { type: Number},

  department: { type: String},
  room: { type: String },
  wards: { type: String },

  supplier: { type: String },
  purchaseDate: { type: Date },
  warrantyExpiry: { type: Date },

  status: {
    type: String,
    default: 'Available'
  },
   deleted: {
    type: Boolean,
    default: false,
    select: false // Makes the field invisible in query results
  },

  specifications: {
    bedType: { type: String},
    adjustable: { type: Boolean },
    hasWheels: { type: Boolean },
    mattressType: { type: String },

    furnitureType: { type: String },
    material: { type: String },
    maxLoad: { type: Number },

    equipmentType: { type: String },
    requiresCalibration: { type: Boolean },
    lastCalibrationDate: { type: Date },
    calibrationFrequency: { type: Number },

    instrumentType: { type: String},
    isSterile: { type: Boolean },
    sterilizationDate: { type: Date },

    drugName: { type: String },
    dosageForm: { type: String },
    expiryDate: { type: Date },
    storageTemp: { type: String },

    consumableType: { type: String },
    isDisposable: { type: Boolean },
    packageSize: { type: Number }
  },



  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }

}, {
  timestamps: true,
});

// Virtual
inventorySchema.virtual('stockStatus').get(function () {
  if (this.currentStock <= 0) return 'Out of Stock';
  return 'In Stock';
});

// Pre-save check
inventorySchema.pre('save', function (next) {
  if (this.currentStock < 0) {
    throw new Error('Stock cannot be negative');
  }
  next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);
module.exports = Inventory;
