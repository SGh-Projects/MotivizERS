import { emailDoesntExist } from "./Auth"
import { db, auth } from "../firebase"
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, doc, setDoc, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import Leaderboard from "../models/Leaderboard";
import Student from '../models/Student'
import { get_students } from "./Student";


export const get_ranked_students = async () => {
    try {
        // get all students
        const allStudents = await get_students(); 
         
        // Array to store students with their ranks
        const studentsWithRank = [];

        // Loop through all students to fetch their ranks
        for (const student of allStudents.body) {
            // Call Leaderboard's GET_rank method to fetch rank for each student
            const rank = await Leaderboard.GET_rank(student.id);
            console.log(rank)
            
            // Push student with rank to the array
            studentsWithRank.push({ ...student, rank });
        }

        // Sort students by rank in ascending order
        studentsWithRank.sort((a, b) => a.rank - b.rank);

        return studentsWithRank;
    } catch (error) {
        console.error('Error getting students with rank:', error);
        return [];
    }
}

//realtime function
export const get_ranked_students_rt = (callback) => {
    try {
      // Get a reference to the users collection
      const usersCollection = collection(db, 'users');
  
      // Subscribe to changes in the users collection
      const unsubscribe = onSnapshot(query(usersCollection, where('role', '==', 'student')), async (snapshot) => {
        try {
          let allStudents = snapshot.docs.map(doc => doc.data());
  
          // Loop through all students to fetch their ranks
          let studentsWithRank = await Promise.all(allStudents.map(async student => {
            // Call Leaderboard's GET_rank method to fetch rank for each student
            const rank = await Leaderboard.GET_rank(student.id);
            return { ...student, rank };
          }));
  
          // Sort students by rank in ascending order
          studentsWithRank.sort((a, b) => a.rank - b.rank);
  
          // Ensure callback is a function before invoking
          if (typeof callback === 'function') {
            callback(studentsWithRank);
          } else {
            console.error('Callback is not a function');
          }
        } catch (error) {
          console.error('Error processing ranked students:', error);
        }
      });
  
      // Return the unsubscribe function in case you want to stop receiving updates
      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to ranked students:', error);
      return () => {};
    }
};  