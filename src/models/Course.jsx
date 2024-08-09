import { db } from "../firebase";
import { addDoc, setDoc, collection, doc, updateDoc, getDoc, writeBatch, runTransaction, deleteDoc, query, where, getDocs } from "firebase/firestore";


export default class Course {
    constructor (
        code = null,
        period = null,
        name = null,
        desc = null,
        year = null,
        semester = null,
        img_url = null,
    ){
        this.id = `${code}-${period}`;
        this.period = `${year}-${semester}`;
        this.code = code;
        this.name = name;
        this.desc = desc;
        this.year = year;
        this.semester= semester;
        this.img_url = img_url
    }

    //SERVICES
    //POST course
    //creates a course
    static async POST_course ( code, period, name, desc, year, semester, img_url ) {
        try {
            //create course instance
            const course = new Course ( code, period, name, desc, year, semester, img_url );

            //create batch op
            const batch = writeBatch ( db );

            //create course collection ref 
            const doc_ref = doc ( db, 'courses', course.id );

            //add the doc
            batch.set ( doc_ref, { ...course } );
            
            //init subcollection and batch add
            const students_coll = collection ( doc_ref, 'students' );
            const students_doc_ref = doc ( students_coll );
            batch.set ( students_doc_ref, {} ); 

            const lecturers_coll = collection ( doc_ref, 'staff' );
            const lecturers_doc_ref = doc ( lecturers_coll ); 
            batch.set ( lecturers_doc_ref, {} ); 


            await batch.commit();

            return ( { status: 200 , body: 'Course successfully created' } );

        } catch ( error ) {
            return ( { status: 500 , body: 'Server unable to create course' } );
        }
    }

    //GET course
    //returns course details based on a course id
    static async GET_course ( id ) {
        try {

            //response successful body for client
            let response = {status: 200, body: null }

            //create course doc ref
            const doc_ref = doc ( db, 'courses', id);

            //get the doc
            const doc_snapshot = await getDoc ( doc_ref );

            //if the doc exists and is not empty
            if ( !doc_snapshot.exists() ) {
                console.error ( 'course doc does not exist or is empty for course');
                
                //return response to client
                return ( { status: 404 , body: 'Course not found' } );
            }

            else response.body = doc_snapshot.data();

            return ( response );

        } catch ( error ) {
            console.log(error);
            return ( { status: 500 , body: 'Server unable to find course' } );
        }
    }

    static async GET_courses() {
        try {
            const prize_collection_ref = collection(db, 'courses');
            const q = query(prize_collection_ref);
            const query_snapshot = await getDocs(q);
    
            let response = { status: 200, body: [] }; // Default to status 200
    
            if (query_snapshot.empty) {
                response.status = 404;
                response.body = 'No courses found';
                return response;
            }
    
            query_snapshot.forEach(doc => {
                response.body.push({...doc.data(), id: doc.id}); // Include document ID if necessary
            });
    
            return response;
    
        } catch (error) {
            console.error('Error retrieving all courses:', error);
            return { status: 500, body: 'Server unable to retrieve courses' };
        }
    }
    
    //UPDATE course
    //updates a course specified by id
    static async UPDATE_course (
        id = null,
        code = null,
        period = null,
        name = null,
        desc = null,
        year = null,
        semester = null,
        img_url = null,
    ) {
        try {
            if ( ( !id ) ){ 
                console.error ( 'course with id not found ');
                return ( { status:404, body:`Course with ID ${id} not found.`} )
            }
    
            const doc_ref = doc ( db, 'courses', id);
    
            await runTransaction ( db, async ( transaction ) => {
                //retrieve doc
                const doc_snapshot = await transaction.get(doc_ref);
                
                //check if doc is empty
                if ( doc_snapshot.empty ) { 
                    return ( { status:404, body:`Course with ID ${id} not found.`} )
                }
                
                //create object to hold fields to update
                let fields_to_update = {};
    
                //update individual fields if provided
                if ( code ) fields_to_update.code = code;
                if ( period ) fields_to_update.period =  `${year}-${semester}`;
                if ( name ) fields_to_update.name = name;
                if ( desc ) fields_to_update.desc = desc;
                if ( year ) fields_to_update.year = year;
                if ( semester ) fields_to_update.semester = semester;
                if ( img_url ) fields_to_update.img_url = img_url;
    
                //update doc
                transaction.update ( doc_ref, fields_to_update );
            });

            return ( { status:200, body:`Course with ID ${id} successfully updated.`} );

        }  catch ( error ) {
            console.error ( 'error updating course', error );
            return ( { status:200, body:`Server error updating user with ID ${id}.`} );            
        }
    }

    //DELETE course
    static async DELETE_course ( id ) {
        try {

            //create the ref to the document
            const doc_ref = doc ( db, 'courses', id )

            const doc_snapshot = await getDoc ( doc_ref );
                
            if ( !doc_snapshot.exists() ) {
                console.error ( 'course doc does not exist');
                return ( { status:404, body:`Course with ID ${id} not found.`} )
            } 
            
            await deleteDoc ( doc_ref );

            return ( { status:200, body:`Course with ID ${id} successfully deleted.`} );

        } catch ( error ) {
            console.error ( 'error deleting student doc', error );
            return ( { status:200, body:`Server error deleting course with ID ${id}.`} );
        }
    }

    //POST course student
    //adds a user to a course and keeps course ref in user
    static async POST_course_register(user_id, course_id) {
        try {
            const response = await runTransaction(db, async (transaction) => {
                const userDocRef = doc(db, 'users', user_id);
                const userSnapshot = await transaction.get(userDocRef);
                if (!userSnapshot.exists()) {
                    throw new Error('User not found');
                }
    
                const courseDocRef = doc(db, 'courses', course_id);
                const courseSnapshot = await transaction.get(courseDocRef);
                if (!courseSnapshot.exists()) {
                    throw new Error('Course not found');
                }
    
                const userData = userSnapshot.data();
                if (userData.role !== 'student' && userData.role !== 'staff') {
                    throw new Error('User not authorized');
                }
    
                transaction.set(doc(collection(userDocRef, 'courses'), course_id), { course_id: course_id });
                transaction.set(doc(collection(courseDocRef, userData.role + 's'), user_id), { user_id: user_id });
    
                return 'Enrollment successful';
            });
    
            return { status: 200, body: response };
        } catch (error) {
            console.error('Error enrolling user:', error);
            return { status: 500, body: error.message };
        }
    }
    
    
    static async DELETE_course_deregister ( user_id, course_id ) {
        try {

            const response = await runTransaction ( db , async (transaction) => {

                //create a ref to the user
                const user_doc_ref = doc ( db, 'users', user_id );
                const user_doc_course_ref = collection ( user_doc_ref, 'courses' );
                const user_course_ref = doc ( user_doc_course_ref, course_id);

                //check if course exists in user
                const user_course_snapshot = await getDoc ( user_course_ref );

                if ( !user_course_snapshot.exists() ){
                    return ( { status: 404 , body: 'Course not found in student' } );
                }

                //delete the doc
                transaction.delete ( user_course_ref );

                //check if user staff or student
                const user_doc_snapshot = await getDoc ( user_doc_ref );
                const user_data = user_doc_snapshot.data();
                
                //create a ref to the course
                const course_doc_ref = doc ( db, 'courses', course_id);

                //select appropriate subcoll based on role
                if ( user_data.role === 'student' ){
                    //create ref to student subcoll
                    const course_doc_students_ref = collection ( course_doc_ref, 'students' );
                    const course_user_ref = doc ( course_doc_students_ref, user_id );

                    //check if user exists in course
                    const course_user_snapshot = await getDoc ( course_user_ref );

                    if ( !course_user_snapshot.exists() ){
                        return ( { status: 404 , body: 'Student not found in course' } );
                    }

                    transaction.delete ( course_user_ref );
                }

                if ( user_data.role === 'staff' ){
                    //create ref to student subcoll
                    const course_doc_students_ref = collection ( course_doc_ref, 'staff' );
                    const course_user_ref = doc ( course_doc_students_ref, user_id );

                    //check if user exists in course
                    const course_user_snapshot = await getDoc ( course_user_ref );

                    if ( !course_user_snapshot.exists() ){
                        return ( { status: 404 , body: 'Staff not found in course' } );
                    }

                    transaction.delete ( course_user_ref );
                }
                
                return ( { status: 200 , body: 'Successfully deleted user' } );
            });

            return response;

        } catch ( error ) {
            console.error('error enrolling user: ', error);
            return ( { status: 500 , body: 'Server unable to deregister user' } );
        }
    }

    static async GET_course_students ( id ) {
        try {
            let response = { status: 200, body: [] };

            //get all the ids from the course
            const course_ref = doc ( db, 'courses', id );
            const users_ref = collection ( course_ref, 'students' );
            
            let users = [];

            //get all docs from the subcollection
            const query_snapshot = await getDocs ( users_ref );

            for (const doc of query_snapshot.docs) {
                if (doc && doc.exists && !doc.empty) {
                    let temp = doc.data();
                    if ( temp && temp.id !== undefined ) {
                        users.push(temp.id);
                    }
                }
            }          

            //console.log(users);
            for (const user of users) {
                const user_doc_ref = doc(db, 'users', user);
                const user_snapshot = await getDoc(user_doc_ref);
            
                if (user_snapshot.exists() && !user_snapshot.empty) {
                    let temp = user_snapshot.data();
                    if ( temp && temp !== undefined ) {
                        response.body.push(temp);
                    }
                }
            }

            return response;

        } catch ( error ) {
            console.error('error retrieving course students: ', error);
            return ( { status: 500 , body: 'Server unable to retrieve course students' } );
        }
    }

    static async GET_course_staff ( id ) {
        try {
            let response = { status: 200, body: [] };

            //get all the ids from the course
            const course_ref = doc ( db, 'courses', id );
            const users_ref = collection ( course_ref, 'staff' );
            
            let users = [];

            //get all docs from the subcollection
            const query_snapshot = await getDocs ( users_ref );

            for ( const doc of query_snapshot.docs ) {
                if ( doc && doc.exists && !doc.empty ) {
                    let temp = doc.data();
                    if ( temp && temp.id !== undefined ) {
                        users.push( temp.id );
                    }
                }
            }          

            for (const user of users) {
                const user_doc_ref = doc(db, 'users', user);
                const user_snapshot = await getDoc(user_doc_ref);
            
                if (user_snapshot.exists() && !user_snapshot.empty) {
                    let temp = user_snapshot.data();
                    if ( temp && temp !== undefined ) {
                        response.body.push(temp);
                    }
                }
            }
            
            return response;

        } catch ( error ) {
            console.error('error retrieving course students: ', error);
            return ( { status: 500 , body: 'Server unable to retrieve course students' } );
        }
    }

    //sort not working    
    static async GET_course_leaderboard ( id ) {
        try {

            let students = await this.GET_course_students ( id) ;

            //sort array in desc order
            const leaderboard = students.sort((a, b) => b.accumulated_pts - a.accumulated_pts);

            return { status: 200, body: leaderboard };

        } catch ( error ) {
            console.error('error retrieving course leaderboard: ', error);
            return ( { status: 500 , body: 'Error retieving course leaderbaord' } );
        }
    }

    
}
