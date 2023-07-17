require('dotenv/config')
const util = require('util')
// solution from https://github.com/node-fetch/node-fetch/blob/HEAD/docs/v3-UPGRADE-GUIDE.md
const admin = require("firebase-admin");

var serviceAccount = require("../configs/firebase/zola-firebase-firebase-adminsdk-rjq2h-87c2c684f4.json");

const init = () => {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const sendPushNotification = async({tokens, title, body, id, type = "post"}) => {
    try {
        tokens = tokens.filter(token => token !== undefined)
        console.log({tokens, title, body, postId: id})
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
                "id": id,
                "type": type,
            }
        })
    } catch (error) {
        console.log(error)
    }
}



module.exports = {init, sendPushNotification}