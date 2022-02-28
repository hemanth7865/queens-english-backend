    //import { Lead } from "./Lead";

    export class LeadView {
            id: string;
            date: string;        
            name: string;         
            totalexp:string;         
            phoneNumber: string;         
            email: string;         
            status: string;
            classestaken: string;
            ratings:Number;
            timeslots: string;
            leadId: string;
            slots:string;
            classesTaken:number;
            leadType : Number;
            cosmos_ref: string;
            type:string;
            batchCode: string;
            studentID: string;

            public constructor(id:string, leadId:string, date:string,name:string,experience:string, mobile:string,email:string,status:string,classestaken:number,
                ratings:number,slots:string,leadType:number, type:string, batchCode:string, studentID:string){
                this.id = id;
                this.leadId = leadId;
                this.date = date;
                this.totalexp=experience;
                this.phoneNumber=mobile;
                this.email=email;                
                this.status=status;
                this.classesTaken=classestaken;
                this.ratings=ratings;
                this.slots=slots;
                this.slots=slots;
                this.type = type;
                this.leadType = leadType;
                this.name = name;
                this.batchCode = batchCode;
                this.studentID = studentID;
            }
    }
    