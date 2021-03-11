const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true, // not a validator, it transforms the email into lowercase
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        // must use function, not arrow function, to have access to "this"
        return el === this.password; // passes validation if passwords match. THESE ONLY WORKS ON SAVE (not update, must activate validators upon UPDATE)
      },
    },
  },
});

const User = mongoose.model('User', userSchema);

module.exports = {
  User,
};
