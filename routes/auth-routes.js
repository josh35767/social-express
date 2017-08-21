const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');

const UserModel = require('../models/user-model.js');

router.post('/signup', (req, res, next) => {
  if (!req.body.signupEmail || !req.body.signupFullName || !req.body.signupPassword) {
    res.status(400).json ({ message: 'Missing Fields.' });
    return;
  }

  UserModel.findOne(
    {email: req.body.signupEmail},
    (err, userFromDb) => {
      if (err) {
        res.status(500).json({ message: 'User search went wrong.'});
        return;
      }

      if (userFromDb) {
        res.status(400).json({ message: 'That email already has an account.'});
        return;
      }

      const salt = bcrypt.genSaltSync(10);
      const scrambledPassword = bcrypt.hashSync(req.body.signupPassword, salt);

      const theUser = new UserModel({
        email: req.body.signupEmail,
        fullName: req.body.signupFullName,
        password: scrambledPassword
      });

      theUser.save((err) => {
        if (err) {
          res.status(500).json({ message: 'User save went wrong'});
          return;
        }

        req.login(theUser, (err) => { //optional to automatically login, defined by passport.
          // Removes the encryptedPassword before sending
          theUser.encryptedPassword = undefined;

          // Sends the user's information to the frontend
          res.status(200).json(theUser);
        });
      });
    }
  );
});

module.exports = router;
