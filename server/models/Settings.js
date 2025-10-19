import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Static method to get a setting value
settingsSchema.statics.getValue = async function(key, defaultValue = null) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

// Static method to set a setting value
settingsSchema.statics.setValue = async function(key, value, description = null, updatedBy = null) {
  const setting = await this.findOneAndUpdate(
    { key },
    { 
      value, 
      description,
      updatedBy,
      updatedAt: new Date()
    },
    { 
      upsert: true, 
      new: true 
    }
  );
  return setting;
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;