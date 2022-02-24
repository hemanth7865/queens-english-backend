import { Any, getConnection, getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { Teacher as Teacher } from "../entity/Teacher";
import { LeadView } from "../model/LeadView";
import { TeacherAvailability as TeacherAvailability } from "../entity/TeacherAvailability";
import { getManager } from "typeorm";
import { v4 as uuid } from "uuid";
import axios from "axios";
import { stringify } from "querystring";
import { join } from "path";
import { Student } from "../entity/Student";
import { LQSEntry } from "../entity/LQSEntry";
const { usersLogger } = require("../Logger.js");

export class LQSService {
   

    private lQSRepository = getRepository(LQSEntry);
    private userRepository = getRepository(User);

   async createStudents() {
     //  var lqsEntries = this.lQSRepository.find();
     usersLogger.info('updating LQS entries in user table::Start');
       var lqsEntries = await getManager().query('SELECT * from  lsqentry');
       for (let element of lqsEntries ) {
           var user = new User();
           user.id = element.id;
           user.firstName = element.firstName;
           user.lastName = element.lastName ? element.lastName: 'DUMMY';
           user.phoneNumber = element.phoneNumber;
           user.dob = element.dob;
           user.email = element.email? element.email : 'DUMMY';
           user.whatsapp = element.whatsapp;
           user.status = 'enrolled';
           user.type='student';
           this.userRepository.save(user);
       }
       usersLogger.info('updating LQS entries in user table::End');
    }


    async fetchLQSData() {
      const options = {
        url: `https://api-in21.leadsquared.com/v2/LeadManagement.svc/Leads.Get?accessKey=u$rfe9967b7a21449a66478af36236fc9e2&secretKey=ccfcd6e8d0e58b350262f00142fbccddd1ac3770`,
        json: true,
        body: {
            "Parameter": {
                "LookupName": "ProspectStage",
                "LookupValue": "Enrolled",
                "SqlOperator": "="
            },
            "Columns": {
                "Include_CSV": "ProspectID, FirstName, LastName, EmailAddress, mx_WhatsApp_Phone_Number, mx_Date_of_Birth,Phone"
            },
            "Sorting": {
                "ColumnName": "ModifiedOn",
                "Direction": "1"
            },
            "Paging": {
                "PageIndex": 1,
                "PageSize": 100
            }
        },
      };
      
    

      var status;
      var res1={} ;
    
      res1= await axios
        .post(options.url, options.body)
        .then(async (res) => {
          usersLogger.info("Fetching data from LQS "); 
          usersLogger.info(res); 
          usersLogger.info(res.data); 
          if (res.data) {
            for (let element of res.data) {
                var lqsEntry = new LQSEntry();
                lqsEntry.id = element.ProspectID;
                usersLogger.info(element.ProspectID); 
                lqsEntry.firstName = element.FirstName;
                lqsEntry.lastName = element.LastName;
                lqsEntry.email = element.EmailAddress;
                lqsEntry.phoneNumber = element.Phone;
                lqsEntry.whatsapp = element.mx_WhatsApp_Phone_Number;
                lqsEntry.dob = element.mx_Date_of_Birth;
                this.lQSRepository.save(lqsEntry);
          }
        }
        return res.data;      
        
        })
        .catch((error) => {    
          usersLogger.info(`Error while fetching Data from LQS ${error}`);
          return {status:400,error:error?.response?.data};
          return Promise.reject(error);
        });
        usersLogger.info("Data fetch completed from LQS", res1[0].ProspectID);
        return res1;
    }
    
    async saveTeacher(data: any) {

    }

}