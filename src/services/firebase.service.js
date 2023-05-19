require('dotenv/config')
const util = require('util')
// solution from https://github.com/node-fetch/node-fetch/blob/HEAD/docs/v3-UPGRADE-GUIDE.md
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const admin = require("firebase-admin");
const User = require("../models/User")

var serviceAccount = require("../configs/firebase/zola-firebase-firebase-adminsdk-rjq2h-87c2c684f4.json");
const { getAgoraToken } = require('./agora.service');

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

const sendCallToMobile = async({userId, tokens, roomId}) => {
    try {
        const  userInfo = await User.findById(userId)

        const callToken = getAgoraToken(roomId, 1)

        const receiverToken = getAgoraToken(roomId, 2)

        tokens = tokens.filter(token => token !== undefined)
        console.log(tokens);

        await admin.messaging().sendMulticast({
            tokens,
            data: {
                "sound": "default", 
                "type": "call",
                "avatar": userInfo.avatarUrl,
                "fullname": userInfo.fullname,
                "roomName": roomId,
                "token": receiverToken,
            },
            options: {
                "priority": "high",
              },
        })
        return {callToken, receiverToken}
        
    } catch (error) {
        console.log(error);    
        return null
    }

}

module.exports = {init, sendPushNotification, sendCallToMobile}