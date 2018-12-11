import React, { Component } from "react";
import "./App.css";
import Jukebox from "./components/Jukebox";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Jukebox />
      </div>
    );
  }
}

export default App;
