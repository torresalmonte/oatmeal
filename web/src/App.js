// Import FirebaseAuth and firebase.
import React from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase';
import Talks from './Talks';
import Schedule from './Schedule';

// material-ui
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
//import Button from '@material-ui/core/Button';
//import IconButton from '@material-ui/core/IconButton';
//import MenuIcon from '@material-ui/icons/Menu';

// material-ui classes
const styles = {
  root: {
    flexGrow: 1
  },
  flex: {
    flexGrow: 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  }
};

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
          <div className={styles.root}>
            <AppBar position="static">
              <Toolbar>
                <Typography variant="title" color="inherit" className={styles.flex}>
                  Oatmeal
                </Typography>
              </Toolbar>
            </AppBar>
          </div>
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
            <div className={styles.root}>
              <AppBar position="static">
                <Toolbar>
                  <Typography variant="title" color="inherit" className={styles.flex}>
                    Oatmeal
                  </Typography>
                </Toolbar>
              </AppBar>
            </div>
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
            <div className={styles.root}>
              <AppBar position="static">
                <Toolbar>
                  <Typography variant="title" color="inherit" className={styles.flex}>
                    Oatmeal Conference Management System (Admin)
                  </Typography>
                </Toolbar>
              </AppBar>
            </div>
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

