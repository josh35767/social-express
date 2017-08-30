const passport = require('passport');
const bcrypt   = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

const UserModel = require('../models/user-model.js');

passport.serializeUser((userFromDb, next) => {
  next(null, userFromDb._id);
});

passport.deserializeUser((idToFetch, next) => {
  UserModel.findById(
    idToFetch,
    (err, userFromDb) => {
      if(err) {
        next(err);
        return;
      }

      next(null, userFromDb);
    }
  );
});

passport.use(new LocalStrategy(
  {
    usernameField: 'loginEmail',
    passwordField: 'loginPassword'
  },
  (theUsername, thePassword, next) => {
    UserModel.findOne(
      { email: theUsername },
      (err, userFromDb) => {
        if (err) {
          next(err);
          return;
        }

        if (!userFromDb) {
          next(null, false, { message: 'Email not found.' });
          return;
        }

        if (!bcrypt.compareSync(thePassword, userFromDb.password)) {
          next(null, false, {message: 'Incorrect Password'});
          return;
        }

        next(null, userFromDb);
      }
    ); // Close usermodel. find one
  }
));
