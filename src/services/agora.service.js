const {RtcTokenBuilder, RtcRole} = require('agora-token')
require('dotenv/config')

const appID = '0eab3e12158840c8b14539c108f770f6';
const appCertificate = '5ddf975212fa476aab27b4be9dae3c40';

const role = RtcRole.PUBLISHER;

const expirationTimeInSeconds = 3600

const currentTimestamp = Math.floor(Date.now() / 1000)

const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds


const getAgoraToken = (channelName, uid) => {
    try {
        return RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, role, privilegeExpiredTs);
    } catch (error) {
        console.log(error)
        return null
    }
}

module.exports = {
    getAgoraToken
}