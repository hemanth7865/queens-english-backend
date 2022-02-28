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

    async updateLQSData(request: Request, response: Response, next: NextFunction) {
        usersLogger.info("LQS data fetch :: Start");
        var res = await this.lQSService.fetchLQSData();
        //Fetch lqs data
        usersLogger.info("Controller results", res);
       
        this.lQSService.createStudents();
         usersLogger.info("LQS data fetch :: End");

        return res;
    }

}