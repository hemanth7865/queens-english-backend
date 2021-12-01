
import {Any, getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {User} from "../entity/User";
import { Teacher as Teacher } from "../entity/Teacher";
import { LeadView } from "../model/LeadView";
import { TeacherAvailability as TeacherAvailability } from "../entity/TeacherAvailability";
import { getManager } from "typeorm";
import { Batch } from "../entity/Batch";
import { BatchAvailability } from "../entity/BatchAvailability";
import { BatchStudent } from "../entity/BatchStudent";
import { Classes } from "../entity/Classes";


export class BatchService {

    private classesRepository = getRepository(Classes);
    private batchAvailabilityRepository = getRepository(BatchAvailability);
    private batchStudentRepository = getRepository(BatchStudent);
    private batchRepository = getRepository(Batch);


    BatchService(){ }
 

    async createBatch(data:any) {
        var cosmos = new Classes();

        try{
          var batchAvailability:BatchAvailability[] = [];
          var batchStudent:BatchStudent[] = [];
          var batchItem:Batch[] = [];
          var classes = new Classes();
          if (data.classes) {
            console.log("Reading classes");
            let i = 0;
            for (const element of data.classes) {
              classes.classCode = element.classCode;
              classes.batchNumber = element.batchNumber;
              classes.teacherId = element.teacherId;
    
              classes.startingLessonId = element.startingLessonId;
              classes.endingLessonId = element.endingLessonId;
              classes.classStartDate = element.classStartDate;
    
              classes.classEndDate = element.classEndDate;
              classes.lessonStartTime = element.lessonStartTime;
              classes.lessonEndTime = element.lessonEndTime;
    
              classes.version = element.version;
              classes.ageGroup = element.ageGroup;
              classes.type = element.type;
              classes = await this.classesRepository.save(classes);         
                }
            }
            console.log ("Classes id is ", classes);

          var batch = new Batch();
          batch.creationDate = data.creationDate;
          batch.endDate = data.endDate;
          batch.teacherId = data.teacherId;
          batch.createdBy = 'Admin';
          batch.created_at = new Date();
          batch.updated_at = new Date();
          batch.classes = classes;
          if (classes.id) {
            batch.id = classes.id;
          }
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
          batch.batchAvailability = batchAvail;
        }
       
          if (data.students) {
            let i = 0;
            for (const element of data.students) {
                var batchStud = new BatchStudent();
                batchStud.type = element.type;
                batchStud.studentId = element.id;
                if (element.id)
                  batchStud.id = element.id;
                batchStud.created_at = new Date();
                batchStud.updated_at = new Date();
                batchStud = await this.batchStudentRepository.save(batchStud); 
                batchStudent[i++]=batchStud;
                };
            }
            batch.students = batchStudent;  
          }

          batch = await this.batchRepository.save(batch); 

          return batch;
      } catch(error){
      console.log(error);
      throw new Error('Excetion while stroing teacher');
      }
}

async createBatch1(data:any) {
  var cosmos = new Classes();

  try{
    var batchAvailability:BatchAvailability[] = [];
    var batchStudent:BatchStudent[] = [];
    var batchItem:Batch[] = [];
    var classes = new Classes();
    if (data.classes) {
      console.log("Reading classes");
      let i = 0;
      for (const element of data.classes) {
        classes.classCode = element.classCode;
        classes.batchNumber = element.batchNumber;
        classes.teacherId = element.teacherId;

        classes.startingLessonId = element.startingLessonId;
        classes.endingLessonId = element.endingLessonId;
        classes.classStartDate = element.classStartDate;

        classes.classEndDate = element.classEndDate;
        classes.lessonStartTime = element.lessonStartTime;
        classes.lessonEndTime = element.lessonEndTime;

        classes.version = element.version;
        classes.ageGroup = element.ageGroup;
        classes.type = element.type;
        classes = await this.classesRepository.save(classes);         
          }
      }
      console.log ("Classes id is ", classes);

    var batch = new Batch();
    batch.creationDate = new Date();
    batch.endDate = new Date()
    batch.teacherId = data.teacherId;
    batch.userId = data.userId;
    batch.creationDate = data.startDate;
    batch.endDate = data.endDate;
    batch.createdBy = 'Admin';
    batch.created_at = new Date();
    batch.updated_at = new Date();
    batch.classes = classes;
    if (classes.id) {
      batch.id = classes.id;
    }
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
    batch.batchAvailability = batchAvail;
  }
 
    if (data.students) {
      let i = 0;
      for (const element of data.students) {
          var batchStud = new BatchStudent();
          batchStud.type = element.type;
          batchStud.studentId = element.id;
          if (element.id)
            batchStud.id = element.id;
          batchStud.created_at = new Date();
          batchStud.updated_at = new Date();
          batchStud = await this.batchStudentRepository.save(batchStud); 
          batchStudent[i++]=batchStud;
          };
      }
      batch.students = batchStudent;  
    }
    return batch;
} catch(error){
console.log(error);
throw new Error('Excetion while stroing teacher');
}
}

}
