import { fetchSignInMethodsForEmail, signInWithEmailAndPassword, signOut, onAuthStateChanged  } from "firebase/auth";
import User from '../models/User'
import { auth, db } from '../firebase'
import { getAuth } from 'firebase/auth'
import { addDoc, updateDoc, doc, setDoc, query, where, getDocs, } from 'firebase/firestore';


//check if an email already exists
export const emailDoesntExist = async (email) => {
    try{
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);

        return signInMethods.length > 0;
    } catch (error) {
        console.error("Error checking email existence: ", error);
        throw error;
    }
};

// Update user
export const update_user = async (id, updates) => {
  if (!id) {
    console.error('User ID not provided');
    return { status: 400, body: "User ID is required." };
  }

  const docRef = doc(db, "users", id);

  try {
    await updateDoc(docRef, updates);
    return { status: 200, body: `User with ID ${id} successfully updated.` };
  } catch (error) {
    console.error('Error updating user:', error);
    return { status: 500, body: `Failed to update user: ${error.message}` };
  }
};

export const login = async (email, password) => {

    try {
        // Sign in the user with email and password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Get the user from the userCredential
        const user = userCredential.user;

        // Get the authentication token for the user
        const authToken = await user.getIdToken();

        // Save the authentication token to localStorage
        localStorage.setItem('authToken', authToken);

        // Set the authentication token in Firestore settings to be included in subsequent requests
        //db.settings({
        //    headers: {
        //        Authorization: `Bearer ${authToken}`
        //    }
        //});
 
        return true;
        
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
}

export const logout = async() => {
    try{
        await signOut (auth);
        //clear auth token
        localStorage.removeItem('authToken');
    } catch (error){
        console.error('logout failed', error);
    }
}

export const get_user_by_uid = async(uid)=>{
    try {
        const user = await User.get_by_uid(uid);
        return user;
      } catch (error) {
        console.error('Error getting user by UID in controller:', error);
        throw error;
      }
}

export const get_user_by_id = async(id)=>{
  try {
      const user = await User.get_by_id(id)
      return user;
    } catch (error) {
      console.error('Error getting user by UID in controller:', error);
      throw error;
    }
}

export const get_current_user = async () => {
  const auth = getAuth();
  
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        try {
          const userRec = await get_user_by_uid(user.uid);
          resolve(userRec);
        } catch (error) {
          console.error('Error fetching user:', error);
          reject(error);
        }
      } else {
        // No user is signed in
        resolve(null);
      }

      // Clean up by unsubscribing from the listener
      unsubscribe();
    });
  });
};