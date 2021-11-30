import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {User} from "../entity/User";
import { Teacher } from "../entity/Teacher";
import { LeadView } from "../model/LeadView";
import { TeacherAvailability } from "../entity/TeacherAvailability";
import { getManager } from "typeorm";
import { Batch } from "../entity/Batch";
import { BatchAvailability } from "../entity/BatchAvailability";

export class BatchController {

    private usersRepository = getRepository(User);
    private batchAvailabilityRepository = getRepository(BatchAvailability);
    private batchRepository = getRepository(Batch);

    async allLeads(request: Request, response: Response, next: NextFunction) {
        return this.usersRepository.find();
    }

    async batchCreate(request: Request, response: Response, next: NextFunction) {
        console.log("saving batch");

        const body_ex = 

        {
            "students": [
                {
                    "type": "studentProfile",
                    "id": "26879ecb-a5e8-400c-a626-98b1d626674f"
                }
            ],
            "classAttendance": [],
            "weeklyStudentReports": [],
            "type": "classProfile",
            "batchNumber": "Demo Class",
            "teacherId": "02d200be-7fbd-49c3-aff4-41c40b3a6a63",
            "classStartDate": "2021-10-14T18:30:00.000Z",
            "classEndDate": "2022-01-30T18:30:00.000Z",
            "lessonStartTime": "2021-10-15T09:30:00.000Z",
            "lessonEndTime": "2021-10-15T10:30:00.000Z",
            "ageGroup": "Preteens",
            "startingLessonId": "v2-fac55df3-e433-43de-9d76-b19afd9682d2",
            "endingLessonId": "v2-c2017a8a-30b8-487c-96ae-e59079ce14ca",
            "version": "v2",
            "id": "bac2bcce-9ce7-4f2c-b76a-9560cad7f5be",
            "partitionKey": "bac2bcce-9ce7-4f2c-b76a-9560cad7f5be",
            "classCode": "abc12"
        }

        var batchAvailability:BatchAvailability[] = [];
        var leadTem:Teacher[] = [];
        var batch = new Batch();
        var user = new User();
        for (var element of request.body.lead){
            batch.created_at = new Date();
            batch.updated_at = new Date();
            if (element.id){
                batch.id = element.id;
            }
            batch.creationDate = element.joiningdate;
            batch.teacherId=element.leadId;
            batch.userId=element.userId;
            batch = await this.batchRepository.save(batch);          
        }

            // user.lead = [lead];

        //console.log('lead is', lead);

        let i = 0;
        request.body.batchAvailability.forEach( async (element) => {
            var availability = new BatchAvailability();
            availability.start_date = element.startDate;
            availability.start_slot = element.start_slot;
            //console.log('start slot' + element.start_slot);
            if (element.start_slot){
               let time = element.start_slot.split(":");
               availability.start_slot = time[0];   
               console.log('time is ', time);
               availability.start_min = time[1];
               availability.startMin = time[0] * 60 + time[1];
            }
            if (element.end_slot){
                let time = element.end_slot.split(":");
                availability.end_slot = time[0];
                availability.end_min = time[1];
                availability.endMin = time[0] * 60 + time[1];
             }
            
            availability.weekday = element.weekday;
            if (element.id)
                availability.id = element.id;
            availability.batch = batch;
            availability.created_at = new Date();
            availability.updated_at = new Date();
            availability = await this.batchAvailabilityRepository.save(availability);   
            batchAvailability[i++] = availability;
       
            //console.log('Lead availability', leadAvailability);
        });
        batch.batchAvailability =  batchAvailability;
       // user.lead = leadTem;
        return {"success":true,"data": [batch], "total":1};
    }
    
    
    async getBatches(request: Request, response: Response, next: NextFunction) {
        console.log("Batch List");

        const batchlist = [

        {
            "date":new Date(),
            "batchId":"QE-01234",
            "createdBy":"admin",
            "students":20,
            "timeSlot":"8:30 - 9:30",
            "status":"Ongoing"
        },
        {
            "date":new Date(),
            "batchId":"QE-01234",
            "createdBy":"admin",
            "students":20,
            "timeSlot":"8:30 - 9:30",
            "status":"Ongoing"
        },
        {
            "date":new Date(),
            "batchId":"QE-01234",
            "createdBy":"admin",
            "students":20,
            "timeSlot":"8:30 - 9:30",
            "status":"Ongoing"
        },
        {
            "date":new Date(),
            "batchId":"QE-01234",
            "createdBy":"admin",
            "students":20,
            "timeSlot":"8:30 - 9:30",
            "status":"Ongoing"
        }
    ]

              return {"success":true,"data": batchlist, "total":batchlist.length};
    }


    async getClasses(request: Request, response: Response, next: NextFunction) {
        console.log("Classes List");
       var current =  parseInt(request.query['current']);
        var pageSize  = parseInt(request.query['pageSize']);

        var quer =  `select * from classes limit ${current}, ${pageSize};`;
        var results = await getManager().query(quer);

              return {"success":true,"data": results, "total":results.length};
    }








}