// Je suis dans /route/user.js
const express = require("express");

const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const router = express.Router();

const User = require("../models/User");
const isAuthenticated = require("../middleware/isAuthentificated");

router.post("/user/signup", async (req, res) => {
  try {
    const { email, username, password, newsletter } = req.fields;

    const userSameMail = await User.findOne({ email: email });
    const userSameUsername = await User.findOne({ account: { username: username } });

    if (username && password && email && newsletter) {
      if (!userSameMail) {
        if (!userSameUsername) {
          const salt = uid2(16);

          const hash = SHA256(salt + password).toString(encBase64);
          const token = uid2(64);

          const newUser = await new User({
            email: email,
            account: {
              username: username,
            },
            newsletter: newsletter,
            token: token,
            hash: hash,
            salt: salt,
          });

          await newUser.save();
          res.status(200).json({
            _id: newUser._id,
            token: token,
            account: {
              username: username,
            },
          });
        } else {
          res.status(409).json({
            message: "Username already taken",
          });
        }
      } else {
        res.status(409).json({
          message: "Email already taken",
        });
      }
    } else {
      res.status(400).json({
        message: "Missing data",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

//login

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.fields;
    const userToFind = await User.findOne({ email: email });

    if (userToFind) {
      const newHash = SHA256(userToFind.salt + password).toString(encBase64);

      console.log(newHash);
      const hash = userToFind.hash;
      console.log(hash);
      if (hash === newHash) {
        res.status(200).json({
          _id: userToFind._id,
          token: userToFind.token,
          account: {
            username: userToFind.account.username,
          },
        });
      } else {
        res.status(401).json({
          message: "Identifiants incorrects",
        });
      }
    } else {
      res.status(401).json({
        message: "Identifiants incorrects",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});


module.exports = router;
