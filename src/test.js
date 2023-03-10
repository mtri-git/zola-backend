// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure
const accountSid = "AC93e9214cfaf46abdbe5c8270278f6efe";
const authToken = "830fa3a9d34b7f487022fc7897055668";
const client = require("twilio")(accountSid, authToken);

client.messages
  .create({ body: "Hello from Twilio", from: "+14242915663", to: "+84826575703" })
  .then(message => console.log(message.sid))
  .catch(err => console.log(err))