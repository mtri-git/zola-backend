
var admin = require("firebase-admin");

var serviceAccount = require("./firebase/zola-b0920-firebase-adminsdk-vn1zv-21c4448dc3.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

PushNotifier.prototype.sendNotificationToDeviceIOS = function(data){
    let android = {
        priority: "High", //mức độ ưu tiên khi push notification
        ttl: '360000',// hết hạn trong 1h
        data: {
          title: '',
          content: ''
        }
    }
    
    let message = {
        android: android,
        token: tokenDevice // token của thiết bị muốn push notification
    }
    firebase.messaging().send(message)
    .then((response) => {
        // Response is a message ID string.
    })
    .catch((error) => {
        //return error
    });
  }