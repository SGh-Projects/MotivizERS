import { collection, addDoc, updateDoc, getDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { get_student_by_id } from './Student';
import RedeemLog from '../models/RedeemLog';
import Prize from '../models/Prize';

export const create_prize = async (name, cost, type, desc, imgUrl, demo) => {
    try {
        // Call the model function to create a new prize
        const success = await Prize.POST_prize(name, cost, type, desc, imgUrl, demo);
        return success;
    } catch (error) {
        console.error('Error creating prize:', error);
        throw error;
    }
}

export const get_prize_by_id = async (prizeID) => {
    try {
        // Call the model function to get a prize by ID
        const prize = await Prize.GET_prize(prizeID);
        return prize;
    } catch (error) {
        console.error('Error retrieving prize by ID:', error);
        throw error;
    }
}

export const get_all_prizes = async () => {
    try {
        // Call the model function to get all prizes
        const prizes = await Prize.GET_prizes();
        return prizes;
    } catch (error) {
        console.error('Error retrieving all prizes:', error);
        throw error;
    }
}

export const get_all_available_prizes = async () => {
    const prizes = await get_all_prizes();

    const filteredPrizes = prizes.filter(item => item.available === true);

    return filteredPrizes;
}

export const edit_prize = async (id, name, cost, type, desc, img_url, demo) => {
    try {
        // Call the model function to update prizes
        const success = await Prize.UPDATE_prize(id, name, cost, type, desc, img_url, demo)
        return success;
    } catch (error) {
        console.error('Error retrieving all prizes:', error);
        throw error;
    }
}

export const delete_prize = async (id) => {
    try {
        // Call the model function to update prizes
        const success = await Prize.DELETE_prize(id)
        return success;
    } catch (error) {
        console.error('Error deleting', error);
        throw error;
    }
}
 
export const can_redeem = async (uwiID, prizeID) => {
    try {
        const prize = await get_prize_by_id(prizeID);
        if (!prize) {
            throw new Error('Prize not found');
        }

        const user = await get_student_by_id(uwiID);
        
        if (!user) {
            throw new Error('User not found');
        }

        if (prize.cost <= user.current_pts && prize.available) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Error checking if student can redeem');
    }
};

export const redeem_prize = async (studentID, prizeID) => {
    try{
        const canRedeem = await can_redeem(studentID, prizeID);
        console.log(canRedeem)
        if (canRedeem){
            const success = await Prize.POST_prize_redeeem(studentID, prizeID)
            if(success){
                return success;
            }
            else{
                console.log('error')
            } 
        }
        else{
            return false;
        }
    } catch (error) {

    }
};