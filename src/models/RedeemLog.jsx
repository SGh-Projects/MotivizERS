import { addDoc, updateDoc, collection, query, getDocs, Timestamp, where, doc, getDoc, runTransaction } from "firebase/firestore";
import { db } from "../firebase";

export default class RedeemLog {
    constructor (
        user_id = '',
        prize_id = '',
    ){
        this.id = '';
        this.user_id = user_id;
        this.prize_id = prize_id;
        this.timestamp = Timestamp.now();
    }

    async create () {
        try {
            const redeem_collection_ref = collection ( db, 'redeemlog' );

            const doc_ref = await addDoc ( redeem_collection_ref, { ...this } );

            const doc_id = doc_ref.id;

            this.id = doc_id;

            await updateDoc ( doc_ref, { id : doc_id});

            return true

        } catch ( error ) {
            console.error ( 'error creating redeem log: ', error );
            return false;
        }
    }

    static async POST_redeemlog ( user_id, prize_id ) {
        try {
            await runTransaction ( db, async ( transaction ) => {
                const redeemlog = new RedeemLog ( user_id, prize_id );

                const success = redeemlog.create();

                if ( !success ){
                    return false;
                }
            });

            return true;

        } catch ( error ) {
            console.error ('error creating redeem log ', error );
            return true;
        }

    }

    static async GET_redeemlog ( id ) {
        try {
            let data = null;

            await runTransaction ( db, async ( transaction ) => {
                //create ref to users docs
                const redeem_collection_ref = doc ( db, 'redeemlog', id );

                //retrieve doc
                const redeemlog_doc_snapshot = await getDoc ( redeem_collection_ref );

                data = redeemlog_doc_snapshot.data();
            });

            return data;

        } catch ( error ) {
            console.error ( ' error retrieving redeemlog by id: ', error );
            return null;
        }
    }

    static async GET_redeemlog_ALL () {
        try {

            let data = [];

            await runTransaction ( db, async ( transaction ) => {
                const collection_ref = collection (db, 'redeemlog');
                const q = query ( collection_ref );

                const query_snapshot = getDocs ( q );

                if ( query_snapshot.empty ) { return data; }

                (await query_snapshot).forEach( ( doc ) => {
                    data.push ( doc.data() );
                });

            });

            return data;
            
        } catch (error) {
            console.error ( 'error retrieving all prizes: ', error);
            return null;
        }
    }

    static async GET_student_redeemlogs ( id ) {
        try {

            let response = { status:200, body: [] };

            //create redeem log ref
            const rlog_ref = collection ( db , 'redeemlog' ); 
            const q = query ( rlog_ref, where ( 'user_id', '==', id ) );
            const query_snapshot = await getDocs ( q );

            query_snapshot.forEach(doc => {
                if (doc.exists()) {
                    response.body.push(doc.data());
                } else {
                    console.log('No redeem log document found for ID:', id);
                }
            });
    
            return response;

        } catch (error) {
            console.error('Error retrieving redeemlogs:', error);
            return { status: 500, body: 'Server unable to retrieve redeemlogs' };
        }
    }
}