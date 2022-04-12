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
            lessonStartTime:string;    
            lessonEndTime:string;  
            zoomLink:string;  
            zoomInfo:string;  
            frequency:string;  
            whatsappLink: string;
            activeLessonId?:string;
            teacherId?: string;  

            public constructor(id:string,date:Date,batchId:string,createdBy:string,teacher:string,students:number,timeSlot:string,dateSlot:string,stauts:string, studentsList: User[], startingLessonId: string, endingLessonId: string, lessonStartTime?: string, lessonEndTime?: string, zoomLink?: string, zoomInfo?: string, frequency?: string, whatsappLink?: string) {
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
                this.lessonStartTime = lessonStartTime;
                this.lessonEndTime = lessonEndTime;
                this.zoomLink = zoomLink;
                this.zoomInfo = zoomInfo;
                this.frequency = frequency;
                this.whatsappLink = whatsappLink;
            }          
            
    }
    