import { getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { getManager } from "typeorm";
import { BatchService } from "../services/BatchService";
import { Classes } from "../entity/Classes";
import { UserMaster } from "../entity/UserMaster";
var moment = require('moment');
const cron = require('node-cron');

export class BatchController {

    private usersRepository = getRepository(User);
    private classesRepository = getRepository(Classes);
    private userMasterRepository = getRepository(UserMaster);
    private batchService = new BatchService();


    async createBatch(request: Request, response: Response, next: NextFunction) {
        console.log("saving batch");
        var batch;
        try {
            batch = await this.batchService.createBatch(request.body);
        } catch (error) {
            console.log()
        }
        return { "success": true, "data": [batch], "total": 1 };
    }

    async deleteBatch(request: Request, response: Response, next: NextFunction) {
        console.log("saving batch");
        var batch;
        try {
            batch = await this.batchService.deleteBatch(request.params);
        } catch (error) {
            console.log()
        }
        return { "success": true, "data": batch };
    }

    async listBatch(request: Request, response: Response, next: NextFunction) {
        console.log("Batch List");
        var parameters = {
            current: request.query['current'],
            pageSize: request.query['pageSize'],
            batchId: request.query['batchId'],
            createdBy: request.query['createdBy'],
            start_slot: request.query['start_slot'],
            end_slot: request.query['end_slot'],
            teacher: request.query['teacher'],
            students: request.query['students'],
            date: request.query['date'],
            week_day: request.query['weekday'],
        }
        let res;
        try {
            res = await this.batchService.listBatch(request.body, parameters);
            return res;
        } catch (error) {
            console.log(error);
        }
    }


    async getBatchDetails(request: Request, response: Response, next: NextFunction) {
        var res;
        try {
            res = await this.batchService.getBatchDetails(request.params.id);
            return res;
        } catch (error) {
            console.log(error);
        }
    }


    async runBatchJob(request: Request, response: Response, next: NextFunction) {

            var current = parseInt(request.query['current']);
            var pageSize = parseInt(request.query['pageSize']);

            var total = await getManager().query(`SELECT count(*) FROM USER_MASTER`);
            var results = await getManager().query(`SELECT id FROM USER_MASTER`);
            console.log('results',results);
            var total = await getManager().query(`SELECT FOUND_ROWS() as total;`);
            console.log('total is ',total[0].total);
            console.log('total is ',results[0].id);
            for (var count=0;count<total[0].total;count++) {
                try{
                console.log('Result is ', results[count].id);
                var condition = {
                    where: { id: results[count].id },
                  };
                
                var userMaster = await this.userMasterRepository.findOne(condition);
                let user = new User();
                user.id = userMaster.id;
                user.firstName=userMaster.firstName;
                user.lastName=userMaster.lastName;
                user.email = userMaster.email;
                user.type = userMaster.type;
                user.phoneNumber = userMaster.phoneNumber;
                this.usersRepository.save(user);
            }catch(error){                
                console.log('error',error);
            }
        }
        
            
        return { "success": true, "message": "Job execution initiated !!!!" };
    }



    async remove(request: Request, response: Response, next: NextFunction) {
        console.log("Delete Batch");
        try {
            console.log('request.params.id' + request.params.id);
            let classesToRemove = await this.classesRepository.findOne(request.params.id);
            classesToRemove.status = 4;
            return this.classesRepository.save(classesToRemove);
        } catch (error) {
            return { success: false, error: error.toString() };
        }
    }
}