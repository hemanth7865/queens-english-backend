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

    async saveBatch(request: Request, response: Response, next: NextFunction) {
        console.log("saving batch");

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


}