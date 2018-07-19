
import React from 'react';
import firebase from 'firebase';

export default class ProposeTalkForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {talk: {topic: "",
                        speaker: "persons/" + firebase.auth().currentUser.uid,
                        duration: 0,
                        state: "pending"}};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    eval("this.state.talk." + event.target.name + " = event.target.value;");
    this.setState(this.state.talk);
  }

  handleSubmit(event) {
    this.proposeTalk(this.state.talk);
    event.preventDefault();
  }

  proposeTalk(talk){
    firebase.firestore().collection('talks').add(talk);
  }   

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Topic:
          <input name="topic" type="text" value={this.state.talk.topic} onChange={this.handleChange} />
        </label>
        <br/>
        <label>
          Duration:
          <input name="duration" type="text" value={this.state.talk.duration} onChange={this.handleChange} />
        </label>
        <br/>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}