const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');
const passport = require('passport');

const UserModel = require('../models/user-model.js');

// --------- Sign up -----------
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

// ----------- Log In ----------------

router.post('/login', (req, res, next) => {
  const authenticateFunction =
    passport.authenticate('local', (err, theUser, extraInfo) => {
      if (err) {
        res.status(500).json({ message: 'Unknown login error' });
        return;
      }

      // Login Failed
      if (!theUser) {
        // extra info contains feedback messages from local strategy
        res.status(401).json(extraInfo);
        return;
      }
      // Login Successful
      req.login(theUser, (err) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: ' Session save error '});
          return;
        }

        theUser.encryptedPassword = undefined;

        res.status(200).json(theUser);
      });
    });

  authenticateFunction(req, res, next);
});

// ------------ Log Out -----------

router.post('/logout', (req, res, next) => {
  req.logout();
  res.status(200).json({ message: 'Log out sucessful.' });
});

// ------- Check Login ------------

router.get('/checklogin', (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ message: 'Nobody logged in' });
    return;
  }

  req.user.encryptedPassword = undefined;
  res.status(200).json(req.user);
});
module.exports = router;
