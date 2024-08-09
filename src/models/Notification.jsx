import { Timestamp, collection, runTransaction, doc } from "firebase/firestore";
import { db } from "../firebase";

export default class Notification{
    constructor(
        uid=null,
        initiatorID=null,
        recipientID=null,
        notifTitle=null,
        notifDesc=null,
        notifTimestamp= Timestamp.now(),
        notifReadStatus= false,
    ){
        this.uid = null;
        this.initiatorID = initiatorID;
        this.recipientID = recipientID;
        this.notifTitle = notifTitle;
        this.notifDesc = notifDesc;
        this.notifTimestamp = Timestamp.now();
        this.notifReadStatus = false;
    }

    //HELPER FUNCTIONS
    //creates a doc of a notification in firebase for a user
    //returns true on success, false otherwise
    async create () {
        try {
            const noti_collection_ref = collection (db, 'users', this.userID , 'notifications')

            const doc_ref = doc(noti_collection_ref);
            
            const response = await runTransaction (db, async ( transaction ) => {
                transaction.set(doc_ref, { ...this, uid: doc_ref.id });
                return true;
            });

            return response;

        } catch ( error ) {
            console.error ( 'error creating notification: ', error );
            return false;
        }
    }

    async read(userID, uid) {
        try {
            const noti_collection_ref = collection (db, 'users', userID , 'notifications')
            const doc_ref = doc(noti_collection_ref, uid); 
            console.log(doc_ref)
            const response = await runTransaction(db, async (transaction) => {
                transaction.update(doc_ref, { notifReadStatus: true });
                return true;
            });

            return response;

        } catch ( error ) {
            console.error ( 'error creating notification: ', error );
            return false;
        }
    }

    static async GET_notification_by_id (user_id, noti_id) {
        try {
            const userDocRef = doc(db, 'users', user_id, 'notifications', noti_id);
    
            const notificationDocSnapshot = await getDoc(userDocRef);
    
            if (notificationDocSnapshot.exists()) {
                return notificationDocSnapshot.data();
            } else {
                console.error('Notification document does not exist');
                return null;
            }
        } catch (error) {
            console.error('Error retrieving notification:', error);
            return null;
        }
    }
}