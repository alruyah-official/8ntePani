const mongoose = require('mongoose');
const { Schema } = mongoose;

const transform = (doc, ret) => {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
};

const orderSchema = new Schema({
  gigId: { type: Schema.Types.ObjectId, ref: 'Gig', required: true },
  buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  packageType: { type: String, required: true, enum: ['basic', 'standard', 'premium'] },
  requirements: String,
  price: { type: Number, required: true },
  deliveryDays: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'delivered', 'revision', 'completed', 'cancelled'], default: 'pending' },
  deliveryNote: String,
  attachments: { type: [String], default: [] },
  dueDate: Date,
  completedAt: Date,
}, {
  timestamps: { createdAt: true, updatedAt: true },
  toJSON: { virtuals: true, transform },
  toObject: { virtuals: true, transform },
});

orderSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'orderId',
});

module.exports = mongoose.model('Order', orderSchema);
