import User from "./User";
import AllotLog from "./AllotLog";
import Notification from "./Notification";

import { db } from "../firebase";
import { addDoc, setDoc, collection, doc, updateDoc, getDoc, writeBatch, runTransaction, deleteDoc, getDocs, query, where } from "firebase/firestore";
import Course from "./Course";



export default class Admin extends User {
    constructor(
        //params from User
        id = null,
        first_name = null,
        last_name = null,
        email = null,
        desc = null,
        img_url = null,

    ) {
        super( id, first_name, last_name, email, desc, img_url, 'admin' );
    }

    //HELPER FUNCTIONS
    async create() {
        const batch = writeBatch(db);
        const docRef = doc(db, 'users', this.id);

        // Set the user data along with 'role' as 'admin'
        batch.set(docRef, {
            ...this,
            role: 'admin'  // Make sure the admin role is explicitly set
        });

        // Optional: Initialize any necessary subcollections
        const notificationsRef = doc(db, 'users', this.id, 'notifications', 'default');
        batch.set(notificationsRef, {});

        // Commit the batch write
        await batch.commit();
        return true;
    }


    //if a user has staff role
    //returns true if user role is staff false otherwise
    static async is_admin ( id ) {
        try {
            //create user doc ref
            const doc_ref = doc ( db, 'users', id);

            //get the doc
            const doc_snapshot = await getDoc ( doc_ref );

            //if the doc exists
            if ( doc_snapshot.exists() ) {
                const data = doc_snapshot.data();

                return ( data.role === 'admin' )
            }

            console.error ( `user doc does not exist for admin ID: ${id}`, error );
            return false;

        } catch ( error ) {
            console.error ( 'error checking if user is a admin: ', error );
            return false;
        }
    }

    //SERVICES
    //POST admin
    //creates a admin user and returns true on success, false otherwise
    static async POST_admin(id, first_name, last_name, email, password, desc, img_url) {
        try {
            await runTransaction(db, async (transaction) => {
                const admin = new Admin(id, first_name, last_name, email, desc, img_url);
                const userDocRef = doc(db, 'users', id);

                const docSnapshot = await transaction.get(userDocRef);
                if (docSnapshot.exists()) {
                    throw new Error('Admin already exists');
                }

                // Set the admin details in the transaction
                transaction.set(userDocRef, {
                    ...admin,
                    password,  // Storing password directly is not recommended; handle authentication securely
                });

                // Optionally add additional transaction actions if needed
            });

            return { status: 200, message: 'Admin successfully created' };
        } catch (error) {
            console.error('Error creating admin:', error);
            return { status: 500, message: error.message || 'Failed to create admin' };
        }
    }


    //GET admin
    //gets a staff data based on id returns data on success
    static async GET_admin ( id ) {
        try {

            //response successful body for client
            let response = {status: 200, body: null }

            //create user doc ref
            const doc_ref = doc ( db, 'users', id);

            //get the doc
            const doc_snapshot = await getDoc ( doc_ref );

            //if the doc exists and is not empty
            if ( !doc_snapshot.exists() || doc_snapshot.empty ) {
                console.error ( 'user doc does not exist or is empty for staff');
                
                //return response to client
                return ( { status: 404 , body: 'Student not found' } );
            }

            response.body = doc_snapshot.data();

            if ( await this.is_admin (response.body.id) ) {
                return ( response );
            }
            
            return ( { status: 404 , body: 'Student not found' } );

        } catch ( error ) {
            return ( { status: 500 , body: 'Server unable to find staff' } );
        }
    }

    //GET admin
    //gets all staff data 
    static async GET_admin_ALL () {
        try {

            //response successful body for client
            let response = {status: 200, body: [] }

            const collection_ref = collection(db, 'users');
            const q = query(collection_ref, where('role', '==', 'admin'));
    
            const query_snapshot = await getDocs(q);
    
            if (query_snapshot.empty) {
                return ( { status: 404 , body: 'Staff not found' } );
            }
            
            query_snapshot.forEach(doc => {
                response.body.push(doc.data());
            });
    
            return response;

        } catch (error) {
            console.error('error retrieving all admin: ', error);
            return ( { status: 500 , body: 'Server unable to retrieve admin' } );
        }
    }

    static async POST_admin_allot_points ( staff_id, admin_id, points ) { 
        try {
            const response = await runTransaction(db, async (transaction) => {
                //get admin data verify admin
                //get staff data
                //create allot entry
                //update staff points

                //get admin data
                const admin_ref = doc ( db, 'users', admin_id );
                const admin_doc_snapshot = await transaction.get ( admin_ref );
                const admin_data = admin_doc_snapshot.data();

                //verify admin
                if ( admin_data.role !== 'admin' ){
                    return { status: 401, body: 'Unauthorized' };
                }

                //get staff data
                const staff_ref = doc ( db, 'users', staff_id);
                const staff_doc_snapshot = await transaction.get ( staff_ref );
                const staff_data = staff_doc_snapshot.data();

                //verify staff
                if ( staff_data.role !== 'staff' ){
                    return { status: 401, body: 'Unauthorized target' };
                }

                 //create new instance of notification
                 const noti_ref = collection(db, 'users', staff_id, 'notifications')
                 const noti_doc_ref = doc(noti_ref)
                 const noti = new Notification(null, admin_id, staff_id, 'Points Allotted', `You have been allotted an additional ${points} points`)
                 // Add notification to user
                transaction.set(noti_doc_ref, { ...noti, uid: noti_doc_ref.id });

                //create allot instance
                const allot = new AllotLog ( points, staff_id, admin_id );

                //enter in firestore
                const allot_coll_ref = collection ( db, 'allotpointlogs');
                const allot_doc_ref = await addDoc(allot_coll_ref, { ...allot });
                transaction.update ( allot_doc_ref, { id: allot_doc_ref.id } );
                
                //update staff
                transaction.update ( staff_ref , { current_pts: ( Number ( staff_data.current_pts ) + Number ( points ) ) } );
                
                return { status: 200, body: 'Points allotted successfully' };
            }); 
            return response || { status: 500, body: 'Server unable to retrieve allotment' };

        } catch ( error ) {
            console.error('error retrieving allotment: ', error);
            return ( { status: 500 , body: 'Server unable to retrieve allotment' } );
        }
    }

    //requires role
    static async add_user_to_sys(id, first_name, last_name, email, desc, img_url, role){
        try{
            const user = new User( id, first_name, last_name, email, desc, img_url, role );

                //check to see if the email and id supplied are available
                const email_available = await user.email_available ();
                const id_available = await user.id_available (); 

                if ( !email_available || !id_available ) {
                    console.error ( 'id or email unavailable' );
                    
                    //return response to client
                    return ( { status: 500 , body: 'ID or email unavailable' } );
                }
                
                const response = await user.create(); 
                
                return { status: 200, body: 'Account created successfully' };

        }catch(error){
            return ( { status: 500 , body: 'Server unable to create user' } );
        }
    }

    static async csv_users(arr){
        try {
            //create ref to users
            const userCollRef = collection(db, 'users');

            // Iterate over each object in the array
            for (const obj of arr) {
                if (obj.role === 'student'){
                    const user_doc_ref = doc(db, 'users', obj.id);

                    const batch = writeBatch(db);
    
                    // Add to the Users collection within the batch, including all initial points
                    batch.set(user_doc_ref, {
                        id: obj.id,
                        first_name: obj.first_name,
                        last_name: obj.last_name,
                        img_url: obj.img_url,
                        uid: null,
                        email: obj.email,

                        role: obj.role,
                        desc: obj.desc,

                        current_pts: 0,
                        spent_pts: 0,
                        accumulated_pts: 0,  // Ensure initial points are set to 0
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

                    //add a referecne in the leaderboard
                    const leaderboard_doc_ref = doc(db, 'leaderboard', obj.id);
                    batch.set(leaderboard_doc_ref, {
                        id: obj.id,
                        rank: Number.MAX_SAFE_INTEGER
                    });

            
                    // Commit the batch
                    await batch.commit();
                }

                if (obj.role === 'staff'){
                    const user_doc_ref = doc(db, 'users', obj.id);

                    const batch = writeBatch(db);
    
                    // Add to the Users collection within the batch, including all initial points
                    batch.set(user_doc_ref, {
                        id: obj.id,
                        first_name: obj.first_name,
                        last_name: obj.last_name,
                        img_url: obj.img_url,
                        uid: null,
                        email: obj.email,

                        role: obj.role,
                        desc: obj.desc,

                        current_pts: 300,
                        spent_pts: 0,
                    });

                    batch.set(doc(collection(user_doc_ref, 'notifications'), 'initial'), {});
                    batch.set(doc(collection(user_doc_ref, 'pointlogs'), 'initial'), {});
                    batch.set(doc(collection(user_doc_ref, 'allotpointlogs'), 'initial'), {});
                    batch.set(doc(collection(user_doc_ref, 'courses'), 'initial'), {});

                    await batch.commit();
                    return true;
                }

                if (obj.role === 'admin'){
                    const user_doc_ref = doc(db, 'users', obj.id);

                    const batch = writeBatch(db);
    
                    // Add to the Users collection within the batch, including all initial points
                    batch.set(user_doc_ref, {
                        id: obj.id,
                        first_name: obj.first_name,
                        last_name: obj.last_name,
                        img_url: obj.img_url,
                        uid: null,
                        email: obj.email,

                        role: obj.role,
                        desc: obj.desc,
                    });

                    batch.set(doc(collection(user_doc_ref, 'notifications'), 'initial'), {});
                    batch.set(doc(collection(user_doc_ref, 'pointlogs'), 'initial'), {});
                    batch.set(doc(collection(user_doc_ref, 'allotpointlogs'), 'initial'), {});

                    await batch.commit();
                    return true;
                }
            }

            return true;

        } catch (error) {
            console.error('Error handling array of objects:', error);
        }
    }

    static async csv_course (arr){
        //create ref to courses
        try{
            for (const obj of arr){
                let response = await Course.POST_course(obj.code, obj.period, obj.name, obj.desc, obj.year, obj.semester, obj.img_url);
            }

            return true;
        }catch(error){
            throw new Error ("Error creating courses via csv");
        }
    }

    static async csv_enroll (arr){
        //create ref to courses
        try{
            for (const obj of arr){
                console.log('user id ', obj.user_id);
                console.log('course id ', obj.course_id);
                let response = await Course.POST_course_register(obj.user_id, obj.course_id);
            }

            return true;
        }catch(error){
            throw new Error ("Error creating courses via csv");
        }
    }
}