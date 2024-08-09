import User from "./User";
import Leaderboard from "./Leaderboard";
import Course from "./Course";

import { db } from "../firebase";
import { addDoc, setDoc, collection, doc, updateDoc, getDoc, writeBatch, runTransaction, deleteDoc, getDocs, query, where } from "firebase/firestore";

export default class Student extends User{
    constructor(
        //params from User
        id = null,
        first_name = null,
        last_name = null,
        email = null,
        desc = null,
        img_url = null,
    ) {
        super( id, first_name, last_name, email, desc, img_url, 'student' );
        //params specific to student
        this.current_pts = 0;
        this.spent_pts = 0;
        this.accumulated_pts = 0;
    }

    //HELPER FUNCTIONS
    async create() {
        try {
            // Create batch operation
            const batch = writeBatch(db);
    
            // Create reference to Users collection
            const user_doc_ref = doc(db, 'users', this.id);
    
            // Add to the Users collection within the batch, including all initial points
            batch.set(user_doc_ref, {
                ...this,
                current_pts: this.current_pts || 0,
                spent_pts: this.spent_pts || 0,
                accumulated_pts: this.accumulated_pts || 0,  // Ensure initial points are set to 0
            });
    
            // Initialize necessary subcollections (optional, would be added in post/put events)
            const notifications_collection_ref = collection(user_doc_ref, 'notifications');
            const pointlogs_collection_ref = collection(user_doc_ref, 'pointlogs');
            const redeemlogs_collection_ref = collection(user_doc_ref, 'redeemlogs');
            const courses_collection_ref = collection(user_doc_ref, 'courses');
    
            // Add documents to subcollections within the batch
            batch.set(doc(notifications_collection_ref), {});
            batch.set(doc(pointlogs_collection_ref), {});
            batch.set(doc(redeemlogs_collection_ref), {});
            batch.set(doc(courses_collection_ref), {});
    
            // Commit the batch
            await batch.commit();
    
            return true;
        } catch (error) {
            console.error('error adding student to users: ', error);
            return false;
        }
    }
    
    //if a user has student role
    //returns true if user role is student false otherwise
    static async is_student ( id ) {
        try {
            //create user doc ref
            const user_doc_ref = doc ( db, 'users', id);

            //get the doc
            const user_doc_snapshot = await getDoc ( user_doc_ref );

            //if the doc exists
            if ( user_doc_snapshot.exists() ) {
                const data = user_doc_snapshot.data();

                return ( data.role === 'student' )
            }

            console.error ( `user doc does not exist for student ID: ${id}`, error );
            return false;

        } catch ( error ) {
            console.error ( 'error checking if user is a student: ', error );
            return false;
        }
    }

    //SERVICES
    //POST student
    //creates a user
    static async POST_student (id, first_name, last_name, email, password, desc, img_url) {

        try {
            
            await runTransaction ( db, async ( transaction ) => {
                //create a new student instance
                const student = new Student ( id, first_name, last_name, email, desc, img_url );

                //check to see if the email and id supplied are available
                const email_available = await student.email_available ();
                const id_available = await student.id_available ();

                if ( !email_available || !id_available ) {
                    console.error ( 'id or email unavailable' );
                    
                    //return response to client
                    return ( { status: 500 , body: 'ID or email unavailable' } );
                }

                //create a signin for the new student
                await student.create_signin ( password );

                //check if uid created successfully
                if ( student.uid === null ) {
                    console.error ( 'server unable to auth uid to user' );

                    //return response to client
                    return ( { status: 403, body: 'Server unable to authenticate signin to a profile' } );
                }

                //create student entry in firebase                    
                const success_creating_student = await student.create();

                //if creating new student was not successful created
                if ( !success_creating_student ) { 
                    console.error ( 'error creating student entry in firebase' );
                    
                    //return response to client
                    return ( { status: 403 , body: 'Server unable to auth creation of user' } );
                }

                //create leaderboard entry
                const success_creating_leaderboard = await Leaderboard.POST_leaderboard ( id ) ;

                //if successful return true
                if ( !success_creating_leaderboard ) { 
                    console.error ( 'error creatine leaderboard entry ' );
                    
                    //return response to client
                    return ( { status: 403 , body: 'Server unable to auth creation of leaderboard entry' } );
                }
            });

            //return response to client
            return ( { status: 200 , body: 'Student successfully created' } );

        } catch ( error ) {
            console.error ( 'POST user error: ', error );

            //return response to client
            return ( { status: 500 , body: 'Server unable to create student' } );
        }

    }

    //GET student
    //gets a students data based on id returns data on success, [] otherwise
    static async GET_student ( id ) {
        try {

            //response successful body for client
            let response = {status: 200, body: null }

            //create user doc ref
            const doc_ref = doc ( db, 'users', id);

            //get the doc
            const doc_snapshot = await getDoc ( doc_ref );

            //if the doc exists and is not empty
            if ( !doc_snapshot.exists() || doc_snapshot.empty ) {
                console.error ( 'user doc does not exist or is empty for student');
                
                //return response to client
                return ( { status: 404 , body: 'Student not found' } );
            }

            response.body = doc_snapshot.data();

            if ( await this.is_student (response.body.id) ) {
                return ( response );
            }
            
            return ( { status: 404 , body: 'Student not found' } );

        } catch ( error ) {
            return ( { status: 500 , body: 'Server unable to find student' } );
        }
    }

     //GET students
     static async GET_students() {
        try {
            let response = {status: 200, body: []};
            const collection_ref = collection(db, 'users');
            const q = query(collection_ref, where('role', '==', 'student'));
            const query_snapshot = await getDocs(q);
    
            if (query_snapshot.empty) {
                return ({status: 404, body: 'Students not found'});
            }
    
            query_snapshot.forEach(doc => {
                const data = doc.data();
                // Concatenate first name and last name for full name display
                const fullName = `${data.first_name} ${data.last_name} (${doc.id})`; // Include the document ID
                response.body.push({...data, name: fullName, id: doc.id}); // Ensure 'id' is part of the returned data
            });
    
            return response;
        } catch (error) {
            console.error('error retrieving all students:', error);
            return ({status: 500, body: 'Server unable to retrieve students'});
        }
    }
    
 

    static async GET_student_pointlogs ( id ) {
        try {

            let response = { status:200, body: [] };

            //create pt log ref
            const ptlog_ref = collection ( db , 'pointlogs' );
            const q = query ( ptlog_ref, where ( 'student_id', '==', id ) );
            const query_snapshot = await getDocs ( q );

            for (const doc of query_snapshot.docs) {
                if (doc.exists && !doc.empty) {
                    response.body.push(doc.data());
                }
            }

            return response;

        } catch (error) {
            console.error('Error retrieving pointlogs:', error);
            return { status: 500, body: 'Server unable to retrieve pointlogs' };
        }
    }

}