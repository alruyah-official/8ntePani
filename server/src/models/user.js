const mongoose = require('mongoose');
const { Schema } = mongoose;

const transform = (doc, ret) => {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  delete ret.password;
  return ret;
};

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, required: true, enum: ['buyer', 'seller', 'both'] },
  avatar: String,
  bio: String,
  username: { type: String, required: true, unique: true, trim: true },
  country: String,
  languages: { type: [String], default: [] },
  skills: { type: [String], default: [] },
  sellerLevel: { type: String, enum: ['new', 'level1', 'level2', 'top'], default: 'new' },
  isVerified: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform },
  toObject: { virtuals: true, transform },
});

userSchema.virtual('gigs', {
  ref: 'Gig',
  localField: '_id',
  foreignField: 'sellerId',
});

module.exports = mongoose.model('User', userSchema);
