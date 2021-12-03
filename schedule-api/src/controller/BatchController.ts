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
               query_string = query_string + ` batchNumber =  '${batchId}' ` ;
               query_list.push(` batchNumber =  '${batchId}' ` );
           }
   
        //const mobile =  request.query['mobile'];
           const createdBy = parameters.createdBy;
           if (createdBy) {
               query_string = query_string + ` createdBy =${createdBy} ` ;
               query_list.push(` createdBy like '%${createdBy}%' ` );
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
                query_string = query_string + `  ${startMin} >= startMin and ${endMin}<=endMin;` ;
               query_list.push(`  ${startMin} >= startMin and ${endMin}<=endMin;`);  
            }

            let teacher = parameters.teacher;

            if (teacher) {
               var teacherQuery = `select id, firstName, lastName from user where (firstName like '%${teacher}%' or lastName like '%${teacher}%' )`;
               var teacherDetails = await getManager().query(teacherQuery);
               var ids = '';
               for (var i of teacherDetails){
                   ids = ids + `${i.id}`;
               }
               let  studentCount=[]
              console.log('Teacher details', teacherDetails);
                       
            }

            if (query_list.length>0) {
                query_string = ' where ';
            }
           
            query_list.forEach((value, index) => {                
               console.log(query_list.join(' and '));   
               if ( index !=query_list.length-1) {
                    query_string = query_string + query_list[index] + ' and '; 
                    console.log('query12345', query_string);
               } else {
                query_string = query_string + query_list[index];
               }
            });
            console.log("value sis ", query_string);

        var quer =  `select id,  batchNumber, lessonStartTime, lessonEndTime from classes ${query_string} limit ${current}, ${pageSize};`;
        console.log("Query ", quer);
        var results = await getManager().query(quer);
        let  studentCount=[]
        let name="";

        for (const element of results) {
           
           studentCount = await getManager().createQueryBuilder(BatchStudent, "batchStudent")
        .where("batchStudent.batchId = :id", { id: element.id }).getMany();
        var classes = await getManager().createQueryBuilder(Classes, "classes")
        .where("classes.id = :id", { id: element.id }).getOne();
        var user = await getManager().createQueryBuilder(User, "user")
        .where("user.id = :id", { id: element.id }).getOne();
        if (user && user.firstName && user.lastName){
            name = user.firstName + ' ' + user.lastName;
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

            let view = new BatchView(element.id, new Date(),classes.batchNumber, 'Admin', name, studentCount.length, `${startTime}:${startMin}-${endTime}:${endMin}`,"Active");
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

    var task = cron.schedule('*/10 * * * *', async function () {
        var quer =  `select id,  batchNumber, lessonStartTime, lessonEndTime from classes limit 1, 2;`;
        console.log("Query ", quer);
        var results = await getManager().query(quer);
        let start_slot=0;
        let start_min=0;
        var startMin=0;
        var end_slot=0;
        var end_min=0;
        var endMin=0;
        
        for (var element of results) {
            try{
                console.log('element',element);
                console.log('element.lessonStartTime',new Date(element.lessonStartTime));
                console.log('element.lessonEndTime',element.lessonEndTime);
                start_slot   = parseInt(element.lessonStartTime.substring(11,13));
                start_min  = parseInt(element.lessonStartTime.substring(15,17));
                console.log('start_slot', start_slot);
                let  startMin=start_min  + start_slot*60;
                end_slot   = parseInt(element.lessonEndTime.substring(11,13));
                end_min  = parseInt(element.lessonEndTime.substring(15,17));
                let endMin=end_slot*60 + end_min;
                var results = await getManager().query(`UPDATE classes SET start_slot=${start_slot}, start_min=${start_min}, startMin=${startMin}, end_slot=${end_slot}, end_min=${end_min}, endMin = ${endMin}  WHERE id = '${element.id}';`);
                console.log("cron job started", results);
            }catch(error){
                console.log(error);                
            }
        }
        
        
     }, false);
     task.start();
     console.log('end of method');
    return {"success":true,"message": "Job execution initiated !!!!"};
    }








}