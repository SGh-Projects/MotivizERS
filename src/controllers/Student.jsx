import { emailDoesntExist } from "./Auth"
import { db, auth } from "../firebase"
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, doc, setDoc, query, where, getDocs, writeBatch} from 'firebase/firestore';
import Leaderboard from "../models/Leaderboard";
import Student from '../models/Student'
import RedeemLog from "../models/RedeemLog";


//this is updated
export const create_student = async (student) => {
  if (!student.email || !student.password || !student.id) {
      throw new Error('Email, password, and student ID are required.');
  }

  try {
      // Create new user authentication
      const userCredential = await createUserWithEmailAndPassword(auth, student.email, student.password);
      student.uid = userCredential.user.uid; // Storing the new user's UID

      // Add role to the student object
      student.role = 'student';  // Automatically assign the role of "student"

      // Start a new batch write operation
      const batch = writeBatch(db);

      // Reference to the user's document in Firestore
      const userDocRef = doc(db, 'users', student.id);

      // Preparing the user data with Firestore document references
      batch.set(userDocRef, {
          ...student, 
          accumulated_pts: 0,
          current_pts: 0, 
      });

      const leaderboardDocRef = doc(db, 'leaderboard', student.id);

        // Initialize leaderboard data
        batch.set(leaderboardDocRef, {
            studentId: student.id,
            rank: null  // Start with zero points
        });

        // Initialize empty documents in subcollections
        batch.set(doc(collection(userDocRef, 'notifications'), 'initial'), {});
        batch.set(doc(collection(userDocRef, 'pointlogs'), 'initial'), {});
        batch.set(doc(collection(userDocRef, 'redeemlogs'), 'initial'), {});
        batch.set(doc(collection(userDocRef, 'courses'), 'initial'), {});

      // Commit the batch write to Firestore
      await batch.commit();
      console.log('Student added successfully with UID:', student.uid);
      return true;
  } catch (error) {
      console.error('Error in student registration:', error);
      throw new Error('Failed to register student: ' + error.message);
  }
};

/* -----------------------------------------------------------
UPDATED Controllers */
export const get_student_by_id = async (id) => {
    try {
        const response= await Student.GET_student(id)
        if (response) {
            const student= response.body
            return student;
        } else {
            console.log('No matching document found.');
            return null;
        }
    } catch (error) {
        console.error('Error getting documents:', error);
        throw error; // Rethrow the error to handle it outside of this function
    }
}

export const is_student = async (id) => {
    const student = await get_student_by_id(id); 
    if (student !== null){
        return true;
    }
    else {
        return false;
    }
}

export const get_students = async () =>{
    try {
        const result = await Student.GET_students();
        return result;
    } catch (error) {
        console.error('Error in getting students :', error);
        throw error;
    }
}

export const get_student_rank = async (id) =>{
    try{
        const result = await Leaderboard.GET_rank(id);
        return result;
    }catch (error){
        console.error('Error in getting student rank :', error);
        throw error;
    }
}

export const get_student_awarded_points_logs = async (id) =>{
    try {
        const result = await Student.GET_student_pointlogs(id) 
        return result;
    } catch (error) {
        console.error('Error in getting student logs :', error);
        throw error;
    }
}

export const get_student_redeem_logs = async (id) =>{
    try {
        const result = await RedeemLog.GET_student_redeemlogs(id)  
        return result;
    } catch (error) {
        console.error('Error in getting student redeem logs :', error);
        throw error;
    }
}


export const get_student_points_breakdown = async (id) =>{
    try {
        const response = await get_student_awarded_points_logs(id);
        if (response.status === 200) {
          const logs = response.body;

          if (logs && Array.isArray(logs)) {
            if (logs.length > 0) { 
              let pointsBreakdown = {
                goodConduct: 0,
                courseParticipation: 0,
                volunteering: 0,
                extracurricular: 0
              };
    
              logs.forEach(log => {
                if (log.reason === 'good conduct') {
                  pointsBreakdown.goodConduct += log.points;
                } else if (log.reason === 'course participation') {
                  pointsBreakdown.courseParticipation += log.points;
                } else if (log.reason === 'volunteering') {
                  pointsBreakdown.volunteering += log.points;
                } else if (log.reason === 'extracurricular') {
                  pointsBreakdown.extracurricular += log.points;
                }
              });
     
              return pointsBreakdown;
            }
          }
        } else {
          console.log('No Logs found.');
        }
      } catch (error) {
        // Handle error
        console.error('Error fetching awarded points breakdown:', error);
      }
}

export const get_student_pointlogs_by_type = async (id, type) =>{
    const typeMap = {
        'goodConduct': 'good conduct',
        'courseParticipation': 'course participation',
        'volunteering': 'volunteering',
        'extracurricular': 'extracurricular'
    };

    // Get the reason from the map
    const reason = typeMap[type];

    try {
        const response = await get_student_awarded_points_logs(id);
        if (response.status === 200) {
          const logs = response.body;
          if (logs && Array.isArray(logs)) {
            if (logs.length > 0) {
                const filteredLogs = logs.filter(log => log.reason === reason); 
                return filteredLogs;
            }
          }
        } else {
            console.log('No Logs found.');
            // Return an empty array if no logs were found
            return [];
        }
      } catch (error) {
        // Handle error
        console.error('Error fetching lecturer point logs:', error);
      }
}