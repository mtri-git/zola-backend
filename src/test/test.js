const {RtcTokenBuilder, RtcRole} = require('agora-token')

const appID = '0eab3e12158840c8b14539c108f770f6';
const appCertificate = '5ddf975212fa476aab27b4be9dae3c40';
const channelName = '7d72365eb983485397e3e3f9d460bdda';
const uid = 2882341273;
const role = RtcRole.PUBLISHER;

const expirationTimeInSeconds = 3600

const currentTimestamp = Math.floor(Date.now() / 1000)

const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

// IMPORTANT! Build token with either the uid or with the user account. Comment out the option you do not want to use below.

// Build token with uid
const tokenA = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, role, privilegeExpiredTs);
console.log("Token With Integer Number Uid: " + tokenA);
