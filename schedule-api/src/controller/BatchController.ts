import { getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { getManager } from "typeorm";
import { BatchService } from "../services/BatchService";
import { Classes } from "../entity/Classes";
var moment = require('moment');
const cron = require('node-cron');

export class BatchController {

    private usersRepository = getRepository(User);
    private classesRepository = getRepository(Classes);
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

        var task = cron.schedule('*/10 * * * *', async function () {
            var quer = `select id,  batchNumber, lessonStartTime, lessonEndTime from classes limit 1, 2;`;
            console.log("Query ", quer);
            var results = await getManager().query(quer);
            let start_slot, start_min, startMin, end_slot, end_min, endMin = 0;
            for (var element of results) {
                try {
                    start_slot = parseInt(element.lessonStartTime.substring(11, 13));
                    start_min = parseInt(element.lessonStartTime.substring(15, 17));
                    console.log('start_slot', start_slot);
                    let startMin = start_min + start_slot * 60;
                    end_slot = parseInt(element.lessonEndTime.substring(11, 13));
                    end_min = parseInt(element.lessonEndTime.substring(15, 17));
                    let endMin = end_slot * 60 + end_min;
                    var results = await getManager().query(`UPDATE classes SET start_slot=${start_slot}, start_min=${start_min}, startMin=${startMin}, end_slot=${end_slot}, end_min=${end_min}, endMin = ${endMin}  WHERE id = '${element.id}';`);
                    console.log("cron job started", results);
                } catch (error) {
                    return { success: false, error: error.toString() };
                }
            }


        }, false);
        task.start();
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