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


exports.generateQrCode = generateQrCode;
