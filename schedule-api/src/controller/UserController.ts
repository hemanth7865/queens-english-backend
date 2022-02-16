import { getRepository, MssqlParameter } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { Teacher as Teacher } from "../entity/Teacher";
import { TeacherAvailability as TeacherAvailability } from "../entity/TeacherAvailability";
import { TeacherService } from "../services/TeacherService";
import { Lesson } from "../entity/Lessons";
import { StudentService } from "../services/StudentService";
const { usersLogger } = require("../Logger.js");
import { getManager } from "typeorm";

export class UserController {

    private usersRepository = getRepository(User);
    private teacherAvailabilityRepository = getRepository(TeacherAvailability);
    private teacherRepository = getRepository(Teacher);
    private lessonRepository = getRepository(Lesson);
    private studentService = new StudentService();

    async allLeads(request: Request, response: Response, next: NextFunction) {
        return this.usersRepository.find();
    }

    async saveLeads(request: Request, response: Response, next: NextFunction) {
        usersLogger.info('Start::UserController::SaveLead');
        usersLogger.info(`Request data ${JSON.stringify(request.body)}`);
        var teacherService = new TeacherService();
     
        var resp;
        var total = await getManager().query('SELECT COUNT(*) as total FROM USER where phoneNumber=' + request.body.phoneNumber);
        usersLogger.info(`Total Number of records:  ${total}`);
       if (total[0].total===0 || request.body.id)
       {
        usersLogger.info(`Insert of update record  ${total}`);
            
            try {
                if(request.body.type === 'student') {
                resp = await this.studentService.saveStudentDetails(request.body);
                } 
                else {
                resp = await teacherService.saveTeacher(request.body);
                }
           
            } catch (error) {
            console.log('Exception::UserController::SaveLead');
            }
        console.log('End::UserController::SaveLead');
        return resp;
        }    
        else {
            return { status: 400, errors: ['User already existed with given phoneNumber'] };
        }
    }


    async batchCreate(request: Request, response: Response, next: NextFunction) {
        console.log('contorller');
        var teacherService = new TeacherService();
        var user;

        try {
            user = await teacherService.saveTeacher(request.body);
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
            keyword: request.query['keyword']
        }

        var teacherService = new TeacherService();
        var user;
        let resp;

        try {
            resp = await teacherService.listLeadDetails(request.body, parameters);
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
        let teacherService = new TeacherService();
        const teacherId = request.params.id;
        var type = request.query['type']
        try {
            if (type == 'student') {
                usersLogger.info("Fetching student full details");
                    resp = this.studentService.fetchStudentFilterData(teacherId);
            } else {
                usersLogger.info("Fetching lead full details");
                resp = await teacherService.leadFullDetails(request.body, teacherId);
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


}