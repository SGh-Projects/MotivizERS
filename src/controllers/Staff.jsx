import { emailDoesntExist } from "./Auth"
import { db, auth } from "../firebase"
import {  getAuth, createUserWithEmailAndPassword, fetchSignInMethodsForEmail  } from 'firebase/auth';
import { addDoc, collection, doc, setDoc, query, where, getDocs,getFirestore } from 'firebase/firestore';
import Staff from '../models/Staff'
import Leaderboard from "../models/Leaderboard";


export const create_staff = async (staffData) => {
  try {
    const response = await Staff.POST_staff(staffData);
    if (!response.success) {
      throw new Error(response.message);

    }
    return response;  // Return success status and any other relevant info
  } catch (error) {
    console.error('Failed to create staff:', error);
    return { success: false, message: error.message };
  }
};

/*-----------------------------------------------------------
updated controllers */

export const get_staff_by_id = async (id) => {

    try {
        const staff = Staff.GET_staff(id)
        return staff;
        
    } catch (error) {
        console.error('Error getting documents:', error);
        throw error; // Rethrow the error to handle it outside of this function
    }
}

export const is_staff = async (staffID) => {
    const staff = await get_staff_by_id(staffID) 
    if (staff.status === 200){
        return true;
    }
    else {
        return false;
    }
}

export const get_all_staff =  async () =>{
    try {
        const result = await Staff.GET_staff_ALL();
        return result;
    } catch (error) {
        console.error('Error in getting staff :', error);
        throw error;
    }
}

export const awardPointsToStudent = async (staffId, studentId, points, reason, comments) => {
    try {
        
        // Call function with the provided parameters
        const response = await Staff.POST_staff_award_points(staffId, studentId, points, reason, comments);
        if(response.status === 200){
            //Update the LeaderBoard
            const success= await Leaderboard.UPDATE_leaderboard();
            console.log(success)
        }
        return response;
    } catch (error) {
        // Handle errors
        console.error('Error awarding points to student:', error);
        // Return an error response
        return { status: 500, body: 'Server unable to award points' };
    }
}

export const get_staff_assign_points_logs = async (id) =>{
    try {
        const result = await Staff.GET_staff_pointlogs(id) 
        return result;
    } catch (error) {
        console.error('Error in getting staff logs:', error);
        throw error;
    }
}

export const get_staff_points_breakdown = async (id) =>{
    try {
        const response = await get_staff_assign_points_logs(id);
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
        console.error('Error fetching lecturer point logs:', error);
      }
}

export const get_staff_pointlogs_by_type = async (id, type) =>{
    const typeMap = {
        'goodConduct': 'good conduct',
        'courseParticipation': 'course participation',
        'volunteering': 'volunteering',
        'extracurricular': 'extracurricular'
    };

    // Get the reason from the map
    const reason = typeMap[type];

    try {
        const response = await get_staff_assign_points_logs(id);
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

export const get_staff_top_earners = async (id) =>{
  try{
    const response = await Staff.GET_staff_top_earners(id);
    return response;

  }catch (error){
    console.log("Error fetching top earners")
  }
}