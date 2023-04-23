
var admin = require("firebase-admin");

const serviceAccount = require("./firebase/zola-firebase-firebase-adminsdk-rjq2h-87c2c684f4.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;

// PushNotifier.prototype.sendNotificationToDeviceIOS = function(data){
//     let android = {
//         priority: "High", //mức độ ưu tiên khi push notification
//         ttl: '360000',// hết hạn trong 1h
//         data: {
//           title: '',
//           content: ''
//         }
//     }
    
//     let message = {
//         android: android,
//         token: tokenDevice // token của thiết bị muốn push notification
//     }
//     firebase.messaging().send(message)
//     .then((response) => {
//         // Response is a message ID string.
//     })
//     .catch((error) => {
//         //return error
//     });
//   }