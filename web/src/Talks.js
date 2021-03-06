// Import FirebaseAuth and firebase.
import React from 'react';
import firebase from 'firebase';

// material-ui
import Button from '@material-ui/core/Button';

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

        querySnapshot.forEach(doc => {
          var talk = doc.data();
          var isAttending = talk.attendees
            ? Object.keys(talk.attendees).includes(firebase.auth().currentUser.uid)
            : false;

          newTalks.push({
            topic: talk.topic,
            id: doc.id,
            isAttending: isAttending
          });
        });

        this.setState({
          talks: newTalks
        });
      });
  } // componenDidMount

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
    
  } // registerUnregisterForTalk

  render() {
    return (
      <React.Fragment>
        <h2>Available Talks</h2>
        <ul>
          {this.state.talks.map(talk => {
            return (
              <li key={talk.id}>
                {talk.topic}{' '}
                <Button variant="outlined" color="primary" onClick={(e) => this.registerUnregisterForTalk(talk)}>
                  {talk.isAttending ? 'Unsubscribe' : 'Subscribe'}
                </Button>
              </li>
            );
          })}
        </ul>
       
      </React.Fragment>
    );
  } // render
  
} // class
