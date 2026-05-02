const mongoose = require('mongoose');
const { Schema } = mongoose;

const transform = (doc, ret) => {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
};

const messageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  attachments: { type: [String], default: [] },
  isRead: { type: Boolean, default: false },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: { virtuals: true, transform },
  toObject: { virtuals: true, transform },
});

module.exports = mongoose.model('Message', messageSchema);
