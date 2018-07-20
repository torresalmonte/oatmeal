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
const CustomTableCell = withStyles(theme => ({
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    body: {
        fontSize: 14,
    },
}))(TableCell);

const styles = theme => ({
    root: {
        width: '100%',
        marginTop: theme.spacing.unit * 3,
        overflowX: 'auto'
    },
    table: {
        minWidth: 700
    },
    row: {
        '&nth-of-type(odd)': {
            backgroundColor: theme.pallete.background.default
        }
    }
});

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
                    var talk = doc.data();
                    talk.talkId = doc.id;
                    pendingTalks.push(talk);
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
    rejectTalk (talkId) {
        console.log(`rejected ${talkId}`);
    } // rejectTalk

    render () {

        return (
            <React.Fragment>
                <h2>Pending Talks</h2>
                <Paper className={styles.root}>
                    <Table className={styles.table}>
                        <TableHead>
                            <CustomTableCell>Topic</CustomTableCell>
                            <CustomTableCell>#</CustomTableCell>
                            <CustomTableCell>#</CustomTableCell>
                        </TableHead>
                        {this.state.talks.map(talk => {
                            return (
                                <TableRow key={talk.talkId}>
                                    <TableCell>{talk.topic}</TableCell>
                                    <TableCell>
                                        <Button variant="outlined" color="primary" onClick={(e) => this.acceptTalk(talk.talkId)}>Schedule</Button>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="outlined" color="secondary" onClick={(e) => this.rejectTalk(talk.talkId)}>Reject</Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </Table>
                </Paper>
            </React.Fragment>
        );

    } // render

} // class
