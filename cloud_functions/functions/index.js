const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const admin = require('firebase-admin');

// hour in ms
const HOUR_MS = 1000 * 60 * 60;

admin.initializeApp();

// firestore events
/*
var frstrTalkCreateTrigger = functions.firestore
    .document("talks/{talkId}")
    .onCreate((snap, context) => {
        // document representation
        var newTalk = snap.data();

        var speakers = newTalk.speakers;
        // TODO: validate speakers

        var attendees = newTalk.attendees;
        // TODO: validate no speaker is attendee and viceversa



    });
*/

var version = 11;
var comment = "fixed: change.after.data -> change.after.data()";

var frstrTalkUpdateTrigger = functions.firestore
    .document("talks/{talkId}")
    .onUpdate((change, context) => {
        // check if start and end does not overlap with other talk
        var talk = change.after.data();
        var talkId = context.params.talkId;

        console.log(`version: ${version} ${comment}`);

        console.log(`talkId: ${talkId}`);

        // if we have the start value, we check if there is another talk overlaping
        if (talk.start) {

            // an overlap would occur when the start or end date (of both) are between the
            // time span of another talk...

            // we want a query like this:
            // select talk from talks where talk.start.date == currentTalk.start.date and
            // (talk.start.time <= currentTalk.start.time and talk.end.time >= currentTalk.start.time)
            // or
            // (talk.start.time >= currentTalk.start.time and talk.start.time <= currentTalk.end.time)

            // firestore hard limit: no range filter on different fields when doing a compound query
            // firestore query limits: no logic "or", so we separate the "or" in two queries and merge the results

            var talksRef = admin.firestore().collection("talks");

            var talkStart = talk.start.toDate();

            console.log(`talk start: ${talkStart}`);

            var dayStart = new Date(talkStart);
            dayStart.setHours(0, 0, 0, 0);

            var dayEnd = new Date(dayStart);
            dayEnd.setHours(23, 59, 59, 999);

            var fsDayEnd   = admin.firestore().Timestamp.fromDate(dayEnd);

            // get the talks that are done in the same day and their start time is 
            // get the talks that are on the same day 
            var sameDayTalks = talksRef
                .where("end", ">=", talk.start)
                .where("end", "<=", fsDayEnd);

            // with those, check the end, based on the duration
            var fsTalkEnd = admin.firestore().Timestamp.fromDate(new Date(talkStart.getTime() + talk.duration * HOUR_MS));

            var overlapTalks = sameDayTalks
                .where("start", "<=", talk.start)
                .where("start", ">=", fsTalkEnd);

            // finally, the values are ok if the last query returns an empty set
            // TODO: check length of the result set
            var result = overlapTalks.get()
                .then(snapshot => {
                    if (snapshot.empty) {
                        console.log(`empty set, talkEnd: ${fsTalkEnd}`);
                        // OK
                        // update talk.end value and save changes
                        var talkRef = admin.firestore().collection("talks").doc(talkId);
                        return talkRef.set({
                            end: fsTalkEnd
                        }, {merge: true});
                    } else {
                        // bad... throw an error?
                        console.log("overlap...");
                        throw new Error(`this values overlap with other talk: ${talk.start}`);
                    }
                }).catch(err => {
                    console.log(`there is a overlap: `, err);
                });

            // final result of the execution
            return result;

        } // if

        // if no "start" value...
        console.log(`no start value: ${talkId}`);

        return false;

    });


exports.talkUpdateTrigger = frstrTalkUpdateTrigger;
