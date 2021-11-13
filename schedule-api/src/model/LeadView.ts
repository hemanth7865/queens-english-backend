    //import { Lead } from "./Lead";

    export class LeadView {
            id: number;
            date: string;        
            name: string;         
            experience:string;         
            mobile: string;         
            email: string;         
            status: Number;
            classestaken: string;
            ratings:Number;
            timeslots: string;
            leadId: number;
            slots:string;
            classesTaken:number;
            leadType : Number;

            public constructor(id:number, leadId:number, date:string,name:string,experience:string, mobile:string,email:string,status:Number,classestaken:number,
                ratings:Number,slots:string, totalclasses:number, leadType:number){
                this.id = id;
                this.leadId = leadId;
                this.date = date;
                this.name = name;
                this.experience=experience;
                this.slots=slots;
                this.mobile=mobile;
                this.status=status;
                this.ratings=ratings;
                this.slots=slots;
                this.email=email;
                this.classesTaken=totalclasses;
                this.leadType = leadType;
            }
    }
    