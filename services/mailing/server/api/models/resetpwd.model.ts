import mongoose from 'mongoose';

const { Schema } = mongoose;

const ResetpwdSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

const Resetpwd = mongoose.model('Resetpwd', ResetpwdSchema);

export { Resetpwd };
