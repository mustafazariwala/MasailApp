const express = require('express');
const fs = require('fs');
const request = require('request')
const https = require('https');
const fetch = require('node-fetch');
const readline = require('readline');
const {google} = require('googleapis');


const router = express.Router()

let drive;

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content), listFiles);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
  drive = google.drive({version: 'v3', auth});
}

router.get('/class', (req,res,next)=> {
    drive.files.list({
        q: "'1hldN9zaakecACq-xa5rexTqmKUjBtNcl' in parents",
        pageSize: 20,
        fields: 'nextPageToken, files(id, name, description, webContentLink )',
      }, (err, result) => {
        if (err) return console.log('The API returned an error: ' + err);
        const files = result.data.files;
        if (files.length) {
          res.status(200).send(files)

          // files.map((file) => {
            // console.log(`${file.name} ${file.id}`);
            // console.log(file);
          // });
        } else {
          console.log('No files found.');
        }
      });

})

router.get('/subject/:subjectId', (req,res,next)=> {
  let query = `'${req.params.subjectId}' in parents`
  drive.files.list({
      q: query,
      pageSize: 20,
      fields: 'nextPageToken, files(id, name, description)',
    }, (err, result) => {
      if (err) return console.log('The API returned an error: ' + err);
      const files = result.data.files;
      if (files.length) {
        res.status(200).send(files)

        // files.map((file) => {
          // console.log(`${file.name} ${file.id}`);
          // console.log(file);
        // });
      } else {
        console.log('No files found.');
      }
    });

})

router.get('/topic/:topicId', (req,res,next)=> {
  console.log('Topic')
  console.log(req.params.topicId)
  let query = `name = 'Master-List' and '${req.params.topicId}' in parents and trashed = false`
  drive.files.list({
      q: query,
      pageSize: 20,
      orderBy: 'name',
      fields: 'nextPageToken, files(id, name, description, webContentLink)',
    }, (err, result) => {
      if (err) return console.log('The API returned an error: ' + err);
      const files = result.data.files;
      if (files.length) {
        request( `https://spreadsheets.google.com/feeds/list/${files[0].id}/od6/public/values?alt=json`, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var importedJSON = JSON.parse(body);
            console.log(importedJSON);
            res.status(200).send(importedJSON.feed.entry)
          }
        })

        // files.map((file) => {
          // console.log(`${file.name} ${file.id}`);
          // console.log(file);
        // });
      } else {
        console.log('No files found.');
      }
    });

})



router.get('/image/:subjectId/:imageId', (req,res,next)=> {
  console.log(req.params.imageId)
  console.log(req.params.subjectId)
  let query = `name contains '${req.params.imageId}' and '${req.params.subjectId}' in parents`
  drive.files.list({
      q: query,
      pageSize: 20,
      orderBy: 'name',
      fields: 'nextPageToken, files(id, name, description, webContentLink)',
    }, (err, result) => {
      if (err) return console.log('The API returned an error: ' + err);
      const files = result.data.files;
      if (files.length) {
        res.status(200).send(files)

        // files.map((file) => {
          // console.log(`${file.name} ${file.id}`);
          // console.log(file);
        // });
      } else {
        console.log('No files found.');
      }
    });

})

module.exports = router