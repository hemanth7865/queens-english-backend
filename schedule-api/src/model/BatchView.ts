    //import { Lead } from "./Lead";

    export class BatchView {
            id: string;
            date: Date;
            batchId:string;
            createdBy:string;
            teacher:string;
            students:number;
            timeSlot:string;
            status:string;    

            public constructor(id:string,date:Date,batchId:string,createdBy:string,teacher:string,students:number,timeSlot:string,stauts:string) {
                this.id = id;
                this.date=date;
                this.batchId=batchId;
                this.createdBy=createdBy;
                this.teacher=teacher;
                this.students=students;
                this.timeSlot = timeSlot;
                this.status=stauts;
            }          
            
    }
    