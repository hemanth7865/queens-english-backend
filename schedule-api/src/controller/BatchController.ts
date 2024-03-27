import { getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { getManager } from "typeorm";
import { BatchService } from "../services/BatchService";
import { Classes } from "../entity/Classes";
import { UserMaster } from "../entity/UserMaster";
import { parse } from 'csv-parse';

var moment = require('moment');
const cron = require('node-cron');

export class BatchController {

    private usersRepository = getRepository(User);
    private classesRepository = getRepository(Classes);
    private userMasterRepository = getRepository(UserMaster);
    private batchService = new BatchService();

    async createBatch(request: Request, response: Response, next: NextFunction) {
        var batch;
        try {
            request.body.authUser = request.user;
            batch = await this.batchService.createBatch(request.body);
        } catch (error) {
            console.log()
        }
        return { "success": true, "data": [batch], "total": 1 };
    }

    async reBatch(request: Request, response: Response, next: NextFunction) {
        if (!request.body.studentId) {
            return { status: 400, errors: ['Please Provide Correct Student Information'] };
        }
        var studentAlreadyExists;
        if (request.body.batchId) {
            studentAlreadyExists = await this.batchService.checkStudentExistsInBatch(request.body);

            if (studentAlreadyExists.data.length > 0) {
                return {
                    status: 400,
                    errors: [`Student ${studentAlreadyExists.data.firstName} ${studentAlreadyExists.data.middleName} ${studentAlreadyExists.data.lastName} of class ${studentAlreadyExists.data.classSection} already exist in the selected batch.`]
                }
            }
        }
        var batch;
        try {
            batch = await this.batchService.reBatch(request.body);
        } catch (error) {
            console.log();
            batch = { status: 400, errors: ["Something went wrong while creating/updating the batch."] }
        }
        return batch;
    }

    async bulkReBatchStudents(request: Request, response: Response, next: NextFunction) {
        var resp = [];
        const studentIds = request.body.studentIds;

        for (const studentId of studentIds) {
            const result = await this.reBatch({
                body: {
                    studentId: studentId,
                    batchId: request.body.batchId,
                    bulkRebatch: request.body.bulkRebatch ? request.body.bulkRebatch : false,
                    removeFromBatch: request.body.removeFromBatch
                }
            }, response, next);

            resp.push(result);
        }

        return {
            "success": true,
            "data": resp, "total": 1
        }

    }

    async deleteBatch(request: Request, response: Response, next: NextFunction) {
        var batch;
        try {
            batch = await this.batchService.deleteBatch(request.params);
        } catch (error) {
            console.log()
        }
        return { "success": true, "data": batch };
    }

    async listBatch(request: Request, response: Response, next: NextFunction) {
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
            startingLessonId: request.query['startingLessonId'],
            activeLessonId: request.query['activeLessonId'],
            age: request.query['age'],
            frequency: request.query['frequency'],
            lessonStartTime: request.query['lessonStartTime'],
            lessonEndTime: request.query['lessonEndTime'],
            classStartDate: request.query['classStartDate'],
            maxStudentsCount: request.query['maxStudentsCount'],
            excludedTeacher: request.query['excludedTeacher'],
            excludeCurrentBatchId: request.query['excludeCurrentBatchId'],
            lessonGap: request.query['lessonGap'],
            classEndDate: request.query['classEndDate'],
            lessonNumber: request.query['lessonNumber'],
            schoolName: request.query['schoolName'],
            offlineBatch: request.query['offlineBatch'],
            schoolId: request.query['schoolId']
        }
        let res;
        try {
            res = await this.batchService.listBatch(request.body, parameters);
            return res;
        } catch (error) {
            console.log(error);
        }
    }

    async getCosmosBatch(request: Request, response: Response, next: NextFunction) {
        var res;
        try {
            res = await this.batchService.getCosmosBatch(request.params.id);
            return res;
        } catch (error) {
            console.log(error);
        }
    }

    async updateCosmosBatch(request: Request, response: Response, next: NextFunction) {
        var res;
        try {
            res = await this.batchService.updateCosmosBatch(request.body);
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
        console.log('results', results);
        var total = await getManager().query(`SELECT FOUND_ROWS() as total;`);
        console.log('total is ', total[0].total);
        console.log('total is ', results[0].id);
        for (var count = 0; count < total[0].total; count++) {
            try {
                console.log('Result is ', results[count].id);
                var condition = {
                    where: { id: results[count].id },
                };

                var userMaster = await this.userMasterRepository.findOne(condition);
                let user = new User();
                user.id = userMaster.id;
                user.firstName = userMaster.firstName;
                user.lastName = userMaster.lastName;
                user.email = userMaster.email;
                user.type = userMaster.type;
                user.phoneNumber = userMaster.phoneNumber;
                this.usersRepository.save(user);
            } catch (error) {
                console.log('error', error);
            }
        }


        return { "success": true, "message": "Job execution initiated !!!!" };
    }



    async remove(request: Request, response: Response, next: NextFunction) {
        try {
            let classesToRemove = await this.classesRepository.findOne(request.params.id);
            classesToRemove.status = 4;
            return this.classesRepository.save(classesToRemove);
        } catch (error) {
            return { success: false, error: error.toString() };
        }
    }

    async updateAllBatchesAgeGroup(request: Request, response: Response, next: NextFunction) {
        try {
            return await this.batchService.updateAllBatchesAgeGroup();
        } catch (error) {
            console.log(error);
        }
    }

    async updateBatchZoomInfoAndWACSV(request: Request, response: Response, next: NextFunction) {
        const file = request.files.students;
        let data = [];

        try {
            await new Promise(function (myResolve: any, myReject: any) {
                parse(file.data.toString(), { columns: true, trim: true }, function (e, records) {
                    data = records;
                    if (data) {
                        myResolve();
                    } else {
                        console.log(file.data.toString());
                        myReject();
                    }
                });
            });
            return this.batchService.updateBatchZoomInfoAndWACSV(data, request.query);
        } catch (e) {
            return { e, name: file.name, size: file.size, type: file.type };
        }
    }

    async updateBatchEndDate(request: Request, response: Response, next: NextFunction) {
        try {
            const batch = await this.batchService.updateBatchEndDate(request.body);
            return { "success": true, "data": batch };
        } catch (error) {
            console.log()
            return { success: false, error: error.toString() };
        }
    }

    async checkStudentBatches(request: Request, response: Response, next: NextFunction) {
        const data = request.body;
        let isPresent: any;
        try {
            isPresent = await this.batchService.checkStudentBatches(data.students, data.id);
            return { success: true, data: isPresent, total: 1 }
        } catch (error) {
            return { success: false, error: error.toString() };
        }
    }

    async bulkRemoveStudentsFromBatch(request: Request, response: Response, next: NextFunction) {
        try {
            return await this.batchService.removeStudents(request.body.students, request.body.batch);
        } catch (error) {
            return { success: false, error: error.toString() };
        }
    }

    async updateBatchStartDate(
        request: Request,
        response: Response,
        next: NextFunction
    ) {
        try {
            const { batchId, startDate } = request.body;
            const res = await this.batchService.updateBatchStartDate(
                batchId,
                startDate
            );
            if (res.success) {
                response.status(200).send(res.data);
            } else {
                response.status(400).send({
                    message: "Something went wrong while updating the batch.",
                    error: res.data,
                });
            }
        } catch (error) {
            response.status(500).send({
                message:
                    error?.message || "Some error occurred while updating the batch.",
            });
        }
    }

    async changeActiveLesson(
        request: Request,
        response: Response,
    ) {
        try {
            const { batchId, lessonNumber, reason } = request.body;
            const user = request.user;
            if (!reason || !lessonNumber || !batchId) {
                let message = "Please provide a ";
                if (!reason) message += "reason";
                else if (!lessonNumber) message += "lesson number";
                else if (!batchId) message += "batch id";
                message += " to change the active lesson.";
                response.status(400).send({ message });
            }

            const res = await this.batchService.changeActiveLesson(batchId, lessonNumber, reason, user);
            if (!!res && res?.success) {
                response.status(200).send(res);
            } else {
                response.status(400).send({
                    message: "Something went wrong while updating the batch.",
                });
            }
        } catch (error) {
            response.status(500).send({
                message:
                    error?.message || "Some error occurred while updating the batch.",
            });
        }
    }

    async updateAllBatchesWithNoSchoolIdButTeacherHas(
        request: Request,
        response: Response
    ) {
        try {
            const res = await this.batchService.updateAllBatchesWithNoSchoolIdButTeacherHas();
            response.status(200).send({ batches: res });
        } catch (error) {
            response.status(500).send({
                message:
                error?.message || "Some error occurred while updating the batch.",
            });
        }
    }

}