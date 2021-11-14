import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {User} from "../entity/User";
import {Users} from "../entity/Users";
import { Lead } from "../entity/Lead";
import { LeadView } from "../model/LeadView";
import { LeadAvailability } from "../entity/LeadAvailability";
import { getManager } from "typeorm";

export class UserController {

    private usersRepository = getRepository(Users);
    private leadAvailabilityRepository = getRepository(LeadAvailability);
    private leadRepository = getRepository(Lead);
    private userRepository = getRepository(User);

    async allLeads(request: Request, response: Response, next: NextFunction) {
        return this.usersRepository.find();
    }

    async saveLeads(request: Request, response: Response, next: NextFunction) {
        console.log("saving user");

        var leadAvailability:LeadAvailability[] = [];
        var leadTem:Lead[] = [];
        var lead = new Lead();
        var user = new Users();
        for (var element of request.body.lead){
            lead.created_at = new Date();
            lead.updated_at = new Date();
            if (element.id){
                lead.id = element.id;
            }
            lead.joiningdate = element.joiningdate;
            lead.resume = "Resume";
            lead.video = "video";
            lead.leadtype = element.leadtype;
            lead.qualification=element.qualification;
            lead.classestaken = element.classestaken;
            lead.certificates = element.certificates;
            lead.ratings = parseInt(element.ratings);
            lead.totalexp=parseFloat(element.totalexp);
            lead = await this.leadRepository.save(lead);
            console.log('lead id is ', lead.id);
            user.leadId = lead.id;
            //user.leadData = lead;
            user.lead=[lead];
            user.leadId=lead.id;
            console.log("lead ", lead.id);
        }

            // user.lead = [lead];

        //console.log('lead is', lead);

        let i = 0;
        request.body.leadAvailability.forEach( async (element) => {
            var availability = new LeadAvailability();
            availability.start_date = element.startDate;
            availability.start_slot = element.start_slot;
            //console.log('start slot' + element.start_slot);
            if (element.start_slot){
               let time = element.start_slot.split(":");
               availability.start_slot = time[0];   
               console.log('time is ', time);
               availability.start_min = time[1];
            }
            if (element.end_slot){
                let time = element.end_slot.split(":");
                availability.end_slot = time[0];
                availability.end_min = time[1];
             }
            
            availability.weekday = element.weekday;
            availability.id = element.id;
            availability.lead = lead;
            availability.created_at = new Date();
            availability.updated_at = new Date();
            availability = await this.leadAvailabilityRepository.save(availability);   
            leadAvailability[i++] = availability;
       
            //console.log('Lead availability', leadAvailability);
        });

        console.log('leadAvailability', leadAvailability);

        user.leadAvailability = leadAvailability
        user.firstname = request.body.firstname;
        user.lastname = request.body.lastname;
        user.gender = request.body.gender;
        user.mobile = request.body.mobile;
        user.email= request.body.email;
        user.id = request.body.id;
        user.startDate = request.body.startDate;
        user.address = request.body.address;
        user.whatsapp = request.body.whatsapp;
        user.nationalityId = request.body.nationalityId;
        user.dob = request.body.dob;
        user.statusId = request.body.statusId;
        user.photo = request.body.photo;
        user.languages = request.body.languages;
        user.created_at = new Date();
        user.updated_at = new Date();
        user.leadId = lead.id;
        console.log('user', user);
        user = await this.usersRepository.save(user)
       // user.lead = leadTem;
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
        let results:Users[]=[];
        let leadView:LeadView[]=[];
        let slotsResult:any[] = [];   
        var leadTem:Lead[] = [];

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
        let start_slot =  request.query['start_slot'];
        let end_slot  =  request.query['end_slot'];
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
        let totalQuery =  `select count(*) as totalCount  from lead_availability where weekday in ( `+ week_day  + `) and start_slot >= `+ start_slot +` and end_slot <=`+ end_slot + `;`;

        var quer =  `select leadId, weekday , start_slot, end_slot from lead_availability where weekday in ( `+ week_day  + `) and start_slot >= `+ start_slot +` and end_slot <=`+ end_slot + ` and start_min >= `+ start_min +` and end_slot <=`+ end_min + `;`;
        let totalResult = await getManager().query(totalQuery);

        console.log(quer,quer);
       
        slotsResult = await getManager().query(quer);
        let total = await getManager().query(totalQuery);
        let slotsResultIds = slotsResult.forEach((element)=>element.leadId);
        let selectedIds = slotsResult.map(({ leadId }) => leadId);
        const unique = Array.from(new Set(selectedIds)) 

        
    
        for (const element  of slotsResult ) {  
            results = await getManager().query(`select concat(u.firstname , "  ", u.lastname) as name,  u.mobile, concat(le.totalexp , "" , " Years") as exp, u.statusId as statusId, le.ratings as ratings, u.leadId  as leadId , '' as slots, le.classestaken as totalclasses , u.startDate as startdate, le.leadytype as leadtype from users u inner join leads le on u.leadId=le.id and u.leadId in (${unique}) ${limitString};`);
        console.log("Result size is ", results.length);
        }
 
          for (const element  of results ) {  
            
            let slotsResult:any[] = [];   
             var quer =  "select weekday , start_slot, end_slot , start_min, end_min from lead_availability where leadId="+element.leadId + ";"
             slotsResult = await getManager().query(quer);
            var slot = "";
            slotsResult.forEach((element) => {
             slot = slot + map.get(element.weekday) + " " + element.start_slot+":"+element.start_min + " " + element.end_slot +":"+element.start_min + " ";
            });
            const yourDate = new Date()
            
            var  l = new LeadView(element.id, element.leadId, yourDate.toISOString().split('T')[0], element.name, element.exp, element.mobile,'',element.statusId,
            1,2,slot, element.totlaclasses, element.leadtype);
        
            leadView.push(l);
        }

          return {"success":true,"data": leadView, "total":unique.length, "current":current, pageSize:limit};
      
    }


    
    async listLeadDetails(request: Request, response: Response, next: NextFunction) {
        var results:Users[]=[];
        var leadView:LeadView[]=[];
        var map = new Map();  
        var leadTem:Lead[] = [];
  
        map.set(0, 'Sun');     
        map.set(1, 'Mon');       
        map.set(2, 'Tue');   
        map.set(3, 'Wed');   
        map.set(4, 'Thu');  
        map.set(5, 'Fri');  
        map.set(6, 'Sat'); 

        var offset =  parseInt(request.query['current']);
        const limit  =  parseInt(request.query['pageSize']);
        if (offset==1) {
            offset = 0;
        }
        console.log("Query start");
        results = await getManager().query(`select concat(u.firstname , "  ", u.lastname) as name,  u.mobile, concat(le.totalexp , "" , " Years") as exp, u.statusId as statusId, le.ratings as ratings, u.leadId  as leadId , u.id as id, '' as slots, le.leadtype as leadtype from users u inner join leads le on u.leadId=le.id limit ` + (offset * limit) +","+ limit + `;`);
        console.log('results size', results.length)
        var total = await getManager().query(`select count(*) as totalCount from users u inner join leads le on u.leadId=le.id;`);
         //console.log(total);
        //  results.forEach(async (element,index,self) => {     
          for (const element  of results ) {  
            let slotsResult:any[] = [];   
            //console.log(element.leadId);
             var quer =  "select weekday , start_slot, end_slot from lead_availability where leadId="+element.leadId + ";"
            slotsResult = await getManager().query(quer);
            var slot = "";
            slotsResult.forEach((element) => {
                slot = slot + map.get(element.weekday) + " " + element.start_slot+":"+element.start_min + " " + element.end_slot +":"+element.start_min + " ";
            });
            const yourDate = new Date()
            var  l = new LeadView(element.id, element.leadId, yourDate.toISOString().split('T')[0], element.name, element.exp, element.mobile,'',element.statusId,
            1,2,slot,element.totlaclasses, element.leadtype);
        
            leadView.push(l);
          
        };
      
        return {"success":true,"data": leadView, "total":total[0].totalCount, "current":offset, pageSize:limit};
    }

    
   
    async leadFullDetails(request: Request, response: Response, next: NextFunction) {
      
        var map = new Map();  
        var leadTem:Lead[] = [];
  
        map.set(0, 'Sun');     
        map.set(1, 'Mon');       
        map.set(2, 'Tue');   
        map.set(3, 'Wed');   
        map.set(4, 'Thu');  
        map.set(5, 'Fri');  
        map.set(6, 'Sat'); 

        let slotsResult:any[] = []; 
        let users = new Users();   
        const leadId = parseInt(request.params.id);
        console.log('leadid', leadId);
        console.log(users)
        users = await getManager().createQueryBuilder(Users, "user")
        .where("user.leadId = :id", { id: leadId }).getOne();
       
        const lead = await getManager().createQueryBuilder(Lead, "lead")
        .where("lead.id = :id", { id: leadId }).getOne();
        leadTem[0] = lead;
        console.log(users);
        if (lead && leadTem)
             users.lead = leadTem;
        const leadav:LeadAvailability[] = [];
        const list:any = await getManager().createQueryBuilder(LeadAvailability, "leadAvailability")
        .where("leadAvailability.leadId = :id", { id: leadId }).getMany();
        if (users)
            users.leadAvailability=list;
        var quer =  "select weekday , start_slot, end_slot, start_min, end_min from lead_availability where leadId="+leadId + ";"
        slotsResult = await getManager().query(quer);
        var slot = "";
        slotsResult.forEach((element) => {
            console.log('element'+element);
            console.log('element'+element);
            if (element.start_min == 0) {
                element.start_min = "00"
            } 
            if (element.end_min == 0) {
                element.end_min = "00"
            } 
        slot = slot + map.get(element.weekday) + " " + element.start_slot + ":" +element.start_min+ " " + element.end_slot +":" + element.end_min + " ";
        });
        if (slot)
            users.slots=slot;

        return {"success":true,"data": users, "total":1, "current":1, pageSize:1};
    }

    async leadAvialability(request: Request, response: Response, next: NextFunction) {
        console.log("Request Parameter" + request.query);
        let availabilitydate =  request.query['date'];;
        let start_slot =  request.query['start_slot'];
        let end_slot  =  request.query['end_slot'];
        let week_day  =  request.query['week_slot'];

        let slots:LeadAvailability[] = [];
        slots =await this.leadAvailabilityRepository.createQueryBuilder("LeadAvailability")
        .where('leadavailability.date >= :date ', {date:availabilitydate}).andWhere('leadavailability.week_date in (:days) ', {days:week_day})
        .andWhere('start_slot.date >= :start_slot',{start_slot:start_slot}).andWhere('end_slot.date <= :end_slot',{end_slot:end_slot}).getMany();

       return slots;
    }



   
    async all(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.find();
    }

    async one(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.findOne(request.params.id);
    }

    async save(request: Request, response: Response, next: NextFunction) {
        console.log("saving user");
        return this.userRepository.save(request.body);
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        console.log("Delete user");
        console.log('request.params.id' + request.params.id);
        let userToRemove = await this.usersRepository.findOne(request.params.id);
        userToRemove.statusId = 3;
        return this.usersRepository.save(userToRemove);
  
       
    }
 

}