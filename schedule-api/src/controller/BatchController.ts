import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {User} from "../entity/User";
import { Teacher } from "../entity/Teacher";
import { LeadView } from "../model/LeadView";
import { TeacherAvailability } from "../entity/TeacherAvailability";
import { getManager } from "typeorm";
import { Batch } from "../entity/Batch";
import { BatchAvailability } from "../entity/BatchAvailability";
import { BatchService } from "../services/BatchService";

export class BatchController {

    private usersRepository = getRepository(User);
    private batchAvailabilityRepository = getRepository(BatchAvailability);
    private batchRepository = getRepository(Batch);

    async allLeads(request: Request, response: Response, next: NextFunction) {
        return this.usersRepository.find();
    }

    async createBatch(request: Request, response: Response, next: NextFunction) {
        console.log("saving batch");
        var batchService = new BatchService();
        var batch;
        try{
            batch = await batchService.createBatch(request.body);
        }catch(error)
        {
        console.log()
        }
        return {"success":true,"data": [batch], "total":1};
    }
    
    
    async listBatch(request: Request, response: Response, next: NextFunction) {
        console.log("Batch List");
        console.log("Classes List");
        var current =  parseInt(request.query['current']);
         var pageSize  = parseInt(request.query['pageSize']);

         var quer =  `select * from batch limit ${current}, ${pageSize};`;
         console.log('quer', quer);
         var results = await getManager().query(quer);
 
        return {"success":true,"data": results, "total":results.length};
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