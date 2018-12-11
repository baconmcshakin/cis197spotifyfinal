import React, { Component } from "react";
import axios from "axios";
import Modal from "react-modal";

import "../styles/jukebox.css";
import "../styles/header.css";
import "../styles/instructions.css";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)"
  }
};

class Jukebox extends Component {
  constructor(props) {
    super(props);
    const songs = [];
    const preview_url = "";
    const answer = 0;
    var score = 0;
    var name = "";
    var modalIsOpen = false;
    var songPlaying = false;

    var leaderboard = [];

    this.state = {
      songs,
      preview_url,
      answer,
      score,
      modalIsOpen,
      name,
      leaderboard,
      songPlaying
    };
    this.getSpotify = this.getSpotify.bind(this);
    this.playSong = this.playSong.bind(this);
    this.guessSong = this.guessSong.bind(this);
    this.gameOver = this.gameOver.bind(this);

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);

    this.getLeaderboard = this.getLeaderboard.bind(this);
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  openModal() {
    this.setState({ modalIsOpen: true });
  }

  afterOpenModal() {
    // references are now sync'd and can be accessed.
    this.subtitle.style.color = "#f00";
  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  componentDidMount() {
    this.getSpotify();
    this.getLeaderboard();
  }

  getSpotify() {
    if (this.state.preview_url != "") {
      this.state.preview_url.pause();
    }

    axios
      .get("/spotify-req", {
        params: {}
      })
      .then(res => {
        console.log(res.data.songOptions);
        console.log(res.data.answer);
        this.setState({
          songs: res.data.songOptions,
          songPlaying: false,
          answer: res.data.answer,
          preview_url: new Audio(
            res.data.songOptions[res.data.answer].preview_url
          )
        });
      })
      .catch(err => {});
  }

  playSong() {
    if (this.state.songPlaying) {
      this.state.preview_url.pause();
      this.setState({
        songPlaying: false
      });
    } else {
      //var a = new Audio(this.state.preview_url);
      this.state.preview_url.play();
      this.setState({
        songPlaying: true
      });
    }
  }

  gameOver() {
    this.closeModal();
    console.log(this.state.name);

    axios
      .post("/api/leaderboard/post-score", {
        params: { username: this.state.name, score: this.state.score }
      })
      .then(res => {
        console.log("successful");
        this.setState({
          score: 0,
          songPlaying: false
        });
        this.getLeaderboard();
        this.getSpotify();
      })
      .catch(err => {});

    // AXIOS PUT NAME AND SCORE INTO DB
  }

  getLeaderboard() {
    ///get-leaderboard
    axios
      .get("/api/leaderboard/get-leaderboard", {
        params: {}
      })
      .then(res => {
        console.log("got it");
        console.log(res);

        this.setState({
          leaderboard: res.data.leaderboardData
        });
      })
      .catch(err => {});
  }

  guessSong(guess) {
    console.log("guess " + guess);
    if (guess == this.state.answer) {
      console.log("YOU GUESSED CORRECT! +1");
      this.setState({ score: this.state.score + 1 });
      this.getSpotify();
    } else {
      console.log("WRONG!!!");
      this.setState({ score: this.state.score - 0.5 });
      this.getSpotify();
    }
  }
  render() {
    return (
      <div>
        <div id="navbar">
          <nav>
            <span className="navname">JUKEBOX</span>
            <div className="rightside">
              <span className="score">Score: {this.state.score}</span>
            </div>
          </nav>
        </div>

        <div id="instructions">
          <h1 id="welcome">Welcome to Jukebox!</h1>
          <div id="rules">
            <span id="rulespan">
              The rules are simple: Press the play button on the preview of a
              song, and try to guess what song it is by clicking on one of the
              multiple choice options! If you guess correct, you get a point. If
              you're wrong, you lose 0.5 points. When you're done playing, hit
              the 'Game Over' button to submit your score to the leaderboard!
            </span>
          </div>
        </div>

        <div id="controls">
          {this.state.songPlaying ? (
            <button id="play" onClick={this.playSong}>
              Pause Song
            </button>
          ) : (
            <button id="play" onClick={this.playSong}>
              Play Song
            </button>
          )}

          <button id="skip" onClick={this.getSpotify}>
            Skip
          </button>
          <button id="gameover" onClick={this.openModal}>
            Game Over
          </button>
        </div>

        <div id="buttonOptions">
          {this.state.songs.map((song, index) => (
            <div
              className="options"
              key={index}
              onClick={() => this.guessSong(index)}
            >
              <span id="songname">"{song.name}"</span>
              <span id="artist">{song.artists[0].name}</span>
            </div>
          ))}
        </div>

        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <h2 ref={subtitle => (this.subtitle = subtitle)}>
            You scored: {this.state.score}
          </h2>
          <div>Please enter your name</div>
          <form>
            <input
              name="name"
              value={this.state.name}
              onChange={e => this.handleChange(e)}
            />
          </form>
          <button onClick={this.gameOver}>Submit</button>
        </Modal>

        <section id="statTable">
          <div id="statDiv">
            <table id="stats">
              <tbody>
                <tr>
                  <th className="table-nicknames-h">Nicknames</th>
                  <th className="table-scores-h">Scores</th>
                </tr>
                {this.state.leaderboard
                  .slice(0, 100)
                  .map((highscore, index) => (
                    <tr key={index.toString()}>
                      <td className="table-names">{highscore.username}</td>
                      <td className="table-scores">{highscore.score}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }
}
export default Jukebox;
