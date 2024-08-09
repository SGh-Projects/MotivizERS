export default class AllotLog {
    constructor (
        points = null,
        staff_id = null,
        admin_id = null,
    ){
        this.id = null;
        this.points = points;
        this.staff_id = staff_id,
        this.admin_id = admin_id;
    }
}