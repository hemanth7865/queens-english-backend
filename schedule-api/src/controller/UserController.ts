import { getRepository, MssqlParameter } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { Teacher as Teacher } from "../entity/Teacher";
import { TeacherAvailability as TeacherAvailability } from "../entity/TeacherAvailability";
import { TeacherService } from "../services/TeacherService";
import { Lesson } from "../entity/Lessons";
import { StudentService } from "../services/StudentService";
import { BatchService } from "../services/BatchService";
import { UserService } from "../services/UserService";
import { parse } from 'csv-parse';
const { usersLogger } = require("../Logger.js");
import { getManager } from "typeorm";
import { validations } from "../helpers/validations";
import { BatchController } from "./BatchController";
import { stringify } from "querystring";


export class UserController {

    private usersRepository = getRepository(User);
    private teacherAvailabilityRepository = getRepository(TeacherAvailability);
    private teacherRepository = getRepository(Teacher);
    private lessonRepository = getRepository(Lesson);
    private studentService = new StudentService();
    private teacherService = new TeacherService();
    private batchService = new BatchService();
    private batchController = new BatchController();

    async allLeads(request: Request, response: Response, next: NextFunction) {
        return this.usersRepository.find();
    }

    async saveLeads(request: Request, response: Response, next: NextFunction) {
        usersLogger.info('Start::UserController::SaveLead');
        usersLogger.info(`Request data ${JSON.stringify(request.body)}`);

        if (!request.body.isSibling) {
            const userExists = await (new UserService()).isUserNotSiblingExists("phoneNumber", request.body.phoneNumber, request.body.id);
            var resp;
            if (userExists) {
                usersLogger.info(`User With That Number Was Found ${userExists?.id}`);
                return { status: 400, errors: ['User already exists with given phoneNumber'] };
            }
        }


        try {
            if (request.body.type === 'student') {
                const leadIDExists = await (new StudentService()).isLeadIDExists("studentID", request.body.studentID, request.body.id);

                if (request.body.status.toLowerCase() == 'enrolled' || request.body.status == 'startclasslater') {
                    const validatingStudent = await (new validations()).validateStudent("StudentValidate", request.body, '', '');
                    if (validatingStudent.status == 'Error') {
                        return { status: 400, errors: [validatingStudent.message] };
                    }
                }
                if (leadIDExists) {
                    usersLogger.info(`Student With That studentID Was Found ${leadIDExists?.id}`);
                    return { status: 400, errors: ['Student already exists with given studentID'] };
                }
                if (request.body.status == "inactive") {
                    var query2 = "select id, batchId, studentId, type, created_at, updated_at, studentId as value, id as 'key' from batch_students where batchId IN (select batchId from batch_students where studentId='" + request.body.id + "')";
                    var data2 = await getManager().query(query2);
                    const students = data2;
                    var query1 = "select id, type, batchNumber, teacherId, classStartDate, classEndDate, lessonStartTime, lessonEndTime, ageGroup, startingLessonId, endingLessonId, version, followupVersion, maxAttemptsAllowed, classCode, activeLessonId, frequency, zoomLink, zoomInfo, whatsappLink, '"+ [{students}]  +"' as 'students' from classes where id IN (select batchId from batch_students where studentId='" + request.body.id + "')";
                    var data1 = await getManager().query(query1);                  
                    let data = [...data1 , students];
                    resp = await this.batchService.createBatch(data);
                    let removequery: any[] = [];
                    var removebatchquery = `DELETE FROM batch_students where studentId='${request.body.id}'`;                        
                    removequery = await getManager().query(removebatchquery)
                    console.log("Trying to remove Inactive Student")
                } else { console.log('Cannot Remove Student From Batch due to Not Inactive Status') }
                resp = await this.studentService.saveStudentDetails(request.body);
            }
            else {
                resp = await this.teacherService.saveTeacher(request.body);
            }

        } catch (error) {
            console.log(error);
            console.log('Exception::UserController::SaveLead');
        }
        console.log('End::UserController::SaveLead');
        return resp;
    }


    async updateLeadsStatus(request: Request, response: Response, next: NextFunction) {
        usersLogger.info('Start::UserController::updateLeadsStatus');
        usersLogger.info(`Request data ${JSON.stringify(request.body)}`);
        var resp;
        try {
            if (request.body.type === 'student') {
                resp = await this.studentService.updateStudentStatus(request.body);
            }
        } catch (error) {
            console.log('Exception::UserController::updateLeadsStatus', error);
        }
        console.log('End::UserController::updateLeadsStatus');
        return resp;
    }

    async batchCreate(request: Request, response: Response, next: NextFunction) {
        console.log('contorller');
        var user;

        try {
            user = await this.teacherService.saveTeacher(request.body);
        } catch (error) {
            console.log()
        }
        return { "success": true, "data": [user], "total": 1 };
    }




    async listLeadDetails(request: Request, response: Response, next: NextFunction) {
        usersLogger.info("Fetch details from database::listLeadDetails");

        var parameters = {
            current: parseInt(request.query['current']),
            pageSize: parseInt(request.query['pageSize']),
            date: request.query['date'],
            name: request.query['name'],
            phoneNumber: request.query['phoneNumber'],
            totalexp: request.query['totalexp'],
            classesTaken: request.query['classesTaken'],
            ratings: request.query['ratings'],
            start_slot: request.query['start_slot'],
            end_slot: request.query['end_slot'],
            weekday: request.query['weekday'],
            status: request.query['status'],
            type: request.query['type'],
            keyword: request.query['keyword'],
            studentID: request.query['studentID'],
            id: request.query['id'],
            batchCode: request.query['batchCode'],
            email: request.query['email'],
            dob: request.query['dob'],
            whatsapp: request.query['whatsapp'],
            address: request.query['address'],
            prm: request.query['prm'],
            frequency: request.query['frequency'],
            autoSearch: request.query['autoSearch'],
        }

        console.log('requestr', request.query['email'])


        var studentService = new StudentService();
        var user;
        let resp;

        try {
            if (request.query['type'] === 'student') {
                resp = await studentService.listStudentDetails(request.body, parameters);

            } else {
                resp = await this.teacherService.listLeadDetails(request.body, parameters);
            }
        } catch (error) {
            console.log(error);
        }
        // console.log('res[][', resp)
        return resp;
    }

    async lessons(request: Request, response: Response, next: NextFunction) {
        var slots = await this.lessonRepository.find();
        return { "success": true, "data": [slots], "total": 1 };
    }

    async leadFullDetails(request: Request, response: Response, next: NextFunction) {

        let resp;
        const teacherId = request.params.id;
        var type = request.query['type']
        try {
            if (type == 'student') {
                usersLogger.info("Fetching student full details");
                resp = this.studentService.fetchStudentFilterData(teacherId);
            } else {
                usersLogger.info("Fetching lead full details");
                resp = await this.teacherService.leadFullDetails(request.body, teacherId);
            }


            console.log(resp);
        } catch (error) {
            console.log(error);
        }
        console.log(resp);
        return resp;
    }

    async leadAvialability(request: Request, response: Response, next: NextFunction) {
        console.log("Request Parameter" + request.query);
        let availabilitydate = request.query['date'];;
        let start_slot = request.query['start_slot'];
        let end_slot = request.query['end_slot'];
        let week_day = request.query['week_slot'];

        request.setTimeout(() => {
            return { "success": false, "data": "TimeOut", "total": 0 };
        }, 120000);

        let slots: TeacherAvailability[] = [];
        slots = await this.teacherAvailabilityRepository.createQueryBuilder("TeacherAvailability")
            .where('leadavailability.date >= :date ', { date: availabilitydate }).andWhere('leadavailability.week_date in (:days) ', { days: week_day })
            .andWhere('start_slot.date >= :start_slot', { start_slot: start_slot }).andWhere('end_slot.date <= :end_slot', { end_slot: end_slot }).getMany();

        return slots;
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        console.log("Delete user");
        console.log('request.params.id' + request.params.id);
        let userToRemove = await this.usersRepository.findOne(request.params.id);
        userToRemove.status = "inactive";
        return this.usersRepository.save(userToRemove);
    }

    async availableTeachers(request: Request, response: Response, next: NextFunction) {
        var parameters = {
            current: parseInt(request.query['current']),
            pageSize: parseInt(request.query['pageSize']),
            date: request.query['date'],
            name: request.query['name'],
            phoneNumber: request.query['phoneNumber'],
            totalexp: request.query['totalexp'],
            classesTaken: request.query['classesTaken'],
            ratings: request.query['ratings'],
            start_slot: request.query['start_slot'],
            end_slot: request.query['end_slot'],
            weekday: request.query['weekday'],
            status: request.query['status'],
            type: request.query['type'],
            keyword: request.query['keyword'],
            studentID: request.query['studentID'],
            batchCode: request.query['batchCode'],
            email: request.query['email'],
            dob: request.query['dob'],
            whatsapp: request.query['whatsapp'],
            address: request.query['address'],
        }
        return this.teacherService.availableTeachers(request.body, parameters);

    }

    async updateStudentsCSV(request: Request, response: Response, next: NextFunction) {
        const file = request.files.students;
        let data = [];

        try {
            await new Promise(function (myResolve: any, myReject: any) {
                parse(file.data.toString(), { columns: true, trim: true }, function (e, records) {
                    data = records;
                    myResolve();
                });
            });
            return this.studentService.updateStudentsCSV(data, request.query);
        } catch (e) {
            return { e, name: file.name, size: file.size, type: file.type };
        }
    }

    async updateStudentsCSVV2(request: Request, response: Response, next: NextFunction) {
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
            return this.studentService.updateStudentsCSVV2(data, request.query);
        } catch (e) {
            return { e, name: file.name, size: file.size, type: file.type };
        }
    }

    async updateStudentsCollectionExpertsCSV(request: Request, response: Response, next: NextFunction) {
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
            return this.studentService.updateStudentsCollectionExpertsCSV(data, request.query);
        } catch (e) {
            return { e, name: file.name, size: file.size, type: file.type };
        }
    }


    async loadTeacherAvailability(request: Request, response: Response, next: NextFunction) {
        usersLogger.info("Loading teacher availability ....");
        let msg = await this.teacherService.updateTeacherAvailability();
        usersLogger.info("Loading teacher availability completed....");
        return msg;
    }

    async getStudentActiveBatches(request: Request, response: Response, next: NextFunction) {
        let resp;
        const id: string = request.params.id;
        try {
            usersLogger.info("Fetching student Active Batches");
            resp = await this.studentService.getStudentActiveBatches(id);
        } catch (error) {
            console.log(error);
        }
        console.log(resp);
        return resp;
    }
}