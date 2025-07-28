import { auth, db } from '../firebase'
import { collection, doc, setDoc, getDoc, getDocs, query, where, deleteDoc, updateDoc, arrayUnion, QuerySnapshot, addDoc } from 'firebase/firestore';
import { is_student, get_student_by_id } from './Student';
import { is_staff } from './Staff';
import Course from '../models/Course'
import User from '../models/User'

export const create_course = async (courseDetails) => {
    try {
        // Destructure the courseDetails object for clarity
        const { code, name, desc, year, semester, img_url } = courseDetails;

        // Validate the required fields
        if (!code || !name || !desc || !year || !semester) {
            throw new Error("Missing required course fields"); 
        }

        const period= `${year}-${semester}`

        // Call the model method to create a course
        const response = await Course.POST_course(code, period, name, desc, year, semester, img_url);

        if (response.status !== 200) {
            throw new Error(response.body);
        }

        console.log(response.body); // Log success message
        return response; // Return the response object for further handling if necessary
    } catch (error) {
        console.error('Error creating course:', error.message);
        throw error; // Propagate the error for handling in calling function
    }
};


export const get_course_by_id = async (id) => {
    const course= Course.GET_course(id)
    return course;
}


export const get_all_courses = async () => {
    try {
        const result = await Course.GET_courses(); 
        return result;
    } catch (error) {
        console.error('Error fetching courses:', error);
        throw error;
    }
}

export const search_courses = async (searchTerm) => {
    const response = await get_all_courses(); 
    const allCourses = response.body;

    const searchedCourses = allCourses.filter(course =>
        course.id.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
        course.name.toLowerCase().startsWith(searchTerm.toLowerCase())
    );

    return searchedCourses;
}

export const enroll = async (userID, courseID) => {
    const userDocRef = doc(db, 'users', userID);
    const courseDocRef = doc(db, 'courses', courseID);

    try {
        const [userSnapshot, courseSnapshot] = await Promise.all([
            getDoc(userDocRef),
            getDoc(courseDocRef)
        ]);

        if (!userSnapshot.exists()) {
            throw new Error('User not found');
        }
        if (!courseSnapshot.exists()) {
            throw new Error('Course not found');
        }

        const userData = userSnapshot.data();
        if (!userData.role || (userData.role !== 'student' && userData.role !== 'staff')) {
            throw new Error('User is not a student or staff');
        }

         // Check if the user is already enrolled in the course
         const userCoursesRef = collection(userDocRef, 'courses');
         const userCourseSnapshot = await getDoc(doc(userCoursesRef, courseID));
         if (userCourseSnapshot.exists()) {
             throw new Error('User already enrolled in this course');
         }
 
         await setDoc(doc(userCoursesRef, courseID), { course_id: courseID });

        const roleCollection = userData.role === 'student' ? 'students' : 'staff';
        await setDoc(doc(collection(courseDocRef, roleCollection), userID), { id: userID });

        console.log(`${userData.role} enrolled successfully in course ${courseID}`);
        return { success: true, message: `${userData.role} enrolled successfully in course ${courseID}` };
    } catch (error) {
        console.error('Error enrolling:', error);
        throw new Error(error.message);
    }
};

export const get_course_students = async (courseID) => {
    try {
        const result = await Course.GET_course_students(courseID)
        return result;
    } catch (error) {
        console.error('Error fetching user courses:', error);
        throw error;
    }
}

export const get_course_top_earner = async (courseID) => {
    try {
        // Fetch the course students
        const courseStudents = await get_course_students(courseID);

        // Sort the course students by accumulated points in descending order
        courseStudents.body.sort((a, b) => {
           const ptsA = parseFloat(a.accumulated_pts);
            const ptsB = parseFloat(b.accumulated_pts);
            return ptsB - ptsA;
        });
        // Return the top student 
        return courseStudents.body[0];
    } catch (error) {
        // Handle errors
        console.error('Error fetching top earner:', error);
        return null; // Return null in case of error
    }
};

export const get_user_courses = async (id) => { 
    try {
        const result = await User.GET_user_courses(id)
        return result;
    } catch (error) {
        console.error('Error fetching user courses:', error);
        throw error;
    }

}

export const get_course_lecturer = async (id) => {
    try {
        const result = await Course.GET_course_staff(id) 
        if(result){
            return result;
        }
    } catch (error) {
        console.error('Error fetching user courses:', error);
        throw error;
    }
}

export const edit_course = async (courseID, updatedCourse) => {
    try {
        // Extract fields from updatedCourse for clarity
        const { code, name, desc, year, semester, img_url } = updatedCourse;
        const period= `${year}-${semester}`
        // Call the model method to update a course
        const response = await Course.UPDATE_course(courseID, code, period, name, desc, year, semester, img_url);

        if (response.status !== 200) {
            throw new Error(response.body);
        }

        console.log(response.body); // Log success message
        return response; // Return the response object for further handling if necessary
    } catch (error) {
        console.error('Error updating course:', error.message);
        throw error; // Propagate the error for handling in calling function
    }
};

export const delete_course = async (courseID) => {
    const courseDocRef = doc(db, 'courses', courseID);
    try {
        await deleteDoc(courseDocRef);
        console.log('Course deleted successfully.');
        // Return true or some success indicator
        return true;
    } catch (error) {
        console.error('Error deleting course:', error);
        // You may choose to throw the error or return false or some error indicator
        throw error;
    }

    
};

export const csv_enroll = async (arr) => {
    try{
        for (const obj of arr){
            console.log('user id ', obj.user_id);
            console.log('course id ', obj.course_id);
            let response = await enroll(obj.user_id, obj.course_id);
        }

        return true;
    }catch(error){
        throw new Error ("Error creating courses via csv");
    }
}



