import mongoose from 'mongoose';

const { Schema } = mongoose;

// Snapshot of a selected component stored in a saved build.
const buildComponentSchema = new Schema(
  {
    componentId: {
      type: Schema.Types.ObjectId,
      ref: 'Component',
      required: [true, 'Component reference is required'],
    },
    category: {
      type: String,
      required: [true, 'Component category is required'],
      trim: true,
      enum: ['CPU', 'GPU', 'Motherboard', 'RAM', 'SSD', 'HDD', 'PSU', 'Cabinet', 'Cooler'],
    },
    name: {
      type: String,
      required: [true, 'Component name is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    powerWatts: {
      type: Number,
      default: 0,
      min: [0, 'Power cannot be negative'],
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: false },
);

// Main saved build schema.
const buildSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Build name is required'],
      trim: true,
      maxlength: [120, 'Build name cannot exceed 120 characters'],
    },
    components: {
      type: [buildComponentSchema],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value),
        message: 'Components must be an array.',
      },
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative'],
      default: 0,
    },
    totalPower: {
      type: Number,
      required: [true, 'Total power is required'],
      min: [0, 'Total power cannot be negative'],
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

buildSchema.index({ user: 1, createdAt: -1 });

const Build = mongoose.model('Build', buildSchema);
export default Build;
