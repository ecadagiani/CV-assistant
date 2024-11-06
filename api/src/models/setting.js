import mongoose from 'mongoose';

const { Schema } = mongoose;

const Setting = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
  description: { type: String },
}, { timestamps: true });

// Setting.index not needed because key is already set as unique, so index is created automatically

const SettingModel = mongoose.model('Setting', Setting);

export default SettingModel;
