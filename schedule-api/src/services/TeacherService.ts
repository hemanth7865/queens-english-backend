
import {Any, getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {User} from "../entity/User";
import { Teacher as Teacher } from "../entity/Teacher";
import { LeadView } from "../model/LeadView";
import { TeacherAvailability as TeacherAvailability } from "../entity/TeacherAvailability";
import { getManager } from "typeorm";
import { v4 as uuid } from "uuid";

const https = require('https')


export class TeacherService {

    private usersRepository = getRepository(User);
    private teacherAvailabilityRepository = getRepository(TeacherAvailability);
    private teacherRepository = getRepository(Teacher);

    TeacherService(){ }

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
            if (data.lead) {
                for (let element of data.lead){
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
                    user.id = teacher.id;
                    user.teacher=[teacher];
                }
            }
            
    
            let i = 0;
            if (data.leadAvailability) {
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
        }
    
            console.log('leadAvailability', teacherAvailability);
    
            user.teacherAvailability = teacherAvailability
            user.firstName = data.firstName;
            user.lastName = data.lastName;
            user.gender = data.gender;
            user.phoneNumber = data.phoneNumber;
            user.email= data.email;
            user.type = data.type;             
            if (data.id)
                user.id = data.id;
            user.startDate = data.startDate;
            user.address = data.address;
            user.whatsapp = data.whatsapp;
            user.nationalityId = data.nationalityId;
            user.dob = data.dob;
            user.status = data.status;
            user.photo = data.photo;
            user.languages = data.languages;
            user.created_at = new Date();
            user.updated_at = new Date();
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

        var offset = parameters.current;
        var current = offset;
        var limit = parameters.pageSize;
        if (offset==1) {
            offset = 0;
        }


        let query_list = [];
        let query_string='';
       console.log(parameters);
       const date = parameters.date;
        if (date) {
            query_string = query_string + ` and le.joiningdate =  '${date}' ` ;
            query_list.push(` le.joiningdate =  '${date}' `);
        }

       const name =  parameters.name
        if (name) {
            query_string = query_string + ` and (u.firstName like '%${name}%' or u.lastName like '%${name}%' )` ;
            query_list.push(` (u.firstName like '%${name}%' or u.lastName like '%${name}%' ) `);
 
        }
        const mobile = parameters.phoneNumber;
        if (mobile) {
            query_string = query_string + ` and u.phoneNumber =${mobile} ` ;
            query_list.push(` u.phoneNumber =${mobile} `);
            console.log('query phonen umber ', mobile);
        }

        const type = parameters.type;
        if (type) {
            query_string = query_string + ` and u.type like '%${type}%' ` ;
            query_list.push(` u.type like '%${type}%'  `);
            console.log('user typer ', type);
        }

        var totalexp  =  parameters.totalexp;
        if (totalexp) {
            totalexp = parseFloat(totalexp);
            query_string = query_string + ` and le.totalexp =${totalexp} ` ;
            query_list.push(` le.totalexp =${totalexp} `);
        }

       var classesTaken = parameters.classesTaken;
        if (classesTaken) {
            classesTaken = parseInt(classesTaken);
            query_string = query_string + ` and le.classestaken=${classesTaken} ` ;
            query_list.push(` le.classestaken=${classesTaken} `);
        }

        var status = parameters.status;
        if (status) {
            status = parseInt(status);
            query_string = query_string + ` and u.status=${status} ` ;
            query_list.push(` u.status=${status} `);
        }


        var ratings = parameters.ratings;
        if (ratings) {
            ratings = parseInt(ratings);
            query_string = query_string + ` and le.ratings =${ratings} ` ;
            query_list.push(`  le.ratings =${ratings} `);
        }


        var start_slot = parameters.start_slot;
        var end_slot = parameters.end_slot;

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
            var quer =  `select id, weekday , start_slot, end_slot from teacher_availability where weekday in (  ${week_day}  ) and ${startMin} >= startMin and ${endMin}<=endMin;`;
            console.log('quer', quer);
            let totalResult = await getManager().query(quer);
            console.log('totalResult',totalResult);
            let slotsResultIds:any = [0]

            for (var element of totalResult) {
                slotsResultIds.push(element.id);
            }

            unique = Array.from(new Set(slotsResultIds)) 
            console.log('Query string is ', query_string);     
            if (unique) {
                query_string = query_string +` and u.id in (${unique}) `;
                query_list.push(` u.id in (${unique}) `);
            } else {
                query_string = query_string +` and u.id in (0) `;
                query_list.push(`  u.id in (0) `);
            } 
        
    
          }

        var finalQuery;
        var total;
         
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
          
             finalQuery = `select SQL_CALC_FOUND_ROWS concat(u.firstName , "  ", u.lastName) as name,  u.phoneNumber, u.email, concat(le.totalexp , "" , " Years") as exp, u.status as status, le.ratings as ratings, u.id  as teacherId , u.id as userId, u.id, u.id as cosmos_ref, '' as slots, le.teachertype as leadtype, le.joiningdate as joiningdate, le.ratings as ratings, le.classestaken as classestaken, u.id as cosmos_ref, u.type from user u left join teacher le on u.id=le.id  ${query_string} limit ` + (offset * limit) +","+ limit + `;`;
                     
        console.log('finalQuery', finalQuery);
        results = await getManager().query(finalQuery);
        total = await getManager().query(`SELECT FOUND_ROWS() as total;`);
        console.log('results size', results.length);
        
        for (const element  of results ) {  
            let slotsResult:any[] = [];   

             var quer =  "select weekday , start_slot, end_slot from teacher_availability where teacherId='"+element.teacherId + "';"
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

            var  l = new LeadView(element.id, element.teacherId, yourDate,  element.name, element.exp, 
            element.phoneNumber,element.email,element.status,
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
        .where("user.id = :id", { id: leadId }).getOne();

        console.log('users' , users);
       
       console.log("teacher id ", teacherId)
        const lead = await getManager().createQueryBuilder(Teacher, "teacher")
        .where("teacher.id = :id", { id: leadId }).getOne();
        leadTem[0] = lead;
        console.log(users);
        if (lead && leadTem)
             users.teacher = leadTem;
        const leadav:TeacherAvailability[] = [];
        const list:any = await getManager().createQueryBuilder(TeacherAvailability, "teacherAvailability")
        .where("teacherAvailability.id = :id", { id: leadId }).getMany();
        if (users)
            users.teacherAvailability=list;
        var quer =  "select weekday , start_slot, end_slot, start_min, end_min from teacher_availability where teacherId='"+teacherId + "';"
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
