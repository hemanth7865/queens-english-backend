
import {Any, getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {User} from "../entity/User";
import { Teacher as Teacher } from "../entity/Teacher";
import { LeadView } from "../model/LeadView";
import { TeacherAvailability as TeacherAvailability } from "../entity/TeacherAvailability";
import { getManager } from "typeorm";
const https = require('https')


export class TeacherService {

    private usersRepository = getRepository(User);
    private teacherAvailabilityRepository = getRepository(TeacherAvailability);
    private teacherRepository = getRepository(Teacher);

    TeacherService(){ }

    data = JSON.stringify({
        todo: 'Buy the milk'
      })

    options = {
        hostname: 'https://ed-uat-functions.azurewebsites.net/',
        port: 443,
        path: '/classProfile/${classProfile.id}/?code=${API_KEY}',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': this.data.length
        }
      }

     uat =  {
        apiEndpoint: 'https://ed-uat-functions.azurewebsites.net/api',
        apiKey: 'NOW2ifNPyTeNEN751YkUoY8YWhv8UkQrJbJPE4wHT2WFMI7afSVh5g=='
      }

     API_URL = this.uat.apiEndpoint;
   API_KEY = this.uat.apiKey;
   ADMIN_TOKEN = `eyJhbGciOiJIUzI1NiJ9.eyJwaG9uZU51bWJlciI6Iis5MTk5OTgyOTM5MjQiLCJvdHAiOiIzMjg3NDUiLCJleHBpcnkiOjE2MzY3MDIzNjUyNTd9.UKfATwq2UXnD6qsgVkrPn8B-oYI3NbsG5LwYSFhZpjI`;
 

    async saveTeacherOnCosmosDB(data:any) {
            
        const req = https.request(options, res => {
            console.log(`statusCode: ${res.statusCode}`)          
            res.on('data', d => {
              process.stdout.write(d)
            })
          })
          
          req.on('error', error => {
            console.error(error)
          })
          
          req.write(data)
          req.end()
        

    }
    async saveTeacher(data:any) {
        console.log('service method');
        try{
            var teacherAvailability:TeacherAvailability[] = [];
            var teacherItem:Teacher[] = [];
            var teacher = new Teacher();
            var user = new User();
            for (var element of data.lead){
                teacher.created_at = new Date();
                teacher.updated_at = new Date();
                if (element.id){
                    teacher.id = element.id;
                }
                teacher.joiningdate = element.joiningdate;
                teacher.resume = "Resume";
                teacher.video = "video";
                teacher.teachertype = element.teacher_type;
                teacher.qualification=element.qualification;
                teacher.classestaken = element.classestaken;
                teacher.teachertype = element.teacher_type;
                teacher.certificates = element.certificates;
                teacher.ratings = parseInt(element.ratings);
                if (!teacher.ratings)
                    teacher.ratings = 0;

                teacher.totalexp=parseFloat(element.totalexp);
                if (!teacher.totalexp)
                    teacher.totalexp = 0;
                teacher = await this.teacherRepository.save(teacher);
                console.log('lead id is ', teacher.id);
                user.teacherId = teacher.id;
                user.teacher=[teacher];
                user.teacherId=teacher.id;
                console.log("lead ", teacher.id);
            }
    
            let i = 0;
            data.leadAvailability.forEach( async (element) => {
                var availability = new TeacherAvailability();
                availability.start_date = element.startDate;
                availability.start_slot = element.start_slot;
                console.log('start slot' + element.start_slot);
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
                availability.teacher = teacher;
                availability.created_at = new Date();
                availability.updated_at = new Date();
                availability = await this.teacherAvailabilityRepository.save(availability); 
                availability.start_slot=  element.start_slot;
                availability.end_slot=  element.end_slot;


                teacherAvailability[i++] = availability;

            });
    
            console.log('leadAvailability', teacherAvailability);
    
            user.teacherAvailability = teacherAvailability
            user.firstName = data.firstName;
            user.lastName = data.lastName;
            user.gender = data.gender;
            user.phoneNumber = data.phoneNumber;
            user.email= data.email;
            user.type = data.type;
            user.id = data.id;
            user.userId = data.userId;
            user.startDate = data.startDate;
            user.address = data.address;
            user.whatsapp = data.whatsapp;
            user.nationalityId = data.nationalityId;
            user.dob = data.dob;
            user.statusId = data.statusId;
            user.photo = data.photo;
            user.languages = data.languages;
            user.created_at = new Date();
            user.updated_at = new Date();
            user.teacherId = teacher.id;
            console.log('user', user);
            user = await this.usersRepository.save(user)
            return user;
        } catch(error){
        console.log(error);
        throw new Error('Excetion while stroing teacher');
        }
    }
    
    async listLeadDetails(data:any, parameters:any ) {
        var results:User[]=[];
        var leadView:LeadView[]=[];
        var map = new Map();  
        var leadTem:Teacher[] = [];
        var filter = false;
        var parametersList = [];
  
        map.set(0, 'Sun');     
        map.set(1, 'Mon');       
        map.set(2, 'Tue');   
        map.set(3, 'Wed');   
        map.set(4, 'Thu');  
        map.set(5, 'Fri');  
        map.set(6, 'Sat'); 

        //var offset =  parseInt(request.query['current']);
        var offset = parameters.current;
        var current = offset;
        //const limit  =  parseInt(request.query['pageSize']);
        var limit = parameters.pageSize;
        if (offset==1) {
            offset = 0;
        }

        // Read query parameters
        let query_list = [];
        let query_string='';

       // const date =  request.query['date'];;
       console.log(parameters);
       const date = parameters.date;
        if (date) {
            query_string = query_string + ` and le.joiningdate =  '${date}' ` ;
            query_list.push(` le.joiningdate =  '${date}' `);
        }

       // const name =  request.query['name'];
       const name =  parameters.name
        if (name) {
            query_string = query_string + ` and (u.firstName like '%${name}%' or u.lastName like '%${name}%' )` ;
            query_list.push(` (u.firstName like '%${name}%' or u.lastName like '%${name}%' ) `);
 
        }
        //const mobile =  request.query['mobile'];
        const mobile = parameters.phoneNumber;
        if (mobile) {
            query_string = query_string + ` and u.phoneNumber =${mobile} ` ;
            query_list.push(` u.phoneNumber =${mobile} `);
            console.log('query phonen umber ', mobile);
        }
        //var totalexp  =  request.query['totalexp'];
        var totalexp  =  parameters.totalexp;
        if (totalexp) {
            totalexp = parseFloat(totalexp);
            query_string = query_string + ` and le.totalexp =${totalexp} ` ;
            query_list.push(` le.totalexp =${totalexp} `);
        }
       // var classesTaken = request.query['classesTaken'];
       var classesTaken = parameters.classesTaken;
        if (classesTaken) {
            classesTaken = parseInt(classesTaken);
            query_string = query_string + ` and le.classestaken=${classesTaken} ` ;
            query_list.push(` le.classestaken=${classesTaken} `);
        }
        //var ratings = request.query['ratings'];
        var ratings = parameters.ratings;
        if (ratings) {
            ratings = parseInt(ratings);
            query_string = query_string + ` and le.ratings =${ratings} ` ;
            query_list.push(`  le.ratings =${ratings} `);
        }

       // let start_slot = request.query['start_slot'];
        var start_slot = parameters.start_slot;
        //let end_slot = request.query['end_slot'];
        var end_slot = parameters.end_slot;

        //let week_day  =  request.query['weekday'];
        var week_day = parameters.weekday;
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
              filter = true;
            var quer =  `select teacherId, weekday , start_slot, end_slot from teacher_availability where weekday in (  ${week_day}  ) and ${startMin} >= startMin and ${endMin}<=endMin;`;
            console.log('quer', quer);
            let totalResult = await getManager().query(quer);
            console.log('totalResult',totalResult);
            let slotsResultIds:any = [0]

            for (var element of totalResult) {
                slotsResultIds.push(element.teacherId);
            }

           // let slotsResultIds = totalResult.forEach((element)=>element.leadId);
            console.log('slotsResultIds', slotsResultIds);
            
            //let selectedIds = slotsResultIds.map(({ leadId }) => leadId);
           // console.log('ids', selectedIds);
            unique = Array.from(new Set(slotsResultIds)) 
            console.log('ids', unique);
            console.log('Query string is ', query_string);     
            if (unique) {
                query_string = query_string +` and u.teacherId in (${unique}) `;
                query_list.push(` u.teacherId in (${unique}) `);
            } else {
                query_string = query_string +` and u.teacherId in (0) `;
                query_list.push(`  u.teacherId in (0) `);
            }
         
        
    
          }

          
         
      //  console.log("Query start", query_string);
       // console.log("filter is ", filter);
        var finalQuery;
       var total;
         
       // if (query_string || query_list.length>0) {
            console.log("query string1234",query_string);
            query_list.forEach((value, index) => {
                query_string = ' where ';
               if (index != 0 && index !=query_list.length-1) {
                    query_string = query_list[index] + ' and '; 
                    console.log('query12345', query_string);
               } else {
                query_string = query_string + query_list[index];
               }
            });
            console.log("value sis ", query_string);
           // query_string = query_list && query_list.join(' and ') ;
             finalQuery = `select SQL_CALC_FOUND_ROWS concat(u.firstName , "  ", u.lastName) as name,  u.phoneNumber, u.email, concat(le.totalexp , "" , " Years") as exp, u.statusId as statusId, le.ratings as ratings, u.teacherId  as teacherId , u.userId as userId, u.teacherId, u.id as cosmos_ref, '' as slots, le.teachertype as leadtype, le.joiningdate as joiningdate, le.ratings as ratings, le.classestaken as classestaken, u.id as cosmos_ref, u.type from user u left join teacher le on u.teacherId=le.id  ${query_string} limit ` + (offset * limit) +","+ limit + `;`;
             //total = await getManager().query(`select count(*) as totalCount from user u left join teacher le on u.teacherId=le.id`);
          //  } //else {
            //finalQuery = `select concat(u.firstName , "  ", u.lastName) as name,  u.phoneNumber, u.email, concat(le.totalexp , "" , " Years") as exp, u.statusId as statusId, le.ratings as ratings, u.teacherId  as teacherId , u.userId as userId, u.teacherId,  u.id as comsmos_ref, '' as slots, le.teachertype as leadtype, le.joiningdate as joiningdate, le.ratings as ratings, le.classestaken as classestaken, u.id as cosmos_ref, u.type from user u left join teacher le on u.teacherId=le.id limit ` + (offset * limit) +","+ limit + `;`;
            //total = await getManager().query(`select count(*) as totalCount from user u `);
       // }
        
        console.log('finalQuery', finalQuery);
        results = await getManager().query(finalQuery);
        total = await getManager().query(`SELECT FOUND_ROWS() as total;`);
        console.log('results size', results.length);
        //var total = await getManager().query(`select count(*) as totalCount from user u inner join teacher le on u.teacherId=le.id and ${query_string};`);
         //console.log(total);
        //  results.forEach(async (element,index,self) => {     
          
        //if (results.length ==0) {
          //  if (query_string || filter) {
           //     console.log("true conditin");
            //    finalQuery = `select concat(u.firstName , "  ", u.lastName) as name,  u.phoneNumber, u.email, concat(0 , "" , " Years") as exp, u.statusId as statusId, 0 as ratings, u.teacherId  as teacherId , u.userId as userId, u.teacherId, u.id as cosmos_ref, '' as slots, '' as leadtype, '' as joiningdate, '' as ratings, '' as classestaken, u.id as cosmos_ref, u.type from user u where ${query_string} limit ` + (offset * limit) +","+ limit + `;`;
             //   } else {
              //  finalQuery = `select concat(u.firstName , "  ", u.lastName) as name,  u.phoneNumber, u.email, concat(0 , "" , " Years") as exp, u.statusId as statusId, 0 as ratings, u.teacherId  as teacherId , u.userId as userId, u.teacherId,  u.id as comsmos_ref, '' as slots, '' as leadtype, '' as joiningdate, '' as ratings, '' as classestaken, u.id as cosmos_ref, u.type from user u  limit ` + (offset * limit) +","+ limit + `;`;
    
  //          }
    //        results = await getManager().query(finalQuery);
            
      //  }
        for (const element  of results ) {  
            let slotsResult:any[] = [];   
            //console.log(element.leadId);
             var quer =  "select weekday , start_slot, end_slot from teacher_availability where teacherId="+element.teacherId + ";"
            slotsResult = await getManager().query(quer);
            var slot = "";
            slotsResult.forEach((element) => {
                if (!element.start_min) {
                    element.start_min = "00";
                }
                if (!element.end_min) {
                    element.end_min = "00";
                }
                slot = slot + map.get(element.weekday) + ": " + element.start_slot+":"+element.start_min + " to " + element.end_slot +":"+element.end_min + " ";
            });
            var yourDate;
            if (element.joiningdate) {
                yourDate = new Date(element.joiningdate).toISOString().split('T')[0];
            }
           // console.log('yourDate', yourDate);
            var  l = new LeadView(element.userId, element.id, element.teacherId, yourDate,  element.name, element.exp, 
            element.phoneNumber,element.email,element.statusId,
            element.classestaken,element.ratings,slot, element.leadtype, element.type);
        
            leadView.push(l);
          
        };
        
      
        return {"success":true,"data": leadView, "total":total[0].total, "current":current, pageSize:limit};
    }

    
   
    async leadFullDetails(data:any, teacherId:number) {
      
        var map = new Map();  
        var leadTem:Teacher[] = [];
  
        map.set(0, 'Sun');     
        map.set(1, 'Mon');       
        map.set(2, 'Tue');   
        map.set(3, 'Wed');   
        map.set(4, 'Thu');  
        map.set(5, 'Fri');  
        map.set(6, 'Sat'); 

        let slotsResult:any[] = []; 
        let users = new User();   
        const leadId = teacherId;
        console.log('leadid', leadId);
        console.log(users)
        users = await getManager().createQueryBuilder(User, "user")
        .where("user.userId = :id", { id: leadId }).getOne();

        console.log('users' , users);
        var teacherId:number ;
        if (users != null) {
            teacherId = users.teacherId;
        }
       console.log("teacher id ", teacherId)
        const lead = await getManager().createQueryBuilder(Teacher, "teacher")
        .where("teacher.id = :id", { id: teacherId }).getOne();
        leadTem[0] = lead;
        console.log(users);
        if (lead && leadTem)
             users.teacher = leadTem;
        const leadav:TeacherAvailability[] = [];
        const list:any = await getManager().createQueryBuilder(TeacherAvailability, "teacherAvailability")
        .where("teacherAvailability.teacherId = :id", { id: teacherId }).getMany();
        if (users)
            users.teacherAvailability=list;
        var quer =  "select weekday , start_slot, end_slot, start_min, end_min from teacher_availability where teacherId="+teacherId + ";"
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
        slot = slot + map.get(element.weekday) + ":" + element.start_slot + ":" +element.start_min+ " to " + element.end_slot +":" + element.end_min + " ";
        });
        if (slot)
            users.slots=slot;

        return {"success":true,"data": users, "total":1, "current":1, pageSize:1};
    }
 

}

function options(options: any, arg1: (res: any) => void) {
    throw new Error("Function not implemented.");
}
