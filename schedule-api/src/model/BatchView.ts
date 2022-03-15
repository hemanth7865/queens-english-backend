    //import { Lead } from "./Lead";
import { User } from "../entity/User";
    export class BatchView {
            id: string;
            date: Date;
            batchId:string;
            createdBy:string;
            teacher:string;
            students:number;
            timeSlot:string;
            dateSlot:string;
            status:string;    
            studentsList: User[];
            startingLessonId:string;    
            endingLessonId:string;    

            public constructor(id:string,date:Date,batchId:string,createdBy:string,teacher:string,students:number,timeSlot:string,dateSlot:string,stauts:string, studentsList: User[], startingLessonId: string, endingLessonId: string) {
                this.id = id;
                this.date=date;
                this.batchId=batchId;
                this.createdBy=createdBy;
                this.teacher=teacher;
                this.students=students;
                this.timeSlot = timeSlot;
                this.dateSlot = dateSlot;
                this.status=stauts;
                this.studentsList = studentsList;
                this.startingLessonId = startingLessonId;
                this.endingLessonId = endingLessonId;
            }          
            
    }
    