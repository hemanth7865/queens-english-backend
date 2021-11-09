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

        
        console.log(request.body);
        let lead = new Lead();
        lead.created_at = new Date();
        lead.updated_at = new Date();
        lead.id = request.body.lead.id;
        lead.joining_date = request.body.lead.joining_date;
        lead.resume = "Resume";
        lead.video = "video";
        lead.qualification=request.body.lead.qualification;
        lead.certificates = request.body.lead.certificates;
        lead.total_exp=request.body.lead.totalexperiance;
        lead = await this.leadRepository.save(lead);
        let i =0;

        request.body.leadAvailability.forEach( async (element) => {
            var availability = new LeadAvailability();
            availability.start_date = element.startdate;
            availability.start_slot = element.start_slot;
            availability.end_slot = element.end_slot;
            availability.weekday = element.weekday;
            availability.id = element.id;
            availability.lead = lead;
            availability.created_at = new Date();
            availability.updated_at = new Date();
            availability = await this.leadAvailabilityRepository.save(availability);
            leadAvailability[i++] = availability;
        });

        let user = new Users();
        user.leadAvailability = leadAvailability
        user.firstname = request.body.firstname;
        user.lastname = request.body.lastname;
        user.gender = request.body.gender;
        user.mobile = request.body.mobile;
        user.email= request.body.email;
        user.id = request.body.id;
        user.address = request.body.address;
        user.whatsapp = request.body.whatsapp;
        user.nationalityId = 1;
        user.dob = new Date();
        user.statusId = request.body.statusId;
        user.photo = request.body.photo;
        user.languages = request.body.languages;
        user.created_at = new Date();
        user.updated_at = new Date();
        user.leadId = lead.id;
        user.lead = lead;

   
        return this.usersRepository.save(user);
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

        let availabilitydate =  request.query['date'];;
        let start_slot =  parseInt(request.query['start_slot']);
        let end_slot  =  parseInt(request.query['end_slot']);
        let week_day  =  parseInt(request.query['weekday']);
        
        var map = new Map();  
  
        map.set(0, 'SUN');     
        map.set(1, 'MON');       
        map.set(2, 'TUE');   
        map.set(3, 'WED');   
        map.set(4, 'THU');  
        map.set(5, 'FRI');  
        map.set(6, 'SAT'); 


        var quer =  `select leadId, weekday , start_slot, end_slot from lead_availability where weekday = `+ week_day  + ` and start_slot >= `+ start_slot +` and end_slot <=`+ end_slot + `;`;
        slotsResult = await getManager().query(quer);
        let slotsResultIds = slotsResult.forEach((element)=>element.leadId);
        let selectedIds = slotsResult.map(({ leadId }) => leadId);
        const unique = Array.from(new Set(selectedIds)) 
        for (const element  of slotsResult ) {  
            results = await getManager().query(`select concat(u.firstname , "  ", u.lastname) as name,  u.mobile, concat(le.total_exp , "" , " Years") as exp, u.statusId as statusId, le.ratings as ratings, u.leadId  as leadId , '' as slots from users u inner join leads le on u.leadId=le.id and u.leadId in (${unique})`);
          console.log(results);
        }
          for (const element  of results ) {  
            let slotsResult:any[] = [];   
            console.log(element.leadId);
             var quer =  "select weekday , start_slot, end_slot from lead_availability where leadId="+element.leadId + ";"
            slotsResult = await getManager().query(quer);
            var slot = "";
            slotsResult.forEach((element) => {
                console.log('element'+element);
                console.log('element'+element);
             slot = slot + map.get(element.weekday) + " " + element.start_slot + " " + element.end_slot +":";
            });
            var  l = new LeadView(element.leadId, new Date(), element.name, element.exp, element.mobile,'',element.statusId,
            1,2,slot,element.slots);
        
            leadView.push(l);
        }


        return leadView;
      
    }


    
    async listLeadDetails(request: Request, response: Response, next: NextFunction) {
        var results:Users[]=[];
        var leadView:LeadView[]=[];
        var map = new Map();  
  
        map.set(0, 'SUN');     
        map.set(1, 'MON');       
        map.set(2, 'TUE');   
        map.set(3, 'WED');   
        map.set(4, 'THU');  
        map.set(5, 'FRI');  
        map.set(6, 'SAT'); 

        const offset =  parseInt(request.query['offset']);
        const limit  =  parseInt(request.query['limit']);
         results = await getManager().query(`select concat(u.firstname , "  ", u.lastname) as name,  u.mobile, concat(le.total_exp , "" , " Years") as exp, u.statusId as statusId, le.ratings as ratings, u.leadId  as leadId , '' as slots from users u inner join leads le on u.leadId=le.id limit ` + offset +","+ limit);
         //  results.forEach(async (element,index,self) => {     
          for (const element  of results ) {  
            let slotsResult:any[] = [];   
            console.log(element.leadId);
             var quer =  "select weekday , start_slot, end_slot from lead_availability where leadId="+element.leadId + ";"
            slotsResult = await getManager().query(quer);
            var slot = "";
            slotsResult.forEach((element) => {
                console.log('element'+element);
                console.log('element'+element);
             slot = slot + map.get(element.weekday) + " " + element.start_slot + " " + element.end_slot +":";
            });
            var  l = new LeadView(element.leadId, new Date(), element.name, element.exp, element.mobile,'',element.statusId,
            1,2,slot,element.slots);
        
            leadView.push(l);
          
        };
      
        return leadView;
    }

    
   
    async leadFullDetails(request: Request, response: Response, next: NextFunction) {
        let users = new Users();   
        const leadId = parseInt(request.query['leadId']);
        console.log('leadid', leadId);
        users = await this.usersRepository.createQueryBuilder("Users")
        .where("users.leadId = :id", { id: leadId }).getOne();
        const lead = await this.leadRepository.createQueryBuilder("Lead")
        .where("lead.id = :id", { id: leadId }).getOne();
        console.log(users)
        const leadav:LeadAvailability[] = [];
        const list:any = await this.leadAvailabilityRepository.createQueryBuilder("LeadAvailability")
        .where("leadAvailability.leadId = :id", { id: leadId }).getMany();
        users.leadAvailability=list;
       return users;
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