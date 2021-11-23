
import {Any, getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {User} from "../entity/User";
import { Teacher as Teacher } from "../entity/Teacher";
import { LeadView } from "../model/LeadView";
import { TeacherAvailability as TeacherAvailability } from "../entity/TeacherAvailability";
import { getManager } from "typeorm";
import { Batch } from "../entity/Batch";
import { BatchAvailability } from "../entity/BatchAvailability";
import { CosmosClass } from "../entity/CosmosClass";


export class BatchService {

    private cosmosRepository = getRepository(CosmosClass);


    BatchService(){ }

    
     uat =  {
        apiEndpoint: 'https://ed-uat-functions.azurewebsites.net/api',
        apiKey: 'NOW2ifNPyTeNEN751YkUoY8YWhv8UkQrJbJPE4wHT2WFMI7afSVh5g=='
      }

     API_URL = this.uat.apiEndpoint;
   API_KEY = this.uat.apiKey;
   ADMIN_TOKEN = `eyJhbGciOiJIUzI1NiJ9.eyJwaG9uZU51bWJlciI6Iis5MTk5OTgyOTM5MjQiLCJvdHAiOiIzMjg3NDUiLCJleHBpcnkiOjE2MzY3MDIzNjUyNTd9.UKfATwq2UXnD6qsgVkrPn8B-oYI3NbsG5LwYSFhZpjI`;
 

    async saveTeacherOnCosmosDB() {
        var cosmos = new CosmosClass();

        cosmos.id = ''  ,     
        cosmos.classCode='';
        cosmos.batchNumber='';    
        cosmos.teacherId='';    
        cosmos.endingLessonId='';   
        cosmos.classEndDate=new Date();   
        cosmos.noofclasses=1; 
        cosmos.lessonStartTime=new Date();
        cosmos.lessonEndTime=new Date();
        cosmos.version='';
        cosmos.ageGroup=''; 
        cosmos.type='';   
        cosmos.created_at=new Date();    
        cosmos.updated_at=new Date()
        cosmos = await this.cosmosRepository.save(cosmos);
        return cosmos;

    }
}
