const admin = require("firebase-admin");

var serviceAccount = require("../configs/firebase/zola-firebase-firebase-adminsdk-rjq2h-87c2c684f4.json");

const init = () => {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const sendPushNotification = async({tokens, title, body, postId}) => {
    console.log({tokens, title, body, postId})
    try {
        
        await admin.messaging().sendMulticast({
            tokens: tokens,
            notification: {
            title: title,
            body: body,
            },
            data: {
                "click_action": "FLUTTER_NOTIFICATION_CLICK",
                "sound": "default", 
                "status": "done",
                "id": postId,
                "type": "post",
            }
        })
    } catch (error) {
        console.log(error)
    }
}

const sendCallToMobile = async({tokens, data}) => {
    try {
        await admin.messaging().sendMulticast({
            tokens,
            data: {
                "sound": "default", 
                "type": "call",
                ...data
            },
            options: {
                "priority": "high",
                "timeToLive": 60 * 60 * 24
              },
        })
        
    } catch (error) {
        console.log(error);    
    }

}

module.exports = {init, sendPushNotification, sendCallToMobile}