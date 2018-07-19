import React from 'react';
import firebase from 'firebase';

export default class RegisterSpeakerForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {speaker: {firstName: "",
                            lastName: "",
                            phone: "",
                            email: "",
                            role: "speaker"}};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    eval("this.state.speaker." + event.target.name + " = event.target.value;");
    this.setState(this.state.speaker);
  }

  handleSubmit(event) {
    this.registerSpeaker(firebase.auth().currentUser.uid,this.state.speaker);
    event.preventDefault();
  }

  registerSpeaker(uid,speaker){
    firebase.firestore().collection('persons').doc(uid).set(speaker);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          First Name:
          <input name="firstName" type="text" value={this.state.speaker.firstName} onChange={this.handleChange} />
        </label>
        <br/>
        <label>
          Last Name:
          <input name="lastName" type="text" value={this.state.speaker.lastName} onChange={this.handleChange} />
        </label>
        <br/>
        <label>
          Phone:
          <input name="phone" type="text" value={this.state.speaker.phone} onChange={this.handleChange} />
        </label>
        <br/>
        <label>
          Email:
          <input name="email" type="email" value={this.state.speaker.email} onChange={this.handleChange} />
        </label>
        <br/>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}