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
var moment = require('moment');
const cron = require('node-cron');

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
            batchId : request.query['batchId'],
            createdBy : request.query['createdBy'],
            start_slot :  request.query['start_slot'],
           end_slot  :  request.query['end_slot'],
            teacher : request.query['teacher'],
           students : request.query['students'],
           date : request.query['date'],
           week_day:request.query['weekday'],
           } 
           
           //var offset =  parseInt(request.query['current']);
           var offset = parseInt(request.query['current']);
           var current = offset;
           //const limit  =  parseInt(request.query['pageSize']);
           var limit = parameters.pageSize;
           if (offset==1) {
               offset = 0;
           }

           let query_list = [];
           let query_string='';
   
          // const date =  request.query['date'];;
          console.log(parameters);
          const batchId = parameters.batchId;
           if (batchId) {
               query_string = query_string + ` and cl.batchId =  '${batchId}' ` ;
               query_list.push(` le.joiningdate =  '${batchId}' `);
           }
   
        //const mobile =  request.query['mobile'];
           const createdBy = parameters.createdBy;
           if (createdBy) {
               query_string = query_string + ` and u.createdBy =${createdBy} ` ;
               query_list.push(` u.phoneNumber =${createdBy} `);
               console.log('query phonen umber ', createdBy);
           }
   
           //const mobile =  request.query['mobile'];

           var start_slot = parameters.start_slot;
           //let end_slot = request.query['end_slot'];
           var end_slot = parameters.end_slot;
   
           //let week_day  =  request.query['weekday'];
           var week_day = parameters.week_day;
           let start_min;
           let end_min;
           let startMin;
           let endMin;
           if (start_slot){
               let time = start_slot.split(":");
               start_slot = time[0];   
               console.log('time is ', time);
               start_min = time[1];
               startMin = time[0] * 60 + time[1];
               
            }
            if (end_slot){
                let time = end_slot.split(":");
                end_slot = time[0]
                console.log('time is ', time);;
                end_min = time[1];
                endMin = time[0] * 60 + time[1];
               
             }
   
             var unique=[0];
             console.log(`query string ${query_list}`);
   
             if (start_slot && end_slot) {
                var quer =  `select id, weekday , start_slot, end_slot from teacher_availability where weekday in (  ${week_day}  ) and ${startMin} >= startMin and ${endMin}<=endMin;`;
                console.log('quer', quer);
               let totalResult = await getManager().query(quer);
               console.log('totalResult',totalResult);
               let slotsResultIds:any = [0]
   
               for (var element of totalResult) {
                   slotsResultIds.push(element.id);
               }
   
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

    async runBatchJob(request: Request, response: Response, next: NextFunction) {
  //  var cronString = '*' +' '+ moment().add(2,'minutes').minute() +' '+ '*' +' '+ '*'+' '+ '*' +' *';
   // console.log('cron expression', cronString);

    var task = cron.schedule('* 0/2 * * *', async function () {
        var quer =  `select id,  batchNumber, lessonStartTime, lessonEndTime from classes limit 1, 2;`;
        console.log("Query ", quer);
        var results = await getManager().query(quer);
        var start_slot='';
        var start_min='';
        var startMin='';
        var end_slot='';
        var end_min='';
        var endMin='';
        
        for (var element of results) {
            let start_slot = new Date(element.lessonStartTime).getHours();
            let  start_min=new Date(element.lessonStartTime).getMinutes();
            let  startMin=start_min  + start_slot*60;
            let  end_slot=new Date(element.lessonEndTime).getHours();
            let end_min=new Date(element.lessonEndTime).getMinutes();;
            let endMin=end_slot*60 + end_min;
            var results = await getManager().query(`UPDATE classes SET start_slot=${start_slot}, start_min=${start_min}, startMin=${startMin}, end_slot=${end_slot}, end_min=${end_min}, endMin = ${endMin}  WHERE id = ${element.id};`);
            console.log("cron job started", results);
        }
        
        
     }, false);
     task.start();
     console.log('end of method');
    return {"success":true,"data": "data", "total":"data", "current":0,"pageSize":1};
    }








}