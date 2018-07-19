// Import FirebaseAuth and firebase.
import React from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase';
import Talks from './Talks';
import Schedule from './Schedule';

s

// Configure Firebase.
const config = {
  apiKey: 'AIzaSyAVJn0YvZ7rgPmp-KQzakvI3Wf54yCkQPU',
  authDomain: 'oatmeal-hack.firebaseapp.com',
  databaseURL: 'https://oatmeal-hack.firebaseio.com',
  projectId: 'oatmeal-hack',
  storageBucket: 'oatmeal-hack.appspot.com',
  messagingSenderId: '62071888839'
};
firebase.initializeApp(config);

export default class App extends React.Component {
  // The component's Local state.
  state = {
    isSignedIn: false // Local signed-in state.
  };

  // Configure FirebaseUI.
  uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    // We will display Google and Facebook as auth providers.
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.PhoneAuthProvider.PROVIDER_ID
    ],
    callbacks: {
      // Avoid redirects after sign-in.
      signInSuccessWithAuthResult: () => false
    }
  };

  // Listen to the Firebase Auth state and set the local state.
  componentDidMount() {
    this.unregisterAuthObserver = firebase
      .auth()
      .onAuthStateChanged(user => {
        const isSignedIn = !!user;
        if (isSignedIn) {
          // get the person document
          firebase
            .firestore()
            .collection("persons")
            .doc(user.uid)
            .get()
            .then(person => {
              this.setState({
                isSignedIn: isSignedIn,
                person: person.data()
              });
            })
            .catch(err => {
              console.log("ERROR", err);
              this.setState({
                isSignedIn: false,
                err: err
              });
            });
        } else {
          this.setState({
            isSignedIn: isSignedIn
          });
        }
      });
      //.onAuthStateChanged(user => this.setState({ isSignedIn: !!user }));
  }

  // Make sure we un-register Firebase observers when the component unmounts.
  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  render() {

    if (!this.state.isSignedIn) {
      return (
        <div>
          <h1>My App</h1>
          <p>Please sign-in:</p>
          <StyledFirebaseAuth
            uiConfig={this.uiConfig}
            firebaseAuth={firebase.auth()}
          />
        </div>
      );
    } else {
      // from here on, the user is signed-on

      switch (this.state.person.role) {
        case "speaker":
        return (
          <div>
            <h1>Oatmeal</h1>
            <p>
              Welcome {firebase.auth().currentUser.displayName}! You are now
              signed-in!
            </p>
            <Talks />
          </div>
        );
    
        case "admin":
        return (
          <div>
            <h1>Oatmeal Admin</h1>
            <p>
              Welcome {this.state.person.firstName} {this.state.person.lastName}
            </p>
            <Schedule />
          </div>
        );

        default:
        console.log("default", this.state.person);
        return (
          <div>
            Default
          </div>
        );
      
      } // switch
    }


  } // render

} // class

