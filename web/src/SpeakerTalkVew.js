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
    this.unregisterFirestoreObserver = firebase
      .firestore()
      .collection('talks').where('speaker','==','persons/' + firebase.auth().currentUser.uid)
      .onSnapshot(querySnapshot => {
        const newTalks = [];

        querySnapshot.forEach(function(doc) {
          newTalks.push({
            talk: doc.data(),
            id: doc.id
          });
        });

        this.setState({
          talks: newTalks
        });
      });
  }

  // Make sure we un-register Firebase observers when the component unmounts.
  componentWillUnmount() {
    this.unregisterFirestoreObserver();
  }

  render() {
    return (
      <React.Fragment>
        <h2>Proposed Talks</h2>
        <ul>

          {this.state.talks.map(talkDoc => {
            return (
              <li key={talkDoc.id}>
                {talkDoc.talk.topic}{', '}{talkDoc.talk.duration}{' hrs, '}{talkDoc.talk.state}
              </li>
            );
          })}
        </ul>
       
      </React.Fragment>
    );
  }
}
