import { getRepository, MssqlParameter } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { Teacher as Teacher } from "../entity/Teacher";
import { TeacherAvailability as TeacherAvailability } from "../entity/TeacherAvailability";
import { TeacherService } from "../services/TeacherService";
import { Lesson } from "../entity/Lessons";
import { StudentService } from "../services/StudentService";
import { UserService } from "../services/UserService";
import { parse } from "csv-parse";
const { usersLogger } = require("../Logger.js");
import { getManager } from "typeorm";
import { validations } from "../helpers/validations";
import { ZoomUserService } from "../services/ZoomUsersService";

export class ZoomUserController {
  private zoomUserService = new ZoomUserService();

  async getTeachersWithoutLicense(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    return { data: await this.zoomUserService.getTeachersWithoutLicense() };
  }

  async generateTeachersLicense(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    return { data: await this.zoomUserService.generateTeachersLicense() };
  }
}
