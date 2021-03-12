const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
    select: false, // will never show up on any return
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        // must use function, not arrow function, to have access to "this"
        return el === this.password; // passes validation if passwords match. THESE ONLY WORKS ON SAVE (not update, must activate validators upon UPDATE)
      },
      message: 'Passwords are not the same',
    },
  },
});

//password encryption
// runs only if password is modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //delete confirm password field from database
  this.passwordConfirm = undefined; // only need password confirmation for signup validation, do not need to store it in the database
  // it is required as input, but that does not mean it is required to be in the DB
  next();
});

// check if password inputted matches hashed password in db
// instance middleware
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // this.password is not possible because of select: false in model
  return await bcrypt.compare(candidatePassword, userPassword); // true if passwords are same
};

const User = mongoose.model('User', userSchema);

module.exports = {
  User,
};
