import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {User} from "../entity/User";
import { Teacher } from "../entity/Teacher";
import { LeadView } from "../model/LeadView";
import { TeacherAvailability } from "../entity/TeacherAvailability";
import { getManager } from "typeorm";
import { BatchAvailability } from "../entity/BatchAvailability";
import { BatchService } from "../services/BatchService";
import { BatchView } from "../model/BatchView";
import { BatchStudent } from "../entity/BatchStudent";
import { Classes } from "../entity/Classes";

export class BatchController {

    private usersRepository = getRepository(User);
    private batchAvailabilityRepository = getRepository(BatchAvailability);
    private batchStudentRepository = getRepository(BatchStudent);

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
        var batchView:BatchView[]=[];

        var parameters = {
            current:  parseInt(request.query['current']),
           pageSize  : parseInt(request.query['pageSize']),
            date : request.query['batchId'],
            name : request.query['createdBy'],
            phoneNumber :  request.query['start_slot'],
           totalexp  :  request.query['end_slot'],
            classesTaken : request.query['teacher'],
           ratings : request.query['students'],
           start_slot : request.query['date'],
           }       

           

        var quer =  `select id,  batchNumber, lessonStartTime, lessonEndTime from classes limit ${current}, ${pageSize};`;
        console.log("Query ", quer);
        var results = await getManager().query(quer);
        let  studentCount=[]

        for (const element of results) {
            let firstName;
           studentCount = await getManager().createQueryBuilder(BatchStudent, "batchStudent")
        .where("batchStudent.batchId = :id", { id: element.id }).getMany();
        var classes = await getManager().createQueryBuilder(Classes, "classes")
        .where("classes.id = :id", { id: element.id }).getOne();
        var user = await getManager().createQueryBuilder(User, "user")
        .where("user.id = :id", { id: element.id }).getOne();
        if (user && user.firstName){
            firstName = user.firstName;
        }
        let startTime;
        let endTime;
        let startMin;
        let endMin;
        if (classes.lessonStartTime){
             startTime = new Date(classes.lessonStartTime).getHours();
             startMin = new Date(classes.lessonStartTime).getMinutes();
        }
        
        if (classes.lessonEndTime){
            endTime = new Date(classes.lessonEndTime).getHours();
            endMin = new Date(classes.lessonStartTime).getMinutes();
        }

            let view = new BatchView(element.id, new Date(),classes.batchNumber, 'Admin', firstName, studentCount.length, `${startTime}:${startMin}-${endTime}:${endMin}`,"Active");
            batchView.push(view);
        }
        

              return {"success":true,"data": batchView, "total":batchView.length, "current":current,"pageSize":pageSize};
    }


    async getClasses(request: Request, response: Response, next: NextFunction) {
        console.log("Classes List");
       var current =  parseInt(request.query['current']);
        var pageSize  = parseInt(request.query['pageSize']);
        var batchView:BatchView[]=[];

        var quer =  `select id,  createdBy from batch limit ${current}, ${pageSize};`;
        var results = await getManager().query(quer);
        let  studentCount=[]

        for (const element of results) {

           studentCount = await getManager().createQueryBuilder(BatchStudent, "batchStudent")
        .where("batchStudent.batchId = :id", { id: element.id }).getMany();
            let view = new BatchView(element.id, new Date(),"Batch Id", element.createdBy, 'teacher', 10, "2:00-300","Active");
            batchView.push(view);
        }
        

              return {"success":true,"data": batchView, "total":batchView.length, "current":current,"pageSize":pageSize};
    }








}