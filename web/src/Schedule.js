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

// schedule form dialog components
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';

// form components
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

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
            rooms: [],
            // dialog form state
            dialogOpen: false,
            // room selected
            roomId: null,
            day: 1,
            time: null
        };
    }

    // 
    componentDidMount () {
        // we need an admin user
        // TODO: check "admin" role

        // get the room list
        firebase
            .firestore()
            .collection("rooms")
            //.orderBy("name")
            .get()
            .then(docs => {
                var rooms = [];
                docs.forEach(doc => {
                    console.log("ID:", doc.id);
                    var room = doc.data();
                    room.roomId = doc.id;
                    rooms.push(room);
                });
                this.setState({
                    rooms: rooms
                });
            })
            .catch(err => {
                console.log("ERROR", err);
            });

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
    acceptTalkHandler = (talkId) => {
        console.log(`accepted ${talkId}`);

        this.setState({
            dialogOpen: true
        });

    } // acceptTalk

    saveAcceptedHandler = () => {

        // TODO: update talk with "accepted" state,
        // room, day and time
        // and close dialog
        this.setState({
            dialogOpen: false
        });

    } // saveAcceptedHandler

    cancelAcceptedHandler = () => {
        this.setState({
            dialogOpen: false
        });
    }

    /**
     * 
     * @param {string} talkId 
     */
    rejectTalkHandler = (talkId) => {

        // TODO: update talk state to "rejected"
        firebase
            .firestore()
            .collection("talks")
            .doc(talkId)
            .update({
                state: "rejected"
            })
            .then( () => {});

        console.log(`rejected ${talkId}`);
    } // rejectTalk

    roomChangeHandler = (roomId) => {
        this.setState({
            roomId: roomId
        });
    }

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
                                        <Button variant="outlined" color="primary" onClick={(e) => this.acceptTalkHandler(talk.talkId)}>Schedule</Button>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="outlined" color="secondary" onClick={(e) => this.rejectTalkHandler(talk.talkId)}>Reject</Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </Table>
                </Paper>
                <Dialog open={this.state.dialogOpen} onClose={this.cancelAcceptedHandler}>
                    <DialogTitle>Assign Room</DialogTitle>
                    <DialogContent>
                        <Select
                            value={this.state.roomId}
                            onChange={this.roomChangeHandler}
                            name="roomId"
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                        {this.state.rooms.map(room => {
                            return (
                                <MenuItem value={room.roomId}>{room.name}</MenuItem>
                            );
                        })}
                        </Select>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="raised" color="primary" onClick={this.saveAcceptedHandler}>
                            Guardar
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );

    } // render

} // class
