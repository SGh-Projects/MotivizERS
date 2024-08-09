import { addDoc, updateDoc, collection, query, getDocs, Timestamp, where, doc, getDoc, runTransaction } from "firebase/firestore";
import { db } from "../firebase";

export default class PointLog {
    constructor (
        staff_id = null,
        student_id = null,
        points = null,
        reason = null,
        comments = null,
    ) {
        this.id = null;
        this.points = points;
        this.reason = reason;
        this.comments = comments;
        this.staff_id = staff_id;
        this.student_id = student_id;
        this.timestamp = Timestamp.now();
    }
}