import BPromise from 'bluebird';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const User = new Schema({
  conversations: [{ type: Schema.Types.ObjectId, ref: 'Conversation' }],
}, { timestamps: true });

User.index({ createdAt: 1, updatedAt: 1 });

User.post('findOneAndDelete', async (user) => {
  if (user?.conversations && user.conversations.length > 0) {
    await BPromise.map(user.conversations, async (conversation) => (
      mongoose.model('Conversation').findOneAndDelete({ _id: conversation._id })
    ));
  }
});

const UserModel = mongoose.model('User', User);

export default UserModel;
