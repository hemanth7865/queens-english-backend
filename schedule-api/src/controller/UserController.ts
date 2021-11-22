import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {User} from "../entity/User";
import { Teacher as Teacher } from "../entity/Teacher";
import { LeadView } from "../model/LeadView";
import { TeacherAvailability as TeacherAvailability } from "../entity/TeacherAvailability";
import { getManager } from "typeorm";
import { TeacherService } from "../services/TeacherService";

export class UserController {

    private usersRepository = getRepository(User);
    private teacherAvailabilityRepository = getRepository(TeacherAvailability);
    private teacherRepository = getRepository(Teacher);

    async allLeads(request: Request, response: Response, next: NextFunction) {
        return this.usersRepository.find();
    }

    async saveLeads(request: Request, response: Response, next: NextFunction) {
        console.log('contorller');
        var teacherService = new TeacherService();
        var user;
        try{
            user = await teacherService.saveTeacher(request.body);
        }catch(error)
        {
        console.log()
        }
        return {"success":true,"data": [user], "total":1};
    }


    async leadDetails(request: Request, response: Response, next: NextFunction) {

        
        /*
        
        
        const leadView = new LeadView();
        const lead = await this.leadRepository.createQueryBuilder("Lead")
        .where("lead.id = :id", { id: request.params.id }).getOne();
        leadView.date=new Date();
        const user = await this.usersRepository.createQueryBuilder("Users")
        .where("user.leadId = :id", { id: request.params.id }).getOne();
        const leadav:LeadAvailability[] = [];
        const list:any = await this.leadAvailabilityRepository.createQueryBuilder("LeadAvailability")
        .where("lead.id = :id", { id: request.params.id }).getMany();
        leadav.push(list);
        var slots = "";
        leadav.forEach( (element) => {
            slots + element.start_slot +" - " + element.end_slot;
        });
        leadView.timeslots = slots;
        leadView.status = user.statusId;
        leadView.experience = lead.total_exp + "years";
        leadView.mobile = user.mobile;
        leadView.name = user.firstname + " " + user.lastname;
        return leadView;*/
    }

    async filterLeadDetails(request: Request, response: Response, next: NextFunction) {
        let results:User[]=[];
        let leadView:LeadView[]=[];
        let slotsResult:any[] = [];   
        var leadTem:Teacher[] = [];

        var offset =  parseInt(request.query['current']);
        var current =  parseInt(request.query['current']);
        const limit  =  parseInt(request.query['pageSize']);

        if (offset==1) {
            offset = 0;
        }

        var limitString = '';
        console.log('limit', limit);
        console.log('offset', offset);
        if (limit) {
            limitString =  ` limit `+ offset * limit + ` , `+  limit
        }
        console.log('limitString', limitString);


        let availabilitydate =  request.query['date'];;
        let start_slot =  request.query['startMin'];
        let end_slot  =  request.query['endMin'];
        let week_day  =  parseInt(request.query['weekday']);
        let start_min;
        let end_min;
        if (start_slot){
            let time = start_slot.split(":");
            start_slot = time[0];   
            console.log('time is ', time);
            start_min = time[1];
         }
         if (end_slot){
             let time = end_slot.split(":");
             end_slot = time[0]
             console.log('time is ', time);;
             end_min = time[1];
          }
   

       
        var map = new Map();  
  
        map.set(0, 'Sun');     
        map.set(1, 'Mon');       
        map.set(2, 'Tue');   
        map.set(3, 'Wed');   
        map.set(4, 'Thu');  
        map.set(5, 'Fri');  
        map.set(6, 'Sat'); 
        let totalQuery =  `select count(*) as totalCount  from lead_availability where weekday in ( `+ week_day  + `) and startMin >= `+ start_slot +` and endMin <=`+ end_slot + `;`;

        var quer =  `select leadId, weekday , startMin, endMin from lead_availability where weekday in ( `+ week_day  + `) and startMin >= `+ start_slot +` and endMin <=`+ end_slot + `;`;
        let totalResult = await getManager().query(totalQuery);

        console.log(quer,quer);
       
        slotsResult = await getManager().query(quer);
        let total = await getManager().query(totalQuery);
        let slotsResultIds = slotsResult.forEach((element)=>element.leadId);
        let selectedIds = slotsResult.map(({ leadId }) => leadId);
        const unique = Array.from(new Set(selectedIds)) 

        
    
        for (const element  of slotsResult ) { 
            console.log('limitString' , limitString); 
            if (limitString) {
                results = await getManager().query(`select concat(u.firstname , "  ", u.lastname) as name,  u.mobile, concat(le.totalexp , "" , " Years") as exp, u.statusId as statusId, le.ratings as ratings, u.leadId  as leadId , '' as slots, le.classestaken as totalclasses , u.startDate as startdate, le.leadytype as leadtype, le.joinindate as joiningdate from users u inner join leads le on u.leadId=le.id and u.leadId in (${unique}) ${limitString};`);
            } else {
                results = await getManager().query(`select concat(u.firstname , "  ", u.lastname) as name,  u.mobile, concat(le.totalexp , "" , " Years") as exp, u.statusId as statusId, le.ratings as ratings, u.leadId  as leadId , '' as slots, le.classestaken as totalclasses , u.startDate as startdate, le.leadytype as leadtype, le.joinindate as joiningdate from users u inner join leads le on u.leadId=le.id and u.leadId ;`);
            }
           
        console.log("Result size is ", results.length);
        }
 
          for (const element  of results ) {  
            
            let slotsResult:any[] = [];   
             var quer =  "select weekday , start_slot, end_slot , start_min, end_min from lead_availability where leadId="+element.teacherId + ";"
             slotsResult = await getManager().query(quer);
            var slot = "";
            slotsResult.forEach((element) => {
             slot = slot + map.get(element.weekday) + " " + element.start_slot+":"+element.start_min + " " + element.end_slot +":"+element.start_min + " ";
            });
            const yourDate = new Date(element.joiningdate);
            
            var  l = new LeadView(element.userId, element.teacherId, yourDate.toISOString().split('T')[0], element.name, element.exp, element.phoneNumber,'',element.statusId,
            element.ratings,element.classestaken,slot, element.leadtype, element.cosmos_ref);
        
            leadView.push(l);
        }

          return {"success":true,"data": leadView, "total":unique.length, "current":current, pageSize:limit};
      
    }


    
    async listLeadDetails(request: Request, response: Response, next: NextFunction) {
        console.log("list lead details");

       var parameters = {

         current:  parseInt(request.query['current']),
        pageSize  : parseInt(request.query['pageSize']),
         date : request.query['date'],
         name : request.query['name'],
        mobile :  request.query['mobile'],
        totalexp  :  request.query['totalexp'],
         classesTaken : request.query['classesTaken'],
        ratings : request.query['ratings'],
        start_slot : request.query['start_slot'],
        end_slot : request.query['end_slot'],
        week_day  : request.query['weekday']
           }       

       var teacherService = new TeacherService();
       var user;

       let resp;
  
       try{
           resp = await teacherService.listLeadDetails(request.body, parameters);
       }catch(error)
       {
       console.log(error);
       }
       
        return resp;
    }

    
   
    async leadFullDetails(request: Request, response: Response, next: NextFunction) {
      
        let resp;
        let teacherService = new TeacherService();

        const teacherId = parseInt(request.params.id);
  
       try{
           resp = await teacherService.leadFullDetails(request.body, teacherId);
           console.log(resp);
       }catch(error)
       {
       console.log(error);
       }
       
        
       console.log(resp);
        return resp;
    }

    async leadAvialability(request: Request, response: Response, next: NextFunction) {
        console.log("Request Parameter" + request.query);
        let availabilitydate =  request.query['date'];;
        let start_slot =  request.query['start_slot'];
        let end_slot  =  request.query['end_slot'];
        let week_day  =  request.query['week_slot'];

        let slots:TeacherAvailability[] = [];
        slots =await this.teacherAvailabilityRepository.createQueryBuilder("TeacherAvailability")
        .where('leadavailability.date >= :date ', {date:availabilitydate}).andWhere('leadavailability.week_date in (:days) ', {days:week_day})
        .andWhere('start_slot.date >= :start_slot',{start_slot:start_slot}).andWhere('end_slot.date <= :end_slot',{end_slot:end_slot}).getMany();

       return slots;
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        console.log("Delete user");
        console.log('request.params.id' + request.params.id);
        let userToRemove = await this.usersRepository.findOne(request.params.id);
        userToRemove.statusId = 3;
        return this.usersRepository.save(userToRemove);
  
       
    }
 

}