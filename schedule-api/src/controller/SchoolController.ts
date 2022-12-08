import { NextFunction, Request, Response } from "express";
import { getRepository, getManager, createQueryBuilder } from "typeorm";
import { School } from "../entity/School";
import { SRA } from "../entity/SRA";
import { Classes } from "../entity/Classes";
import { SchoolService } from "../services/SchoolService";
import { Constants, OPERATION } from "../helpers/Constants";

export class SchoolController {
    private schoolRepository = getRepository(School);
    private sraRepository = getRepository(SRA);
    private classesRepository = getRepository(Classes);
    private schoolService = new SchoolService();

    async listSchools(request: Request, response: Response, next: NextFunction) {
        var parameters = {
            current: request.query['current'],
            pageSize: request.query['pageSize'],
            schoolId: request.query['schoolId'],
            schoolname: request.query['schoolName'],
            createdAt: request.query['createdAt'],
            status: request.query['status'],
            SRA: request.query['SRA'],
            schoolCode: request.query['schoolCode'],
        }
        let res;
        try {
            res = await this.schoolService.getAllSchools(parameters);
            return res;
        } catch (error) {
            console.log(error);
        }
    }

    async createSRA(request: Request, response: Response, next: NextFunction) {
        let res;
        try {
            request.body.operation = OPERATION.ADD;
            res = await this.schoolService.saveSra(request.body);
            return res;
        } catch (error) {
            console.log(error);
        }
    }

    async editSra(request: Request, response: Response, next: NextFunction) {
        let res;
        try {
            request.body.operation = OPERATION.UPDATE;
            res = await this.schoolService.saveSra(request.body);
            return res;
        } catch (error) {
            console.log(error);
        }
    }

    async listBatches(request: Request, response: Response, next: NextFunction) {
        let res;
        try {
            res = await this.schoolService.listBatches();
            return res;
        } catch (error) {
            console.log(error);
        }
    }

    async getSra(request: Request, response: Response, next: NextFunction) {
        let res;
        try {
            res = await this.schoolService.getAllSra();
            return res;
        } catch (error) {
            console.log(error);
        }
    }

    async addSchool(request: Request, response: Response, next: NextFunction) {
        let res;
        try {
            request.body.operation = OPERATION.ADD;
            res = await this.schoolService.saveSchool(request.body);
            return res;
        } catch (error) {
            console.log(error);
        }
    }

    async editSchool(request: Request, response: Response, next: NextFunction) {
        let res;
        try {
            request.body.operation = OPERATION.UPDATE;
            res = await this.schoolService.saveSchool(request.body);
            return res;
        } catch (error) {
            console.log(error);
        }
    }
}