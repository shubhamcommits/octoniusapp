import mongoose from 'mongoose';

const { Schema } = mongoose;

const ResetpwdSchema = new Schema({
  _account: {
    type: Schema.Types.ObjectId,
    ref: 'Account'
  }
});

const Resetpwd = mongoose.model('Resetpwd', ResetpwdSchema);

export { Resetpwd };
