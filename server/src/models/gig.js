const mongoose = require('mongoose');
const { Schema } = mongoose;

const transform = (doc, ret) => {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
};

const gigSchema = new Schema({
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  category: { type: String, required: true, trim: true },
  subcategory: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  tags: { type: [String], default: [] },
  images: { type: [String], default: [] },
  packages: { type: Schema.Types.Mixed, default: {} },
  avgRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform },
  toObject: { virtuals: true, transform },
});

gigSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'gigId',
});

module.exports = mongoose.model('Gig', gigSchema);
