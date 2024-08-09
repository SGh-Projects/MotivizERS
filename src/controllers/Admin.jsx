import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { collection, doc, setDoc, getDoc, getDocs, query, where, deleteDoc, updateDoc, arrayUnion, QuerySnapshot, addDoc } from 'firebase/firestore';
import Admin from "../models/Admin";


export const allot_points_to_staff = async (staffID, adminID, points) =>{
    try {
        const response = await Admin.POST_admin_allot_points(staffID, adminID, points) 
        return response;
    } catch (error) {
        console.error('Error in getting student redeem logs :', error);
        throw error;
    }
}

export const admin_add_user_to_sys= async(id, first_name, last_name, email, desc, img_url, role) =>{
    try{
        const response = await Admin.add_user_to_sys(id, first_name, last_name, email, desc, img_url, role) 
        return response;
    }catch(error){
        throw(error)
    }
}
export const create_admin = async (adminData) => {
    if (!adminData.email || !adminData.password || !adminData.first_name || !adminData.last_name || !adminData.id) {
        throw new Error('All required fields must be filled.');
    }


    const auth = getAuth();
    try {
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, adminData.email, adminData.password);
        const uid = userCredential.user.uid;  // UID assigned by Firebase Authentication

        // Proceed to save this new admin's other details in Firestore using the UID
        const response = await Admin.POST_admin(
            uid,  // Use Firebase Auth UID instead of manually supplied ID
            adminData.first_name,
            adminData.last_name,
            adminData.email,
            adminData.desc,
            adminData.img_url
        );

        if (response.status === 200) {
            console.log('Admin created successfully:', response.body);
            return { success: true, message: 'Admin created successfully' };
        } else {
            console.error('Failed to create admin:', response.body);
            return { success: false, message: response.body };
        }
    } catch (error) {
        console.error('Error creating admin:', error);
        return { success: false, message: error.message || 'An unexpected error occurred while adding the admin' };
    }
}
