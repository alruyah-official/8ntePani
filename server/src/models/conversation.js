const mongoose = require('mongoose');
const { Schema } = mongoose;

const transform = (doc, ret) => {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
};

const conversationSchema = new Schema({
  participantIds: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
  gigId: { type: Schema.Types.ObjectId, ref: 'Gig', required: true },
  lastMessage: String,
  lastMessageAt: Date,
  unreadCount: { type: Schema.Types.Mixed, default: {} },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: { virtuals: true, transform },
  toObject: { virtuals: true, transform },
});

conversationSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'conversationId',
});

module.exports = mongoose.model('Conversation', conversationSchema);
