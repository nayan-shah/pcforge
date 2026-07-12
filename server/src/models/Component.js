import mongoose from 'mongoose';

const { Schema } = mongoose;

const urlValidator = {
  validator: (value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  },
  message: (props) => `${props.value} is not a valid URL`,
};

const priceSchema = new Schema(
  {
    storeName: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
      maxlength: [100, 'Store name cannot exceed 100 characters'],
    },
    productUrl: {
      type: String,
      required: [true, 'Product URL is required'],
      trim: true,
      validate: urlValidator,
    },
    currentPrice: {
      type: Number,
      required: [true, 'Current price is required'],
      min: [0, 'Price must be a non-negative number'],
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      trim: true,
      uppercase: true,
      minlength: [3, 'Currency must be 3 letters'],
      maxlength: [3, 'Currency must be 3 letters'],
    },
    availability: {
      type: String,
      trim: true,
      default: 'Available',
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const componentSchema = new Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Component name is required'],
      trim: true,
      maxlength: [150, 'Component name cannot exceed 150 characters'],
      index: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
      maxlength: [80, 'Brand name cannot exceed 80 characters'],
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: [
        'CPU',
        'GPU',
        'Motherboard',
        'RAM',
        'SSD',
        'HDD',
        'PSU',
        'Cabinet',
        'Cooler',
        'Monitor',
        'Keyboard',
        'Mouse',
      ],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    images: {
      type: [
        {
          type: String,
          trim: true,
          validate: urlValidator,
        },
      ],
      default: [],
    },

    // Technical Information
    specifications: {
      type: Schema.Types.Mixed,
      default: {},
    },
    compatibility: {
      type: Schema.Types.Mixed,
      default: {},
    },

    // Pricing
    prices: {
      type: [priceSchema],
      default: [],
    },

    // Inventory
    stockStatus: {
      type: String,
      enum: ['In Stock', 'Out of Stock', 'Preorder'],
      default: 'In Stock',
      index: true,
    },
    tags: {
      type: [
        {
          type: String,
          trim: true,
          lowercase: true,
          maxlength: [40, 'Tag cannot exceed 40 characters'],
        },
      ],
      default: [],
      index: true,
    },

    // Community
    rating: {
      type: Number,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
      default: 0,
    },
    reviewCount: {
      type: Number,
      min: [0, 'Review count cannot be negative'],
      default: 0,
    },

    // System
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text search for name, brand, and tags.
componentSchema.index({ name: 'text', brand: 'text', tags: 'text' });
componentSchema.index({ category: 1, stockStatus: 1 });
componentSchema.index({ 'prices.currentPrice': 1 });

const Component = mongoose.model('Component', componentSchema);
export default Component;
