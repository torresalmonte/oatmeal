// Import FirebaseAuth and firebase.
import React from 'react';
import firebase from 'firebase';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      talks: []
    };
  }

  // Listen to the Firebase Auth state and set the local state.
  componentDidMount() {
    this.unregisterAuthObserver = firebase
      .firestore()
      .collection('talks')
      .onSnapshot(querySnapshot => {
        const newTalks = [];
        console.log('got snapshot!');

        querySnapshot.forEach(function(doc) {
          console.log(doc.data());
          newTalks.push(doc.data().Topic);
        });

        console.log(newTalks);

        this.setState({
          talks: newTalks
        });
      });
  }

  // Make sure we un-register Firebase observers when the component unmounts.
  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  render() {
    return (
      <React.Fragment>
        <h2>Available Talks</h2>
        <ul>
          {this.state.talks.map(talkName => <li key={talkName}>{talkName}</li>)}
        </ul>
      </React.Fragment>
    );
  }
}
