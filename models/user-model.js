const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true
    },

    fullName: {
      type: String,
      required: true
    },

    profilePicture: {
      type: String,
      default: "ng-images/default.jpg"
    },

    password: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true
  }
);

const UserModel = mongoose.model('User', userSchema);


module.exports = UserModel;
