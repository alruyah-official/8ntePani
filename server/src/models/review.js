const mongoose = require('mongoose');
const { Schema } = mongoose;

const transform = (doc, ret) => {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
};

const reviewSchema = new Schema({
  gigId: { type: Schema.Types.ObjectId, ref: 'Gig', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: { virtuals: true, transform },
  toObject: { virtuals: true, transform },
});

module.exports = mongoose.model('Review', reviewSchema);
