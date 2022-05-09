import { getRepository, MssqlParameter } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { Teacher as Teacher } from "../entity/Teacher";
import { TeacherAvailability as TeacherAvailability } from "../entity/TeacherAvailability";
import { LQSService } from "../services/LQSService";
import { Lesson } from "../entity/Lessons";
import { StudentService } from "../services/StudentService";
const { usersLogger } = require("../Logger.js");
import { getManager } from "typeorm";
import { LQSEntry } from "../entity/LQSEntry";

export class LQSController {
    private lQSService = new LQSService();
    private ENABLE_ACTIVITY_API = process.env.ENABLE_ACTIVITY_API;

    async updateLQSData(request: Request, response: Response, next: NextFunction) {
        usersLogger.info("LQS data fetch :: Start");
        usersLogger.info('Start::UserController::SaveLead');
        usersLogger.info(`Request data ${JSON.stringify(request.body)}`);
        var res;
        if (this.ENABLE_ACTIVITY_API) {
            usersLogger.info(`Activity api enabled .... ${this.ENABLE_ACTIVITY_API}`);
            res = await this.lQSService.fetchLSQData(request.body);
        } else {
            res = await this.lQSService.fetchLQSData(request.body);
        }
        await this.lQSService.createStudents();
        usersLogger.info("Assign PRM records");
        usersLogger.info("LQS data fetch :: End");

        return res;
    }

}