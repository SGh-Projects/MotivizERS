import User from "./User";
import Course from "./Course";
import PointLog from "./PointLog";
import Leaderboard from "./Leaderboard";
import { unionize_objects } from "./Util";
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';

import { db,auth } from "../firebase";
import { addDoc, setDoc, collection, doc, updateDoc, getDoc, writeBatch, runTransaction, deleteDoc, query, where, getDocs } from "firebase/firestore";
import { get_course_by_id, get_course_top_earner } from "../controllers/Course";
import { get_student_rank } from "../controllers/Student";
import Notification from "./Notification";

export default class Staff extends User{
    constructor(id, first_name, last_name, email, desc, img_url) {
        super(id, first_name, last_name, email, desc, img_url, 'staff');

        this.id = id;
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.desc = desc;
        this.img_url = img_url;
        this.role = 'staff';  // Define role directly
    
     
        //super(id, first_name, last_name, email, desc, img_url, 'staff');
    }
    //HELPER FUNCTIONS
    async create() {
        try {
            const batch = writeBatch(db);
            const staffDocRef = doc(db, 'users', this.id);

            batch.set(staffDocRef, {
                ...this,  // Spread operator to include all properties of the staff instance
            current_pts: 300, 
            });

            // Optional: Initialize subcollections if needed
            batch.set(doc(collection(staffDocRef, 'notifications'), 'initial'), {});
            batch.set(doc(collection(staffDocRef, 'pointlogs'), 'initial'), {});
            batch.set(doc(collection(staffDocRef, 'allotpointlogs'), 'initial'), {});
            batch.set(doc(collection(staffDocRef, 'courses'), 'initial'), {});
    
            await batch.commit();
            return true;
        } catch (error) {
            console.error('Error adding staff to users:', error);
            return false;
        }
    }

    //if a user has staff role
    //returns true if user role is staff false otherwise
    static async is_staff ( id ) {
        try {
            //create user doc ref
            const doc_ref = doc ( db, 'users', id);

            //get the doc
            const doc_snapshot = await getDoc ( doc_ref );

            //if the doc exists
            if ( doc_snapshot.exists() ) {
                const data = doc_snapshot.data();

                return ( data.role === 'staff' )
            }

            console.error ( `user doc does not exist for staff ID: ${id}`, error );
            return false;

        } catch ( error ) {
            console.error ( 'error checking if user is a staff: ', error );
            return false;
        }
    }

    //SERVICES
    //POST staff
    static async POST_staff({ id, first_name, last_name, email, password, desc, img_url }) {
        const auth = getAuth();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;
            const staff = new Staff(id, first_name, last_name, email, desc, img_url);

            const batch = writeBatch(db);
            const userDocRef = doc(db, 'users', id);

            batch.set(userDocRef, {
                ...staff,
                current_pts: 300,
                uid: uid  // Ensure the UID is included if necessary
            });
    
            // Initialize empty documents in subcollections
            batch.set(doc(collection(userDocRef, 'notifications'), 'initial'), {});
            batch.set(doc(collection(userDocRef, 'pointlogs'), 'initial'), {});
            batch.set(doc(collection(userDocRef, 'allotpointlogs'), 'initial'), {});
            batch.set(doc(collection(userDocRef, 'courses'), 'initial'), {});
    

            // Optionally set up subcollections or other documents as part of the initial setup
            await batch.commit();
            return { success: true, message: 'Staff successfully created', id: id };
        } catch (error) {
            console.error('Error in creating staff:', error);
            return { success: false, message: error.message };
        }
    }

    //GET staff
    //gets a staff data based on id returns data on success
    static async GET_staff(id) {
        try {
            const docRef = doc(db, 'users', id);
            const docSnapshot = await getDoc(docRef);
            if (!docSnapshot.exists()) {
                console.error('User document does not exist for ID:', id);
                return { status: 404, body: 'Staff not found' };
            }
    
            const userData = docSnapshot.data();
            if (userData.role !== 'staff') {
                return { status: 401, body: 'Unauthorized access: User is not staff' };
            }
    
            return { status: 200, body: userData };
        } catch (error) {
            console.error('Error retrieving staff:', error);
            return { status: 500, body: 'Server unable to find staff' };
        }
    }

    //GET staff
    //gets all staff data 
    static async GET_staff_ALL() {
        try {
            const collectionRef = collection(db, 'users');
            const q = query(collectionRef, where('role', '==', 'staff'));
            const querySnapshot = await getDocs(q);
    
            if (querySnapshot.empty) {
                return { status: 404, body: 'No staff found' };
            }
    
            let staff = [];
            querySnapshot.forEach(doc => {
                const data = doc.data();
                const fullName = `${data.first_name} ${data.last_name} (${doc.id})`; // Format similar to students
                staff.push({...data, name: fullName, id: doc.id}); // Ensure 'id' is part of the returned data
            });
    
            return { status: 200, body: staff };
        } catch (error) {
            console.error('Error retrieving all staff:', error);
            return { status: 500, body: 'Server unable to retrieve staff' };
        }
    }
    


    static async GET_staff_top_earners ( id ) {
        try {

            let response = { status: 200, body: [] };

            const staff_ref = doc ( db, 'users', id );
            const staff_courses = collection ( staff_ref, 'courses' );

            let courseIDs = [];
            let students = [];

            //get all course docs from staff
            const query_snapshot = await getDocs ( staff_courses );

            for (const doc of query_snapshot.docs) {
                if (doc && doc.exists && !doc.empty) {
                    let temp = doc.data();
                    if ( temp && temp.course_id !== undefined ) {
                        courseIDs.push(temp.course_id);
                    }
                }
            }

            for ( const id of courseIDs ) { 
                try{ 
                    let course = await get_course_by_id(id);
                    let topEarner = await get_course_top_earner(id);
                    let rank = await get_student_rank(topEarner.id);
                    
                    // Attach the course ID to the top earner object
                    topEarner.course_code = course.body.code;
                    topEarner.course_name = course.body.name;
                    topEarner.course_id = id;
                    topEarner.rank = rank;
                    students.push(topEarner);
                }
                catch(error){
                    console.error(`Error fetching top earner for course ${id} :`, error);
                }
            } 
            
            response.body = unionize_objects ( students );

            return response;

        } catch ( error ) {
            console.error('error retrieving all top earners: ', error);
            return ( { status: 500 , body: 'Server unable to retrieve top earners' } );
        }
    }

    static async POST_staff_award_points(staff_id, student_id, points, reason, comments) {
        try {
            
            const response = await runTransaction(db, async (transaction) => {
                // Get staff data
                const staff_ref = doc(db, 'users', staff_id);
                const staff_snapshot = await transaction.get(staff_ref);
    
                if (!staff_snapshot.exists() || staff_snapshot.empty) {
                    return { status: 400, body: 'Staff not found' };
                }
    
                const staff_data = staff_snapshot.data();
    
                // Check if staff has enough points and is staff
                if ( ( Number(staff_data.current_pts) < Number(points) ) || staff_data.role !== 'staff') {
                    return { status: 400, body: 'Not Enough Points to Award' };
                }
    
                // Get student data
                const student_ref = doc(db, 'users', student_id);
                const student_snapshot = await transaction.get(student_ref);
    
                if (!student_snapshot.exists() || student_snapshot.empty) {
                    return { status: 400, body: 'Student not found' };
                }
    
                const student_data = student_snapshot.data();
    
                // Create new instance of point log
                const ptlog_ref = collection(db, 'pointlogs'); // Reference to point logs collection
                const ptlog_doc_ref = doc(ptlog_ref); // Reference to a new document within the collection
                const ptlog = new PointLog(staff_id, student_id, points, reason, comments);

                let description = `You have been awarded ${points} points for ${reason}.`;
                if (comments) {
                description += `\nComments: ${comments}`;
                }
                //create new instance of notification
                const noti_ref = collection(db, 'users', student_id, 'notifications')
                const noti_doc_ref = doc(noti_ref)
                const noti = new Notification(null, staff_id, student_id, 'Points Awarded', description);
                
                // Set data to point log document
                transaction.set(ptlog_doc_ref, { ...ptlog });

                // Add notification to user
                transaction.set(noti_doc_ref, { ...noti, uid: noti_doc_ref.id });
    
                // Update staff points
                transaction.update(staff_ref, { current_pts: ( Number ( staff_data.current_pts) - Number ( points ) ) });
    
                // Update student points
                transaction.update(student_ref, {
                    current_pts: ( Number (student_data.current_pts || 0) + Number (points) ),
                    accumulated_pts: ( Number (student_data.accumulated_pts || 0) + Number ( points ) )
                });
    
                return { status: 200, body: 'Points awarded successfully' };
            });
    
            return response;
        } catch (error) {
            console.error('Error awarding points:', error);
            return { status: 500, body: 'Server unable to award points' };
        }
    }
    
    static async GET_staff_pointlogs ( id ) {
        try {

            let response = { status:200, body: [] };

            //create pt log ref
            const ptlog_ref = collection ( db , 'pointlogs' );
            const q = query ( ptlog_ref, where ( 'staff_id', '==', id ) );
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