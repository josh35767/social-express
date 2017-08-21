const passport = require('passport');
const bcrypt   = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

const UserModel = require('../models/user-model.js');

passport.serializeUser((userFromDb, next) => {
  next(null, userFromDb._id);
});
