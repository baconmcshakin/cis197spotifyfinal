const express = require("express");
const router = express.Router();

const User = require("../models/User");

// update leaderboard (take a name and score, put it on leaderboard)

// display leaderbaord (get all rows, show them)

// test route
router.get("/test", (req, res) => res.json({ test: "Leaderboard works" }));

// Add user and their score to the DB
router.post("/post-score", (req, res) => {
  console.log(req.body.params);

  const newscore = new User({
    username: req.body.params.username,
    score: req.body.params.score
  });

  newscore
    .save()
    .then(user => res.json(user))
    .catch(err => console.log(err));
});

// Show all scores in the DB in sorted score order
router.get("/get-leaderboard", (req, res) => {
  User.find()
    .sort({ score: -1 })
    .then(data => {
      res.send({ leaderboardData: data });
    })
    .catch(err => {
      console.error("Error occurred: " + err);
      res.send({ success: false });
    });
});

module.exports = router;
