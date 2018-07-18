const functions = require('firebase-functions');
const http = require('http');
const admin = require('firebase-admin');

// hour in ms
const HOUR_MS = 1000 * 60 * 60;

admin.initializeApp();

// initialize gcs SDK for Cloud Storage upload
const gcs = require('@google-cloud/storage')();

const generateQrCode = functions.firestore
  .document('talks/{talkId}')
  .onCreate((snapShot, context) => {
    const talkId = context.params.talkId;
    const qrCodeURL = `http://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${talkId}`;
    console.log(admin.storage().bucket());
    const bucket = gcs.bucket(admin.storage().bucket().name);
    const fileName = `qr-codes/${talkId}`;
    const writeStream = bucket.file(`qr-codes/${talkId}`).createWriteStream({
      metadata: { contentType: 'image/png' }
    });

    return new Promise((resolve, reject) => {
      http
        .get(qrCodeURL, response => {
          response.pipe(writeStream);
        })
        .on('error', err => reject(err))
        .on('finish', () => resolve(true));
    })
      .then(() => {
        return snapShot.ref.set({ qrDownloadPath: fileName }, { merge: true });
      })
      .catch(err => {
        console.log('error: ' + err);
      });
  });


var version = 14;
var comment = "in progress: fix search for overlapped talks";

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

            //var talkStart = talk.start.toDate();

            console.log(`talk start: ${talk.start}`);

            var dayStart = new Date(talk.start);
            dayStart.setHours(0, 0, 0, 0);

            var dayEnd = new Date(dayStart);
            dayEnd.setHours(23, 59, 59, 999);

            //var fsDayEnd   = admin.firestore().Timestamp.fromDate(dayEnd);

            // with those, check the end, based on the duration
            //var fsTalkEnd = admin.firestore().Timestamp.fromDate(new Date(talkStart.getTime() + talk.duration * HOUR_MS));
            var talkEnd = new Date(talk.start.getTime() + talk.duration * HOUR_MS);

            console.log(`talkEnd: ${talkEnd}`);

            // get the talks that are done in the same day and their start time is 
            // get the talks that are on the same day 
            return talksRef
                .where("end", ">=", talk.start)
                .where("end", "<=", dayEnd)
                .get()
                .then(snapshot => {
                    // filter with the start property by hand
                    if (snapshot.empty) {
                        // OK
                        var talkRef = admin.firestore().collection("talks").doc(talkId);
                        return talkRef.set({
                            end: talkEnd
                        }, {merge: true});

                    } else {
                        // check each entry start entry:
                        // there is overlap if (start <= talk.start AND start >= talkEnd)
                        console.log(snapshot.docs);

                        for (var doc of snapshot.docs) {
                            // TODO: check if start or end overlap

                            //if (overlap) {
                            //    throw new Error(`this values overlap with other talk: ${talk.start}`);
                            //}

                        }

                        return false;

                    }
                })
                .catch(err => {
                    console.log(`there is a overlap: `, err);
                });

            /*
            var overlapTalks = sameDayTalks
                .where("start", "<=", talk.start)
                .where("start", ">=", talkEnd);
            */

            // finally, the values are ok if the last query returns an empty set
            // TODO: check length of the result set
            /*
            var result = overlapTalks.get()
                .then(snapshot => {
                    if (snapshot.empty) {
                        console.log(`empty set, talkEnd: ${talkEnd}`);
                        // OK
                        // update talk.end value and save changes
                        var talkRef = admin.firestore().collection("talks").doc(talkId);
                        return talkRef.set({
                            end: talkEnd
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
            */

        } // if

        // if no "start" value...
        console.log(`no start value: ${talkId}`);

        return false;

    });


exports.talkUpdateTrigger = frstrTalkUpdateTrigger;
exports.generateQrCode = generateQrCode;
