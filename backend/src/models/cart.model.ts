import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

export interface ICart extends Document {
  sessionId: string;
  userId?: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      max: [10, 'Cannot add more than 10 of the same item'],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      sparse: true,
    },
    items: {
      type: [CartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// TTL index: auto-delete carts after 7 days of inactivity
CartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 604800 });

// Virtual for total amount
CartSchema.virtual('totalAmount').get(function () {
  return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
});

// Virtual for total items
CartSchema.virtual('totalItems').get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
