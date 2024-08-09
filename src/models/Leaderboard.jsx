import { db } from "../firebase";
import { addDoc, updateDoc, getDoc, collection, doc, setDoc, orderBy, query, getDocs } from "firebase/firestore";

export default class Leaderboard{
    constructor(
        id
    ){
        this.id = id;
        this.rank = Number.MAX_SAFE_INTEGER;
    }

    //HELPER FUNCTIONS
    //creates a doc of a leaderboard position in firebase
    //returns true on success, false otherwise
    async create () {
        try {
            //create a ref to leaderboard collection using instance id
            const leaderboard_ref = doc(db, 'leaderboard', this.id );
    
            //save doc
            await setDoc (leaderboard_ref, { ...this });
    
            return true;
            
        } catch (error) {
            console.error('error creating leaderboard entry:', error);
            return false;
        }
    }

    //SERVICES
    //POST leaderboard
    //creates a leaderboard entry for a user id and returns true on success, false otherwise
    static async POST_leaderboard ( id ) {
        try {
            //create a leaderbaord instance
            const leaderboard = new Leaderboard ( id );

            //add leaderboard doc to firebase
            const success_creating_leaderboard = await leaderboard.create();

            if ( !success_creating_leaderboard ) {
                console.error ( 'error creating leaderboard entry' );
                return false;
            }

            return true;

        } catch ( error ) {
            console.error ( 'error creating leaderboard entry', error );
            return false;
        }
    }

    //UPDATE leaderboard
    //updates the entire leaderboard returns true on success, false otherwise
    static async UPDATE_leaderboard () {
        try {
            //create ref to leaderboard collection
            const users_ref = collection(db, 'users');
            //create sorted query
            const q = query(users_ref, orderBy('accumulated_pts', 'desc'));

            //execute query
            const query_snapshot = await getDocs(q);
        
            if ( query_snapshot.empty ) {
                console.error ( 'error updating leaderboard' );
                return false;
            }
            
            //init counter
            let new_rank = 1;
           // Array to store promises
            const updatePromises = [];

            // Iterate all docs
            for (const doc of query_snapshot.docs) {
                const id = doc.id;

                // Push promise to array
                updatePromises.push(this.UPDATE_rank(id, new_rank));
                new_rank++; // Increment counter
            }

            // Wait for all promises to resolve
            await Promise.all(updatePromises);


            return true;

        } catch ( error ) {
            console.error ( 'error updating leaderboard', error );
            return false;
        }
    }
    
    //GET rank
    //get rank of a student by id returns data on success, false otherwise
    static async GET_rank ( id ) {
        try {
            //create leaderboard ref
            const leaderboard_ref = doc ( db, 'leaderboard', id);

            //retrieve doc
            const leaderboard_doc_snapshot = await getDoc (leaderboard_ref);

            //if doc is empty or doesn not exist
            if ( !leaderboard_doc_snapshot.exists () || leaderboard_doc_snapshot.empty ) { return null }

            //get the data from the snapshot
            const data = leaderboard_doc_snapshot.data();

            //retrun the rank
            return ( data.rank );

        } catch ( error ) {
            console.error ( 'error retrieving user doc:' , error);
            return null;
        }
    }

    //UPDATE rank
    //updates the rank of a specified id returns true on success, false otherwise
    static async UPDATE_rank (id, rank) {
        try {
            // Create reference to the document with the specified ID
            const leaderboard_doc_ref = doc(collection(db, 'leaderboard'), id);
    
            // Check if the document exists
            const doc_snapshot = await getDoc(leaderboard_doc_ref);
            if ( !doc_snapshot.exists () ) {
                // Document does not exist
                console.error ( 'doc does not exist' );
                return false;
            }
            
            //update rank field of the doc
            await updateDoc ( leaderboard_doc_ref, { 'rank': rank } );
            return true;

        } catch (error) {
            console.error('Error updating ranks:', error);
            return false;
        }
    }

    //GET leaderboard
    //retrieves the entire leaderboard returns data on success, false otherwise
    static async GET_leaderboard () {

    }
}