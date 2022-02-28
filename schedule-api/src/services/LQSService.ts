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
  private COSMOS_URL = process.env.COSMOS_URL;
  private COSMOS_CODE = process.env.COSMOS_CODE;
  private LSQ_ACCESS_KEY = process.env.LSQ_ACCESS_KEY;
  private LSQ_SECRETKEY = process.env.LSQ_SECRETKEY;
  private LSQ_URL = process.env.LSQ_URL;
   

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
           try {
            await this.updateCosmos(user);
            this.userRepository.save(user);             
           } catch (error) {
             usersLogger.info("Failed during LSQ update");
           }
           
       }
       usersLogger.info('updating LQS entries in user table::End');
    }


  async updateCosmos(user: User) {
    const options = {
      url: `${this.COSMOS_URL}/api/user/?code=${this.COSMOS_CODE}`,
      json: true,
      body: {
        type: user.type,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdministrator: false,
        phoneNumber: user.phoneNumber,
        status:user.status
      },
    };

    if (user.id) {
      options.body["id"] = user.id;
    }
    await axios
      .post(options.url, options.body)
      .then(async (res) => {
        usersLogger.info(`Successfully updated cosmos db for id ${user.id} `);
        return user;
      })
      .catch((error) => {  
        usersLogger.info(`Failed during LSQ update ${error}`);
        return {status:400,error:error?.response?.data};
        return Promise.reject(error);
      });
  }

    async fetchLQSData() {
      const options = {
        url: `${this.LSQ_URL}/Leads.Get?accessKey=${this.LSQ_ACCESS_KEY}&secretKey=${this.LSQ_SECRETKEY}`,
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