const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const leaderboard = require("./routes/api/leaderboard");

var Spotify = require("node-spotify-api");

var spotify = new Spotify({
  id: "6f46548d3eb7406daf5047667577145f",
  secret: "7d41fc62b3514b289fca3d3304a52406"
});

const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set up DB
const db = require("./config/keys").mongoUri;

mongoose
  .connect(db)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch(err => console.log(err));

app.get("/", (req, res) => res.send("Hello"));

app.get("/spotify", (req, res) => {
  spotify.search(
    { type: "track", query: "All the Small Things" },
    (err, data) => {
      if (err) {
        return console.log("Error occurred: " + err);
      }
      //console.log(data.tracks.items[0]);
      res.send({ true: true });
    }
  );
});

var answer = 0;

app.get("/spotify-req", (req, res) => {
  // https://api.spotify.com/v1/playlists/{playlist_id

  var playlistIdArr = [
    "37i9dQZEVXbLRQDuF5jeBp",
    "37i9dQZF1DX0XUsuxWHRQd",
    "37i9dQZF1DWXRqgorJj26U",
    "37i9dQZF1DX4dyzvuaRJ0n",
    "37i9dQZF1DX2Nc3B70tvx0",
    "37i9dQZF1DWTcqUzwhNmKv",
    "37i9dQZF1DX4adj7PFEBwf",
    "37i9dQZF1DWYV7OOaGhoH0"
  ];
  var playlistId =
    playlistIdArr[Math.floor(Math.random() * Math.floor(playlistIdArr.length))];

  var songArr = [];
  spotify
    .request("https://api.spotify.com/v1/playlists/" + playlistId)
    .then(function(data) {
      //console.log(data.tracks.items);

      for (var i = 0; i < data.tracks.items.length; i++) {
        if (data.tracks.items[i].track.preview_url != null) {
          songArr.push(data.tracks.items[i].track);
        }
      }

      var randomChoices = [];

      for (var i = 0; i < 5; i++) {
        randomChoices.push(
          songArr.splice(Math.random() * (songArr.length - 1), 1).pop()
        );
      }

      answer = Math.floor(Math.random() * Math.floor(5));
      res.send({ songOptions: randomChoices, answer: answer });
    })
    .catch(function(err) {
      console.error("Error occurred: " + err);
      res.send({ success: false });
    });
});

// Use routes
app.use("/api/leaderboard", leaderboard);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
