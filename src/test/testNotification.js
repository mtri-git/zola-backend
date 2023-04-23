const admin = require("firebase-admin");

var serviceAccount = require("../configs/firebase/zola-firebase-firebase-adminsdk-rjq2h-87c2c684f4.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

(
    async () => {
    await admin.messaging().sendMulticast({
        tokens: ["dV04mucSTSiu_wF6kCjbwo:APA91bH1TCftVlDRz97z2C4mBn3TQb6h9QQKaqbNgQcwJbjzH_99HXqmaPODjDrXBFq8sICNptGyExoxfF2JM4qjc0EnqHclj7FM9KKmY3cXItG3BxHKg5tHzi9WrIEhhJ3Zfd202eUP"],
        notification: {
        title: "Weather Warning!",
        body: "A new weather warning has been issued for your location.",
        imageUrl: "https://picsum.photos/200",
        },
    })
    }
)()
