import { db } from "../firebase"
import {collection, onSnapshot, getDocs} from "firebase/firestore"
import Notification from "../models/Notification";
import { get_current_user } from "./Auth";

export const get_user_notifications = async (id, callback) => {
    try {
        const notificationsCollectionRef = collection(db, 'users', id, 'notifications'); 
        // Check if the collection exists
        const snapshot = await getDocs(notificationsCollectionRef);
        if (snapshot.empty) {
            // If the collection doesn't exist, return null
            callback(null);
            return null;
        }

        // If the collection exists, proceed with retrieving notifications
        const unsubscribe = onSnapshot(notificationsCollectionRef, (querySnapshot) => {
            let notifications = [];
            querySnapshot.forEach((doc) => {
                const notificationData = doc.data();
                notifications.push(notificationData);
            });
            callback(notifications);
        });

        return unsubscribe;
    } catch (error) {
        console.error('Error retrieving user notifications:', error);
        return null;
    }
}

export const read_notification = async ( userID, notiID ) => {
    const noti = new Notification(notiID);

    const response = await noti.read(userID, notiID) 
    return response;
}

export const has_unread_notifications = async () => {
    try {
        const user = await get_current_user();
        let notifications = [];

        // Wait for notifications to be fetched and processed
        await new Promise((resolve, reject) => {
            get_user_notifications(user.id, (notifs) => {
                const filteredNotifs = notifs.filter(notification => notification.notifTitle);
                notifications = filteredNotifs;
                resolve();
            });
        });
        if(notifications.length > 0){
            // Check if any notifications are unread
            const hasUnread = notifications.some(notification => !notification.notifReadStatus); 
            return hasUnread;
        }
        else{
            return false;
        }
    } catch (error) {
        console.error('Error checking for unread notifications:', error);
        return false; // Return false in case of an error
    }
}

export const listenForNotifications = (userId, callback) => {
    const notificationsCollectionRef = collection(db, 'users', userId, 'notifications');
    return onSnapshot(notificationsCollectionRef, (snapshot) => {
        let hasUnreadNotifications = false;
        if (snapshot.empty) {
            // If the collection is empty, call the callback with false
            callback(false);
        } else {
            snapshot.docs.forEach(doc => {
                const data = doc.data(); 
                if (!data.notifReadStatus) {
                    hasUnreadNotifications = true;
                }
            }); 
            callback(hasUnreadNotifications);
        }
    }, (error) => {
        console.error('Error listening for notifications:', error);
        // Call the callback with false in case of an error
        callback(false);
    });
};

