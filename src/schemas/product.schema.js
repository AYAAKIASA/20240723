import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: true
    },
    manager: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    status: {
      type: String,
      required: true,
      enum: ['FOR_SALE', 'SOLD_OUT'],
      default: 'FOR_SALE'
    }
  },
  {
    timestamps: true
  }
);

productSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password; 
    delete ret.__v; 
    return ret;
  }
});

export const Product = mongoose.model('Product', productSchema);
