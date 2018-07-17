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
      .collection('talks')
      .onSnapshot(querySnapshot => {
        const newTalks = [];
        console.log('got snapshot!');

        querySnapshot.forEach(function(doc) {
          console.log(doc.data());

          newTalks.push({
            topic: doc.data().Topic,
            id: doc.id,
            isAttending: Object.keys(doc.data().attendees).includes(firebase.auth().currentUser.uid)
          });
        });

        console.log(newTalks);

        this.setState({
          talks: newTalks
        });
      });
  }

  // Make sure we un-register Firebase observers when the component unmounts.
  componentWillUnmount() {
    this.unregisterFirestoreObserver();
  }

  registerUnregisterForTalk(talk) {
    if (!talk.isAttending){ 
      firebase
      .firestore()
      .collection('talks')
      .doc(talk.id)
      .set({ attendees: {[firebase.auth().currentUser.uid]:true} }, { merge: true });
      console.log("Subscribed to talk:" + talk.id);
    } else {
      firebase
      .firestore()
      .collection('talks')
      .doc(talk.id)
      .set({ attendees:{[firebase.auth().currentUser.uid]:firebase.firestore.FieldValue.delete()}},{merge: true});
      console.log("Unsubscribed from talk:" + talk.id);
    }
    
  }

  render() {
    return (
      <React.Fragment>
        <h2>Available Talks</h2>
        <ul>
          {this.state.talks.map(talk => {
            return (
              <li key={talk.id}>
                {talk.topic}{' '}
                <button onClick={(e) => this.registerUnregisterForTalk(talk)}>
                  {talk.isAttending ? 'Unsubscribe' : 'Subscribe'}
                </button>
              </li>
            );
          })}
        </ul>
       
      </React.Fragment>
    );
  }
}
