// basic libs
import React from 'react';
import firebase from 'firebase';

// add material-ui
//import ReactDom from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

// table header styles
//const CustomTableCell = 

/**
 * in this component we do the schedule assignment; as part
 * of this, we create "time spans" available according to the room and
 * day choosen, and detect "overlaps"
 */

export default class Schedule extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            // pending talks
            talks: [],
            // list of rooms
            rooms: []
        };
    }

    // 
    componentDidMount () {
        // we need an admin user
        // TODO: check "admin" role

        // get pending talks
        this.unregisterFirestoreObserver = firebase
            .firestore()
            .collection("talks")
            .where('topic', '>', '')
            .where("state", "==", "pending")
            .orderBy("topic")
            .onSnapshot(querySnapshot => {
                const pendingTalks = [];

                for (var doc of querySnapshot.docs) {
                    pendingTalks.push(doc.data());
                }

                this.setState({
                    talks: pendingTalks
                });
            });

    } // componentDidMount

    componentWillUnmount () {
        this.unregisterFirestoreObserver();
    } // componentWillUnmount

    /**
     * 
     * @param {string} talkId 
     */
    acceptTalk (talkId) {
        console.log(`accepted ${talkId}`);
    } // acceptTalk

    /**
     * 
     * @param {string} talkId 
     */
    rejecttalk (talkId) {
        console.log(`rejected ${talkId}`);
    } // rejectTalk

    render () {

        return (
            <React.Fragment>
                <h2>Pending Talks</h2>
                <ul>
                    {this.state.talks.map(talk => {
                        return (
                            <li key={talk.id}>
                                {talk.topic}{' '}
                                <Button variant="outlined" color="primary" onClick={(e) => this.acceptTalk(talk.id)}>
                                    Schedule talk
                                </Button>
                                <Button variant="outlined" color="secondary" onClick={(e) => this.rejectTalk(talk.id)}>
                                    Reject talk
                                </Button>
                            </li>
                        );
                    })}
                </ul>
            </React.Fragment>
        );

    } // render

} // class