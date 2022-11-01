var admin = require("firebase-admin");
const serviceAccount = require("./octonius-mobile-firebase-adminsdk.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
    // credential: cert({
    //     projectId: 'octonius-mobile',
    //     clientEmail: "firebase-adminsdk-h61te@octonius-mobile.iam.gserviceaccount.com",
    //     privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDBZybr5UQReHtG\n94Rg8b0nq4LJWUegTqdnBcBph3OoDEnEE6BgXFySdxKuXlj5202sMqpUqTa84Lzy\nYfso/3K/Uu9qdFQN6kec3L0ZC7VbltVeNKYFU+3qP91l0D6dg5W78Djh3sEOMfI0\no7f/wQxFFW3vYECvuNIpa4a+jOSwvLxqstoW6pWOrku935+5TciijOefOjrnEAgR\ng9wC+Y+bLjfZXVYL01EElY1q/HJYMK7gnFcZDhbxjBNINA40zrNnss0H8v1WyJ3M\nhIi9lab3BUycQWHfkP31CoZjOHNYQ/DsIH6acCAxqCVxBCkHPgpWY35vTcfQVRhG\nohkYQ3kDAgMBAAECggEADFiA2AsdEr5tpCSVuziDOh6NLTw5QcbzkbSAyVu/qskK\nBm24TZ5nvGPEegQEywJQTX84d0oL9/eiqBhQF5hi40qwhMujN/YuFxnSKmCgdZXF\nzgsvU+S9Kbhk8iRecuCc9M/LWcPF8BmJHAoda0KP/XL2PxMWXgE+zS0Tf2NwD8YH\n/7/FBzisEf6sXnYOD8q6cSG9mzBl5fOFw9V8sP68UzXD6Pwhkx3O7aM4HHod8zhd\nX1kDqS9o5zV2Mzuku1DilMEmorQa20yuWahxv5ewPlvRhiiY0SQeHokwjjucEk3J\nJZ4ohJTLgvSQV3yHe5LgdVf2pdBvHJSDI3KOEguWVQKBgQDydmNZoUhsFt/4PDmn\nV8ikg7etMnDdlrf5wEolawuElObmLqzZ4kyLlSSrhgkr9nhtHE8kJSQOWwL3iUps\nDIQ0Oh6qWjVk+viHsdGk6gmiX2kPdJ4a5eQtbHrc6uvbLwcm5obiqf8PCn/vToVP\n9QnR5EqRjSKOvglCI8nQ470/hwKBgQDMM4lvNCUYwIydDUt+zN11ZJyzvnK1zs2/\nPAG4ZlZrGbt8dK8qbJH/U7YrAfjovHMKzXzGoR20l/tcYk6StWzNOIxukQ6cV47A\n/rc1szXeWAb3XanjN2wt19FJIGqPanJ1Tm5t6FhW5bzE9KOwGKNIjncKVK+mDhD8\nedGMvCYBpQKBgQDSnqjbGVFyI8TXPGnQxl7TGmCaIXEN7HlQiQtfycctmrOhTPZ2\nJzDbJ+m83ihleitOjQLqoSDbH5BKO4bcqVrGi55L2ST83U67gWpd2bgYxsza0jDt\nqLo4Az4PXjsYIZgS4LpXd9jK1hIgbZM8y92F6Mwl9/YHDWm5fKE5xjuFTQKBgQCu\ns2Tga+dU/t8OOmKdkB3jonliWgx/uPdTpb3/CibjKDe76YQ3Mn3RyMewkdZnH1r5\nIgafVRY5/FEDn+ODJo54IOocaiPq5Anw2brayYDLwdnr5glDqJX3vo2CF6azHing\nbIKTq1Vwuso+YuJr9Rg1KhV0FDHWSnCD4KDD2/BUNQKBgAx3Ug8F8rkcRjbB4tjx\n0Atzt9HFIHG32V5NMG/HY8uQc7tE8gtVpWt2YonTzqXlXguQ1wuxRvGxW8WHG6GX\nTo1IA4LFlJ8NmbRt+lnuNFo2dq7M5ClQ7DPDvhoHYG/p1QRUbMFlVHDLThPq3IpH\njqplpBP9mSAIFIAK6KPuMf4y\n-----END PRIVATE KEY-----\n"
    // }),
    //credential: applicationDefault(),
    //credential: admin.credential.applicationDefault(),
    //credential: admin.credential.cert(serviceAccount),
    //credential: admin.credential.cert("./octonius-mobile-firebase-adminsdk.json"),
    //databaseURL: "https://<DATABASE_NAME>.firebaseio.com"
});

async function sendFirebaseNotification(workspaceId: string, registrationToken: string, messageTitle: string, messageBody: string) {

    if (registrationToken && messageTitle && messageBody) {         
        var payload = {
            notification: {
                title: messageTitle,
                body: messageBody
            },
            data: {
                'workspaceId': workspaceId.trim() || ''
            }
            //, topic: 'octonius'
        };

        var options = {
            priority: "high",
            timeToLive: 60 * 60 *24
        };

        admin.messaging().sendToDevice(registrationToken, payload, options)
            .then((response) => {
                console.log("Successfully sent message:", response);
            })
            .catch((error) => {
                console.log("Error sending message:", error);
            });
    }
};



/*  =======================
 *  --  HELPER FUNCTIONS --
 *  =======================
 * */
export {
    sendFirebaseNotification,
}