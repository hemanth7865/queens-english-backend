import { getRepository, MssqlParameter } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { Teacher as Teacher } from "../entity/Teacher";
import { TeacherAvailability as TeacherAvailability } from "../entity/TeacherAvailability";
import { TeacherService } from "../services/TeacherService";
import { Lesson } from "../entity/Lessons";
import { StudentService } from "../services/StudentService";
import { UserService } from "../services/UserService";
import { BatchService } from "../services/BatchService";
import { parse } from 'csv-parse';
const { usersLogger } = require("../Logger.js");
import { getManager } from "typeorm";
import { validations } from "../helpers/validations";
import { BatchController } from "./BatchController";
import { Status } from "../helpers/Constants";
import Referrer from "../model/Referrer";
import { SyncStudentPaymentInfo } from "../services/StudentService/SyncStudentPaymentInfo";
import { SchoolService } from "../services/SchoolService";
import { getRandomNumber } from "../helpers";

export class UserController {

    private usersRepository = getRepository(User);
    private teacherAvailabilityRepository = getRepository(TeacherAvailability);
    private teacherRepository = getRepository(Teacher);
    private lessonRepository = getRepository(Lesson);
    private studentService = new StudentService();
    private teacherService = new TeacherService();
    private schoolService = new SchoolService();
    private userService = new UserService();
    private batchService = new BatchService();
    private batchController = new BatchController();

    async allLeads(request: Request, response: Response, next: NextFunction) {
        return this.usersRepository.find();
    }

    async saveLeads(request: Request, response: Response, next: NextFunction) {
        this.studentService.request = request;
        request.query.cosmosSync = request.query?.cosmosSync !== "false";
        request.query.ignoreDuplicateCheck = request.query?.ignoreDuplicateCheck === "true"

        usersLogger.info('Start::UserController::SaveLead');
        usersLogger.info(`Request data ${JSON.stringify(request.body)}`);

        const ignoreDuplicateCheck = request.query.ignoreDuplicateCheck

        if (!ignoreDuplicateCheck && !request.body.isSibling && !request.body.offlineStudentCode && request.body.phoneNumber) {
            const userExists = await (new UserService()).isUserNotSiblingExists("phoneNumber", request.body.phoneNumber, request.body.id);
            if (userExists) {
                usersLogger.info(`User With That Number Was Found ${userExists?.id}`);
                return { status: 400, errors: ['User already exists with given phoneNumber'] };
            }
        }

        let resp;

        try {
            if (request.body.type === 'student') {
                if (!request.body.id) {
                    const isDuplicate = (a: any, b: any, column: string) => {
                      return (
                        a[column] && b[column] && a[column].trim() === b[column].trim()
                      );
                    };
          
                    let alreadyExistsQuery = `
                          SELECT * FROM user
                          WHERE user.firstName LIKE '%${request.body.firstName}%' AND
                          user.lastName LIKE '%${request.body.lastName}%' AND
                          user.middleName LIKE '%${request.body.middleName}%' 
                      `;
                    if (request.body?.schoolId) {
                        alreadyExistsQuery += `AND
                        user.schoolId LIKE '%${request.body.schoolId}%'`
                    }
                    let similarUserData = await getManager().query(alreadyExistsQuery);
                    similarUserData = await Promise.all(
                      similarUserData.map(async (user) => {
                        const query = `SELECT classSection FROM student WHERE id = '${user.id}'`;
                        const studentData = await getManager().query(query);
                        if (
                          studentData.length > 0 &&
                          studentData[0].classSection &&
                          studentData[0].classSection !== "-"
                        )
                          return { ...user, classSection: studentData[0].classSection };
                        return user;
                      })
                    );
                    if (similarUserData.length > 0) {
                      const similarStudent = similarUserData.find((user) => {
                        return (
                          isDuplicate(request.body, user, "classSection") &&
                          isDuplicate(request.body, user, "firstName") &&
                          isDuplicate(request.body, user, "lastName") &&
                          isDuplicate(request.body, user, "middleName") &&
                          request.body.schoolId ? isDuplicate(request.body, user, "schoolId") : true
                        );
                      });
                      if (similarStudent) {
                        return {
                          status: 400,
                          errors: [
                            "Student already exists with given Firstname, Lastname, Middle name and Class Section",
                          ],
                        };
                      }
                    }
                    if(!request?.body?.studentID && request?.body?.schoolId){
                        request.body.studentID = await (await this.schoolService.getAvailableStudentIds({schoolId: request.body.schoolId, count: 1})).data[0]
                    }
                    if(!request?.body?.password && request?.body?.schoolId) {
                        request.body.password = getRandomNumber(6)
                    }
                }
                let oldStudentDataQuery = `SELECT * FROM student where id = '${request.body.id}'`;
                let oldStudentData = await getManager().query(oldStudentDataQuery);
                // TODO: Reuse studentService Object.

                if (request.body.status?.toLowerCase() === 'enrolled' || request.body.status === 'startclasslater') {
                    const validatingStudent = await (new validations()).validateStudent("StudentValidate", request.body, '', '');
                    if (validatingStudent.status == 'Error') {
                        return { status: 400, errors: [validatingStudent.message] };
                    }
                }
                if (oldStudentData.length > 0 && oldStudentData[0].status !== Status.INACTIVE && request.body.status === Status.INACTIVE) {
                    var addDateOfInactivationQuery = `Update student set dateOfInactivation = curdate() where id = '${request.body.id}'`
                    let addDateOfInactivationRes = await getManager().query(addDateOfInactivationQuery)
                }
                if (request.body.status == Status.INACTIVE && request.body?.batchId.length > 0) {
                    resp = await this.batchController.reBatch({
                        body: {
                            studentId: request.body.studentId,
                            batchId: request.body.batchId[0].batchId
                        }
                    }, response, next);
                    await response;
                    let removequery: any[] = [];
                    var removebatchquery = `DELETE FROM batch_students where studentId='${request.body.id}'`;
                    removequery = await getManager().query(removebatchquery)
                    let batchHistoryOfToday = `SELECT * FROM student_batches_history WHERE studentId = '${request.body.id}' AND batchId = '${request.body.batchId[0].batchId}' AND cast(created_at as Date) = cast(curdate() as Date)`
                    let getBatchHistoriesOfToday = await getManager().query(batchHistoryOfToday)
                    if (!getBatchHistoriesOfToday || getBatchHistoriesOfToday.length == 0) {
                        await this.batchService.addStudentsBatchesHistory([request.body.id], request.body.batchId[0].batchId, false)
                    }
                }
                let prevBatchedStudent: any[] = [];
                var prevBatchedStudentquery = `UPDATE student SET prevBatchedStudent = CASE WHEN prevBatchedStudent = true THEN true WHEN status = 'active' THEN true ELSE false END WHERE id='${request.body.id}'`;
                prevBatchedStudent = await getManager().query(prevBatchedStudentquery);
                resp = await this.studentService.saveStudentDetails(request.body, request.query);
            }
            else {
                resp = await this.teacherService.saveTeacher(request.body, request.query);
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
            schoolName: request.query['schoolName'],
            offlineUser: parseInt(request.query['offlineUser']),
        }

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
        return resp;
    }

    async lessons(request: Request, response: Response, next: NextFunction) {
        var slots = await this.lessonRepository.find();
        return { "success": true, "data": [slots], "total": 1 };
    }

    async leadFullDetails(request: Request, response: Response, next: NextFunction) {

        let resp;
        const teacherId = request.params.id;
        var type = request.query['type'];
        var status = request.query['status'];
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

    async deactivateStudents(request: Request, response: Response, next: NextFunction) {
        let resp;
        const ids: string[] = request.body.students || [];
        try {
            usersLogger.info("Fetching student Active Batches");
            resp = await this.studentService.deactivateStudents(ids);
        } catch (error) {
            console.log(error);
        }
        return resp;
    }

    async generateUsersCode(request: Request, response: Response, next: NextFunction) {
        let resp = {};
        try {
            resp = await this.userService.generateUsersCode();
        } catch (error) {
            console.log(error);
        }
        return resp;
    }

    async validateStudentStatus(request: Request, response: Response, next: NextFunction) {
        let resp;
        try {
            usersLogger.info("Fetching student Error status student");
            resp = await this.studentService.validateStudentStatus();
        } catch (error) {
            console.log(error);
        }
        return resp;
    }

    async syncUsersToMongo(request: Request, response: Response, next: NextFunction) {
        let users: any;
        let referrers: any;
        const res = {
            newUsers: [],
            updatedUsers: [],
            addErrors: [],
            updateErrors: [],
            message: [],
        };
        try {
            // Fetching all users and referrers
            users = await this.userService.getAllUsersService();
            referrers = await Referrer.find();
            // Filtering already added referrers
            for (var i = users.length - 1; i >= 0; i--) {
                for (var j = 0; j < referrers.length; j++) {
                    if (users[i] && users[i].id === referrers[j].userId) {
                        try {
                            if (
                                users[i].phoneNumber !== referrers[j].phoneNumber ||
                                users[i].email.toLowerCase() !== referrers[j].email ||
                                users[i].firstName !== referrers[j].firstName ||
                                users[i].lastName !== referrers[j].lastName
                            ) {
                                const updateReferrersPhoneNumber =
                                    await Referrer.findOneAndUpdate(
                                        { userId: users[i].id },
                                        {
                                            $set: {
                                                firstName: users[i].firstName,
                                                lastName: users[i].lastName,
                                                phoneNumber: users[i].phoneNumber,
                                                email: users[i].email.toLowerCase(),
                                            },
                                        },
                                        { multi: true }
                                    );
                                res.updatedUsers.push(updateReferrersPhoneNumber);
                                if (users[i].phoneNumber !== referrers[j].phoneNumber) {
                                    res.message.push(
                                        `Updated User: Name: ${users[i].firstName}, ID:${users[i].id}; New Phone Number: ${users[i].phoneNumber}, Old Phone Number: ${referrers[j].phoneNumber}`
                                    );
                                }
                                if (users[i].email.toLowerCase() !== referrers[j].email) {
                                    res.message.push(
                                        `Updated User: Name: ${users[i].firstName}, ID:${users[i].id
                                        }; New Email: ${users[i].email.toLowerCase()}, Old Email: ${referrers[j].email
                                        }`
                                    );
                                }
                                if (users[i].firstName !== referrers[j].firstName) {
                                    res.message.push(
                                        `Updated User: Name: ${users[i].firstName}, ID:${users[i].id}; New First Name: ${users[i].firstName}, Old First Name: ${referrers[j].firstName}`
                                    );
                                }
                                if (users[i].lastName !== referrers[j].lastName) {
                                    res.message.push(
                                        `Updated User: Name: ${users[i].firstName}, ID:${users[i].id}; New Last Name: ${users[i].lastName}, Old Last Name: ${referrers[j].lastName}`
                                    );
                                }
                                if (users[i].status !== referrers[j].status) {
                                    res.message.push(
                                        `Updated User: Name: ${users[i].firstName}, ID:${users[i].id}; New Status: ${users[i].status}, Old Status ${referrers[j].status}`
                                    );
                                }
                            }
                        } catch (error) {
                            console.log(error);
                            res.updateErrors.push(error);
                        }
                        await users.splice(i, 1);
                    }
                }
            }
            for (let user of users) {
                try {
                    const referrersObject = {
                        firstName: user.firstName,
                        lastName: user?.lastName,
                        userId: user.id,
                        email: user?.email,
                        phoneNumber: user.phoneNumber,
                        type: user?.type,
                        status: user?.status,
                    };
                    const saveMongo = new Referrer(referrersObject);
                    await saveMongo.save();
                    res.newUsers.push(saveMongo);
                } catch (error) {
                    console.log(error);
                    res.addErrors.push(error);
                }
            }
            return res;
        } catch (error) {
            console.log(error);
        }
    }

    async syncStudentPaymentInfo(request: Request, response: Response, next: NextFunction) {
        let resp;
        try {
            usersLogger.info("Sync Student Payment Info");
            resp = await SyncStudentPaymentInfo(request);
        } catch (error) {
            usersLogger.error("Sync Student Payment Info Error: " + error.message);
            resp = { status: 400, error: error.message }
        }
        return resp;
    }

    async syncStudentsToCosmos(
      request: Request,
      response: Response,
      next: NextFunction
    ) {
      let resp;
      try {
        usersLogger.info("Sync Student To Cosmos");
        resp = await this.studentService.syncStudentsToCosmosDB(request.body);
      } catch (error) {
        usersLogger.error("Sync Student Payment Info Error: " + error.message);
        resp = { status: 400, error: error.message };
      }
      return resp;
    }
}