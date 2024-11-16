import { addDoc, updateDoc, collection, query, getDocs, Timestamp, where, doc, getDoc, runTransaction, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import RedeemLog from "./RedeemLog";
import Leaderboard from "./Leaderboard";
import Notification from "./Notification";

export default class Prize {
    constructor (
        name = '',
        cost = 0,
        type = '',
        desc = '',
        img_url = '',
        demo = '',
    ){
        this.id = '';
        this.name = name;
        this.cost = cost;
        this.type = type;
        this.desc = desc;
        this.img_url = img_url;
        this.demo = demo
        this.timestamp = Timestamp.now();
        this.available = true;
    }

    //HELPER FUNCTIONS
    //creates a doc of a prize in firebase
    //returns true on success, false otherwise
    async create ( name, cost, type, desc, img_url, demo) {
        try {
            const prize_collection_ref = collection ( db, 'prizes' );

            const doc_ref = await addDoc ( prize_collection_ref, { ...this } );

            const doc_id = doc_ref.id;

            this.id = doc_id;

            await updateDoc ( doc_ref, { id : doc_id});

            return true

        } catch ( error ) {
            console.error ( 'error creating prize: ', error );
            return false;
        }
    }

    static async is_available ( id ) {
        try {
            const data = await this.GET_prize ( id );

            if ( (data !== null) && (data.available === true) ) {
                return true;
            }

            else return false;

        } catch (error) {
            console.error ( 'error checking if prize is available: ', error );
            return false;
        }
    }

    static async can_be_redeemed ( prize_id, user_id ) {
        
    }

    //SERVICES
    //POST prize
    //creates a prize and returns true on success, false otherwise
    static async POST_prize  ( name, cost, type, desc, img_url, demo ) {

        try{
            await runTransaction ( db, async ( transaction ) => {
                const prize = new Prize ( name, cost, type, desc, img_url, demo );

                const success = await prize.create();

                if ( !success ) {
                    console.error ( 'error creating prize entry' );
                    return false;
                }
            });

            return true;

        } catch ( error ) {
            console.error ( 'error positng prize', error);
            return false;
        }
    }

    //UPDATE Prize
    //creates a prize and returns true on success, false otherwise
    static async UPDATE_prize  ( 
        id = null,
        name = null,
        cost = null,
        type = null,
        desc = null,
        img_url = null, 
        demo = null ) {

        try{
            await runTransaction ( db, async ( transaction ) => {
                const doc_ref = doc ( db, 'prizes', id);
                const doc_snapshot = await getDoc ( doc_ref );

                if ( !id ) {
                    console.log ( 'id not provided' );
                    return false;
                }

                if ( !doc_snapshot.exists() || doc_snapshot.empty ) {
                    console.log ( 'document does not exist' );
                    return false;
                }

                //create fields to update
                let fields_to_update = {};
                if ( name ) fields_to_update.name = name;
                if ( cost ) fields_to_update.cost = cost;
                if ( type ) fields_to_update.type = type;
                if ( desc ) fields_to_update.desc = desc;
                if ( img_url ) fields_to_update.img_url = img_url;
                if ( demo ) fields_to_update.demo = demo;
                transaction.update ( doc_ref, fields_to_update );
            });

            return true;

        } catch ( error ) {
            console.error ( 'error positng prize', error);
            return false;
        }
    }

    //DELETE prize
    //deletes a prize, returns true on success false otherwise
    static async DELETE_prize ( id ) {
        try {

            //create the ref to the document
            const doc_ref = doc ( db, 'prizes', id )

            const doc_snapshot = await getDoc ( doc_ref );
                
            if ( !doc_snapshot.exists() ) {
                console.error ( 'prize doc does not exist', error);
                return false;
            } 
            
            await deleteDoc ( doc_ref );

            return true;

        } catch ( error ) {
            console.error ( 'error deleting student doc', error );
            return true;
        }
    }

    //GET prize
    //gets a prize by a specified id, returns data
    static async GET_prize ( id ) {
        try{

            let data = [];

            //create ref to users docs
            const prize_doc_ref = doc ( db, 'prizes', id );

            //retrieve doc
            const prize_doc_snapshot = await getDoc ( prize_doc_ref );

            //if doc exists return data, otherwise return null
            if ( !prize_doc_snapshot.exists() ) { 
                console.error ( 'prize doc does not exist' );
            }
            
            data = prize_doc_snapshot.data();
            
            return data;

        } catch ( error ) {
            console.error ( 'error positng prize', error);
            return data;
        }
    }

    //GET prize ALL
    //gets all prizes, returns data on success, null otherwise
    static async GET_prizes () {
        try {

            let data = [];
            
            const prize_collection_ref = collection (db, 'prizes');
            const q = query ( prize_collection_ref );

            const query_snapshot = getDocs ( q );

            if ( query_snapshot.empty ) { return null; }

            (await query_snapshot).forEach( ( doc ) => {
                data.push ( doc.data() );
            });

            return data;
            
        } catch (error) {
            console.error ( 'error retrieving all prizes: ', error);
            return null;
        }
    }

    //GET prize ALL available
    static async GET_prizes_available () {
        try {

            const data = [];

            const prize_collection_ref = collection(db, 'prizes');
            const q = query(prize_collection_ref, where('available', '==', true));

            const query_snapshot = await getDocs(q);

            if ( query_snapshot.empty ) { return data; }

            query_snapshot.forEach(doc => {
                data.push({ id: doc.id, ...doc.data() });
            });
  
            return data;

        } catch (error) {
            console.error('Error fetching available prizes:', error);
            return [];
        }
    }

    //POST Redeem prize
    //performs a redeem op
    static async POST_prize_redeeem(user_id, prize_id) {
        try {
            const result = await runTransaction(db, async (transaction) => {
                // Get prize doc 
                const prize_doc_ref = doc(db, 'prizes', prize_id);
                const prize_doc_snapshot = await transaction.get(prize_doc_ref);
    
                // Check if the prize doc exists
                if (!prize_doc_snapshot.exists() || prize_doc_snapshot.empty) {
                    console.error('Prize document does not exist');
                    return false;
                }
    
                // Get the prize data
                const prize_data = prize_doc_snapshot.data();
    
                // Check if the prize is available for redemption
                if (!prize_data.available) {
                    console.error('Prize document is not available for redemption');
                    return false;
                }
    
                // Get user document
                const user_doc_ref = doc(db, 'users', user_id);
                const user_doc_snapshot = await transaction.get(user_doc_ref);
    
                // Check if the user doc exists
                if (!user_doc_snapshot.exists() || user_doc_snapshot.empty) {
                    console.error('User document does not exist');
                    return false;
                }
    
                const user_data = user_doc_snapshot.data();
    
                // Check if the user has enough points to redeem
                if (Number(user_data.current_pts) < Number(prize_data.cost)) {
                    console.error('User cannot afford');
                    return false;
                }
    
                // Create a redeem log
                const redeemlog = new RedeemLog(user_id, prize_id);
    
                // Add a redeem log entry into the db
                const redeem_collection_ref = collection(db, 'redeemlog');
                const redeem_doc_ref = doc(redeem_collection_ref); // Create a new document reference
                transaction.set(redeem_doc_ref, { ...redeemlog }, { merge: true }); // Use set with merge option
    
                let description = `Student ${user_data.first_name} ${user_data.last_name} (Student ID: ${user_data.id}) redeemed ${prize_data.name} for ${prize_data.cost} points.`;
                
               // Send notification to all admin/admin demo users
               const adminsSnapshot = await getDocs(
                    query(
                    collection(db, 'users'),
                    where('role', 'in', ['admin', 'adminDemo'])
                    )
                );
                 
                adminsSnapshot.forEach(adminDoc => {
                    const adminId = adminDoc.id;
                    const noti_ref = collection(db, 'users', adminId, 'notifications');
                    const noti_doc_ref = doc(noti_ref);
                    const noti = new Notification(null, user_id, adminId, 'Prize Redeemed', description); 
                    transaction.set(noti_doc_ref, { ...noti, uid: noti_doc_ref.id }, { merge: true });
                }); 


                // Update student points
                transaction.update(user_doc_ref, {
                    current_pts: Number(user_data.current_pts) - Number(prize_data.cost),
                    spent_pts: Number(user_data.spent_pts) + Number(prize_data.cost),
                });

                //update the prize entry
                transaction.update ( prize_doc_ref, { available: false } );
    
                return true;
            });
    
            return result;
        } catch (error) {
            console.error('Error redeeming prize:', error);
            return false;
        }
    }    
}
