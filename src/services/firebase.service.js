const admin = require("firebase-admin");

var serviceAccount = require("../configs/firebase/zola-firebase-firebase-adminsdk-rjq2h-87c2c684f4.json");

const init = () => {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const sendPushNotification = async({tokens, title, body, imageUrl}) => {
    console.log({tokens, title, body, imageUrl})
    await admin.messaging().sendMulticast({
        // ["dV04mucSTSiu_wF6kCjbwo:APA91bH1TCftVlDRz97z2C4mBn3TQb6h9QQKaqbNgQcwJbjzH_99HXqmaPODjDrXBFq8sICNptGyExoxfF2JM4qjc0EnqHclj7FM9KKmY3cXItG3BxHKg5tHzi9WrIEhhJ3Zfd202eUP"]
        tokens: tokens,
        notification: {
        title: title,
        body: body,
        imageUrl: imageUrl,
        },
        data: {
            "click_action": "FLUTTER_NOTIFICATION_CLICK",
            "sound": "default", 
            "status": "done",
            "id": "64469fad1e2dbfa92193b0be",
            "type": "post",
            "screen": "/notification/",
        }
    })
}

module.exports = {init, sendPushNotification}