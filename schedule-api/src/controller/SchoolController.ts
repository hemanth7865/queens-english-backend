import { NextFunction, Request, Response } from "express";
import { getRepository, getManager, createQueryBuilder } from "typeorm";
import { School } from "../entity/School";
import { SRA } from "../entity/SRA";
import { Classes } from "../entity/Classes";
import { SchoolService } from "../services/SchoolService";
import { Constants, OPERATION } from "../helpers/Constants";
import { logger } from "./../Logger.js";
import { UserService } from "../services/UserService";

export class SchoolController {
    private schoolRepository = getRepository(School);
    private sraRepository = getRepository(SRA);
    private classesRepository = getRepository(Classes);
    private schoolService = new SchoolService();
    private userService = new UserService();

    async listSchools(request: Request, response: Response, next: NextFunction) {
        var parameters = {
            current: request.query['current'],
            pageSize: request.query['pageSize'],
            id: request.query['id'],
            schoolName: request.query['schoolName'],
            createdAt: request.query['createdAt'],
            status: request.query['schoolStatus'],
            sraName: request.query['sraName'],
            schoolCode: request.query['schoolCode'],
            poc: request.query['poc']
        }
        let res;
        try {
            res = await this.schoolService.getAllSchools(parameters);
            return res;
        } catch (error) {
            logger.error(error);
        }
    }

    async createSRA(request: Request, response: Response, next: NextFunction) {
        let res;
        try {
            request.body.operation = OPERATION.ADD;
            res = await this.schoolService.saveSra(request.body);
            return res;
        } catch (error) {
            logger.error(error);
        }
    }

    async editSra(request: Request, response: Response, next: NextFunction) {
        let res;
        try {
            request.body.operation = OPERATION.UPDATE;
            res = await this.schoolService.saveSra(request.body);
            return res;
        } catch (error) {
            logger.error(error);
        }
    }

    async listBatches(request: Request, response: Response, next: NextFunction) {
        let res;
        try {
            res = await this.schoolService.listBatches();
            return res;
        } catch (error) {
            logger.error(error);
        }
    }

    async getSra(request: Request, response: Response, next: NextFunction) {
        let res;
        try {
            res = await this.schoolService.getAllSra();
            return res;
        } catch (error) {
            logger.error(error);
        }
    }

    async addSchool(request: Request, response: Response, next: NextFunction) {
        let res;
        try {
            request.body.operation = OPERATION.ADD;
            res = await this.schoolService.saveSchool(request.body);
            return res;
        } catch (error) {
            logger.error(error);
        }
    }

    async editSchool(request: Request, response: Response, next: NextFunction) {
        let res;
        try {
            request.body.operation = OPERATION.UPDATE;
            res = await this.schoolService.saveSchool(request.body);
            return res;
        } catch (error) {
            logger.error(error);
        }
    }

    async getLocation(request: Request, response: Response, next: NextFunction) {
        let res;
        try {
            res = await this.userService.getLocations(request.body)
            return res;
        } catch (error) {
            logger.error(error)
        }
    }
}