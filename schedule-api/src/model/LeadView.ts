    //import { Lead } from "./Lead";

    export class LeadView {
            id: string;
            userId: number;
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
            cosmos_ref: string;
            type:string;

            public constructor(userId:number, leadId:number, date:string,name:string,experience:string, mobile:string,email:string,status:Number,classestaken:number,
                ratings:Number,slots:string,leadType:number, id:string, type:string){
                this.userId = userId;
                this.cosmos_ref=id;
                this.leadId = leadId;
                this.type = type;
                this.date = date;
                this.name = name;
                this.email=email;
                this.experience=experience;
                this.slots=slots;
                this.mobile=mobile;
                this.status=status;
                this.ratings=ratings;
                this.slots=slots;
                this.classesTaken=classestaken;
                this.leadType = leadType;
            }
    }
    