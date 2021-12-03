
import {Any, getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {User} from "../entity/User";
import { Teacher as Teacher } from "../entity/Teacher";
import { LeadView } from "../model/LeadView";
import { TeacherAvailability as TeacherAvailability } from "../entity/TeacherAvailability";
import { getManager } from "typeorm";
import { BatchAvailability } from "../entity/BatchAvailability";
import { BatchStudent } from "../entity/BatchStudent";
import { Classes } from "../entity/Classes";


export class BatchService {

    private classesRepository = getRepository(Classes);
    private batchAvailabilityRepository = getRepository(BatchAvailability);
    private batchStudentRepository = getRepository(BatchStudent);


    BatchService(){ }
 

    async createBatch(data:any) {
        var cosmos = new Classes();

        try{
          var batchAvailability:BatchAvailability[] = [];
          var batchStudent:BatchStudent[] = [];
          var classes = new Classes();
            let i = 0;
              classes.classCode = data.classCode;
              classes.batchNumber = data.batchNumber;
              classes.teacherId = data.teacherId;
    
              classes.startingLessonId = data.startingLessonId;
              classes.endingLessonId = data.endingLessonId;
              classes.classStartDate = data.classStartDate;
    
              classes.classEndDate = data.classEndDate;
              classes.lessonStartTime = data.lessonStartTime;
              classes.lessonEndTime = data.lessonEndTime;
    
              classes.version = data.version;
              classes.ageGroup = data.ageGroup;
              classes.type = data.type;
              classes.createdBy = data.createdBy;

              classes.created_at= new Date();
              classes.updated_at= new Date();

              if (data.id) {
                classes.id = data.id;
              } 

              classes = await this.classesRepository.save(classes);         
                

          if (data.batchAvailability) {
            console.log("batchAvailability classes");
            let i = 0;
            for (const element of data.batchAvailability) {
          var batchAvail = new BatchAvailability();
          batchAvail.start_date= new Date();
          batchAvail.end_date= new Date();
          if (element.start_slot){
            let time = element.start_slot.split(":");
            batchAvail.start_slot = time[0];   
            console.log('time is ', time);
            batchAvail.start_min = time[1];
            batchAvail.startMin = time[0] * 60 + time[1];
            
         }
         if (element.end_slot){
             let time = element.end_slot.split(":");
             batchAvail.end_slot = time[0]
             console.log('time is ', time);;
             batchAvail.end_min = time[1];
             batchAvail.endMin = time[0] * 60 + time[1];  
          }

          batchAvail.weekday = element.weekday;
          batchAvail.created_at = new Date();
          batchAvail.updated_at = new Date();
          if (element.id) {
            batchAvail.id = element.id;
          } else if(classes.id) {
            batchAvail.id = classes.id;
          }

          batchAvail = await this.batchAvailabilityRepository.save(batchAvail); 
          classes.batchAvailability = batchAvail;
        }
       
          if (data.students) {
            let i = 0;
            for (const element of data.students) {
              console.log("Batch student");
                var batchStud = new BatchStudent();
                batchStud.type = element.type;
                batchStud.studentId = element.id;
                batchStud.batchId = classes.id;
                batchStud.created_at = new Date();
                batchStud.updated_at = new Date();
                batchStud = await this.batchStudentRepository.save(batchStud); 
                batchStudent[i++]=batchStud;
                };
            }
            classes.students = batchStudent;  
          }

        return classes;
      } catch(error){
      console.log(error);
      throw new Error('Excetion while stroing teacher');
      }
}



}
