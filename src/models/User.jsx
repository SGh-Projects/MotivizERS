import { auth, db } from "../firebase";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, setDoc, collection, doc, updateDoc, getDoc, writeBatch, runTransaction, deleteDoc, getDocs, query, where, limit } from "firebase/firestore";

export default class User {
    constructor(
        id = null,
        first_name = null,
        last_name = null,
        email = null,
        desc = null,
        img_url = null,
        role = null
    ){
        this.uid = null;
        this.id = id;
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.desc = desc;
        this. img_url = img_url;
        this.role = role;
    };

    //checks if email available to use for signup
    async email_available () {
        try {
            const sign_in_methods = await fetchSignInMethodsForEmail ( auth, this.email);
            return sign_in_methods.length === 0;

        } catch (error) {
            console.error( 'error checking email availability: ', error );
            return false
        }
    };

    //checks if id is available for signup
    async id_available () {
        try {
            const student = await User.get_by_id ( this.id );

            if ( student === null ) { return true; }
            else { return false; }

        } catch ( error ) {
            console.error( 'error checking if id available: ', error);
            return false;
        }
    }

    async create(){
        try{
            const user_doc_ref = collection(db, 'users');
            batch.set(user_doc_ref, { ...this });
        return true;
        }catch(error){
            return false
        }
    }

    //creates a auth signin for signup
    async create_signin ( password ){
        try {
            //create a signin and return the uid
            const user_credential = await createUserWithEmailAndPassword(auth, this.email, password);
            this.uid = user_credential.user.uid;

        } catch (error) {
            console.error('error creating signin: ', error);
        }
    }

    //gets the role 
    static async GET_user_role ( id ) {
        try {
            const doc_ref = doc ( db, 'users', id);
            const doc_snapshot = await getDoc ( doc_ref );
            const doc_data = doc_snapshot.data();

            return doc_data.role;

        } catch {
            return null;
        }
    }

    //retrieves a user by their uid
    static async get_by_uid ( uid ) {
        try {
            // Reference to the users collection
            const usersCollectionRef = collection(db, 'users');
    
            // Query for documents where the uid field matches the provided uid
            const q = query(usersCollectionRef, where('uid', '==', uid), limit(1));
    
            // Execute the query and get the snapshot of the results
            const querySnapshot = await getDocs(q);
    
            // Check if there are any matching documents
            if (!querySnapshot.empty) {
                // Access the first (and only) document in the query results
                const doc = querySnapshot.docs[0];
                //console.log(doc.id, ' => ', doc.data());
                // Return the data of the document
                return doc.data();
            } else {
                // If no matching document found, return null
                console.log('No user found with the specified UID.');
                return null;
            }

        } catch ( error ) {
            console.error ( 'error searching for user by uid: ', error);
            return null;
        }
    }

    //retrieves a user by their id and returns the data
    static async get_by_id ( id ) {
        try {
            //create ref to users doc
            const user_doc_ref = doc ( db, 'users', id );

            //retrieve doc
            const user_doc_snapshot = await getDoc ( user_doc_ref );

            //if doc exists return data, otherwise return null
            if ( user_doc_snapshot.exists() && !user_doc_snapshot.empty ) { return ( user_doc_snapshot.data() ); }
            else { return null; }

        } catch ( error ) {
            console.error ( ' error retrieving user by id: ', error );
            return null;
        }
    }

    //UPDATE user
    //updates a user details, returns true on success false otherwise
    //import { db } from "../firebase";
 //import { doc, runTransaction } from "firebase/firestore";

//class User {
    static async UPDATE_user(id, updates) {
        if (!id) { 
            console.error('User ID not provided');
            return { status: 400, body: "User ID is required." };
        }

        const docRef = doc(db, "users", id);

        try {
            await runTransaction(db, async (transaction) => {
                const docSnapshot = await transaction.get(docRef);

                if (!docSnapshot.exists()) {
                    throw new Error(`User with ID ${id} not found.`);
                }

                transaction.update(docRef, updates);
            });

            return { status: 200, body: `User with ID ${id} successfully updated.` };
        } catch (error) {
            console.error('Error updating user:', error);
            return { status: 500, body: `Failed to update user: ${error.message}` };
        }
    }
    
//}

//export default User;

    //DELETE user
    //deletes a user, returns true on success false otherwise
    static async DELETE_user ( id ) {
        try {

            //create the ref to the document
            const doc_ref = doc ( db, 'users', id )

            const doc_snapshot = await getDoc ( doc_ref );
                
            if ( !doc_snapshot.exists() ) {
                console.error ( 'user doc does not exist', error);
                return ( { status:404, body:`User with ID ${id} not found.`} )
            } 
            
            await deleteDoc ( doc_ref );

            return ( { status:200, body:`User with ID ${id} successfully updated.`} );

        } catch ( error ) {
            console.error ( 'error deleting student doc', error );
            return ( { status:200, body:`Server error deleting user with ID ${id}.`} );
        }
    }

    static async GET_user_courses ( id ) {
        try {
            let response = { status: 200, body: [] };

            //get all the course ids from the user
            const user_ref = doc ( db, 'users', id );
            const courses_ref = collection ( user_ref, 'courses' );

            let courses = [];

            //get all docs from the subcollection
            const query_snapshot = await getDocs ( courses_ref );

            for (const doc of query_snapshot.docs) {
                if (doc.exists && !doc.empty) {
                    const temp = doc.data();
                    if (temp && temp.course_id !== undefined ) {
                        courses.push(temp.course_id);
                    }
                }
            }            

            for (const course of courses) {
                const course_doc_ref = doc(db, 'courses', course);
                const course_snapshot = await getDoc(course_doc_ref);
            
                if (course_snapshot.exists() && !course_snapshot.empty) {
                    let temp = course_snapshot.data();
                    if ( temp && temp !== undefined ) {
                        response.body.push(temp);
                    }
                }
            }

            return response;

        } catch ( error ) {
            console.error('error retrieving user courses: ', error);
            return ( { status: 500 , body: 'Server unable to retrieve user courses' } );
        }
    }

    static async GET_user_notifications ( id ) {
        try {
            const notificationsCollectionRef = collection(db, 'users', id, 'notifications');
    
            const querySnapshot = await getDocs(notificationsCollectionRef);

            let notifications = [];
    
            querySnapshot.forEach((doc) => {
                const notificationData = doc.data();
                notifications.push(notificationData);
            });

            return notifications;
        } catch (error) {
            console.error('Error retrieving user notifications:', error);
            return null;
        }    
    }

    static async GET_user_allotlogs ( id ) {
        try {

            let response = { status:200, body: [] };

            //create pt log ref
            const ptlog_ref = collection ( db , 'allotpointlogs' );

            let q = null;

            const role = await User.GET_user_role ( id );

            if ( role === 'staff' ) {
                q = query ( ptlog_ref, where ( 'staff_id', '==', id ) );
            }

            if ( role === 'admin' ) {
                q = query ( ptlog_ref, where ( 'admin_id', '==', id ) );
            }

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

    static async signup_new_user(email, password, id) {
        try {
            // Create a reference to the user document
            const user_doc_ref = doc(db, 'users', id);
            const user_snapshot = await getDoc(user_doc_ref);
    
            // If the user document doesn't exist, return false
            if (!user_snapshot.exists()) {
                return false;
            }
    
            const user_data = user_snapshot.data();
    
            // Check if the provided email and ID match the data in Firestore
            if (email !== user_data.email || id !== user_data.id) {
                return false;
            }
    
            // Create the user in Firebase Authentication
            const user_credential = await createUserWithEmailAndPassword(auth, email, password);
            const new_uid = user_credential.user.uid;
    
            // Check if the UID is successfully obtained
            if (!new_uid) {
                console.error('Server unable to authenticate UID to user');
                return false;
            }
    
            // Update the Firestore document with the new UID
            await updateDoc(user_doc_ref, { uid: new_uid });
    
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
    
}