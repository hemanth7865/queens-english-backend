import { getRepository, getManager } from "typeorm";
import { School } from "../entity/School";
import { SRA } from "../entity/SRA";
import { Classes } from "../entity/Classes";
import { SchoolView } from "../model/SchoolView";
import { OPERATION } from "../helpers/Constants";
import { Status } from "../helpers/Constants";
import { BatchStudent } from "../entity/BatchStudent";
import { Student } from "../entity/Student";
import { User } from "../entity/User";
import { isNullOrUndefined } from "util";
import { BatchService } from "./BatchService";

export class SchoolService {
    private schoolRepository = getRepository(School);
    private sraRepository = getRepository(SRA);
    private classesRepository = getRepository(Classes);
    private batchStudentRepository = getRepository(BatchStudent);
    private studentRepository = getRepository(Student);
    private userRepository = getRepository(User);
    private batchService = new BatchService();
    public request: any = {};

    async getAllSra() {
        const sra = await (await this.sraRepository.find({ where: { status: Status.ACTIVE } })).sort((a, b) => a.name.localeCompare(b.name));
        return {
            success: true,
            data: sra,
            total: sra.length,
        };
    }

    async getAllSchools(parameters: any) {
        let current = parseInt(parameters.current);
        const pageSize = parseInt(parameters.pageSize);
        let offset = parseInt(parameters.current);
        current = offset;
        if (offset == 1) {
            offset = 0;
        }

        let schools: any[] = [];
        let query_list = [];
        let query_string = "";

        if (parameters.id) {
            query_list.push(` id = '${parameters.id}' `);
        }
        if (parameters.schoolName) {
            query_list.push(` schoolName like '%${parameters.schoolName}%' `);
        }
        if (parameters.schoolCode) {
            query_list.push(` schoolCode like '%${parameters.schoolCode}%' `);
        }
        if (parameters.sraName) {
            let sras: any[] = [];
            const data = await this.getAllSra();
            sras = data.data;
            let sraId = data.data[Number(parameters.sraName)].id;
            query_list.push(` sraId = '${sraId}' `);
        }
        if (parameters.status) {
            const status = Number(parameters.status) === 0 ? Status.ACTIVE_CAPS : Status.INACTIVE_CAPS;
            query_list.push(` schoolStatus = '${status}' `);
        }
        if (parameters.poc) {
            query_list.push(` poc like '%${parameters.poc}%' `);
        }
        if (parameters.createdAt) {
            if (parameters.createdAt.length === 9) {
                parameters.createdAt = `0${parameters.createdAt}`;
            }
            const createdAt = parameters.createdAt.split('/').reverse().join('-');
            query_list.push(` createdAt like '%${createdAt}%' `);
        }
        if (parameters.country) {
            query_list.push(` country like '%${parameters.country}%' `);
        }
        if (parameters.state) {
            query_list.push(` state like '%${parameters.state}%' `);
        }
        if (parameters.city) {
            query_list.push(` city like '%${parameters.city}%' `);
        }

        if (query_list.length > 0) {
            query_string = "where ";
        }

        query_list.forEach((value: any, index: number, array: any[]) => {
            if (index != query_list.length - 1) {
                query_string = query_string + query_list[index] + " and ";
            } else {
                query_string = query_string + query_list[index];
            }
        });
        current--;
        const checkParams = () => {
            if (isNaN(parameters.current) && isNaN(parameters.pageSize)) {
                return false
            } else {
                return true
            };
        }
        if (await (checkParams()) === false) {
            schools = await this.schoolRepository.find({ where: { schoolStatus: Status.ACTIVE_CAPS }, order: { createdAt: "DESC" } });
        } else {
            let query = `select * from school ${query_string} order by createdAt desc limit ${pageSize} offset ${current * pageSize}`;
            schools = await getManager().query(query);
        }

        let schoolView: SchoolView[] = [];
        let batchStudents: any[] = [];

        for (const element of schools) {
            const classes = await this.classesRepository.find({ where: { schoolId: element.id } });
            let classesData: any[] = [];
            let classesLength = classes.length + 1;
            for (const c of classes) {
                let classObject: any[] = [];
                let studentArray: any[] = [];
                batchStudents = await this.batchStudentRepository.find({ where: { batchId: c.id } });
                let batchStudentlength = batchStudents.length + 1;
                for (const student of batchStudents) {
                    let user = await this.userRepository.findOne({ where: { id: student.studentId } });
                    let s = await this.studentRepository.findOne({ where: { id: student.studentId } });
                    let studentObject: any[] = [];
                    studentObject.push({
                        id: user.id,
                        name: s?.studentName ?? user?.firstName + ' ' + user?.lastName,
                        email: user?.email ?? user?.customerEmail,
                        mobile: user?.phoneNumber,
                        status: s?.status,
                        schoolId: user?.schoolId ?? s?.schoolId
                    })
                    do {
                        studentArray = [...studentArray, ...studentObject]
                    } while (!--batchStudentlength)
                }
                classObject.push({
                    batchId: c.id,
                    batchNumber: c.batchNumber,
                    students: studentArray
                })
                do {
                    classesData = [...classesData, ...classObject]
                } while (!--classesLength)
            }

            const sra = await this.sraRepository.findOne({ where: { id: element.sraId } });
            let location = "";
            if (element.country) location += element.country
            if (element.state) location += ', ' + element.state
            if (element.city) location += ', ' + element.city

            let s = new SchoolView(
                element.id,
                element.schoolName,
                element.schoolCode,
                element.poc,
                sra.name,
                sra,
                classes,
                classesData,
                element.createdAt.toLocaleDateString('en-IN'),
                element.schoolStatus,
                classes.length,
                location
            );
            schoolView.push(s);
        }
        return {
            success: true,
            data: schoolView,
            total: schools.length,
            current: current,
            pageSize: pageSize,
        };
    }

    async listBatches() {
        const classes = await this.classesRepository.find({ where: { schoolId: null, offlineBatch: 1 } });
        return {
            success: true,
            data: classes,
            total: classes.length,
        };
    }

    async saveSra(request: any) {
        if (request.operation === OPERATION.ADD) {
            let sra = new SRA();
            sra.name = request.name;
            sra.email = request.email;
            sra.mobile = request.mobile;
            sra.status = Status.ACTIVE_CAPS;
            const newSra = await this.sraRepository.create(sra);
            await this.sraRepository.save(newSra);
            return {
                success: true,
                data: newSra,
            };
        } else if (request.operation === OPERATION.UPDATE) {
            let sra = await this.sraRepository.findOne({ where: { id: request.id } });
            sra.name = request.name;
            sra.email = request.email;
            sra.mobile = request.mobile;
            sra.status = request.status;
            const newSra = await this.sraRepository.save(sra);
            return {
                success: true,
                data: newSra,
            };
        }
    }

    async saveSchooltoBatches(request: any) {
        for (const b of request.batchesToSave) {
            let batch: any;

            if (!isNullOrUndefined(request.csv)) {
                batch = await this.classesRepository.findOne({ where: { id: b } });
            } else {
                batch = await this.classesRepository.findOne({ where: { batchNumber: b } });
            }
            const students = await this.batchStudentRepository.find({ where: { batchId: batch.id } });
            //Teacher Update
            await this.userRepository.update({ id: batch.teacherId }, { schoolId: request.saveSchool.id, schoolCode: request.saveSchool.schoolCode });

            batch.schoolId = request.saveSchool.id;
            batch.schoolName = request.saveSchool.schoolName;
            await this.classesRepository.save(batch);

            let studentsData: any;
            let users: any;

            if (students.length > 0) {
                for (const s of students) {
                    studentsData = await this.studentRepository.findOne({ where: { id: s.studentId } });
                    if (studentsData) {
                        studentsData.schoolId = request.saveSchool.id;
                        await this.studentRepository.save(studentsData);
                    }
                    users = await this.userRepository.findOne({ where: { id: s.studentId } });
                    if (users) {
                        users.schoolId = request.saveSchool.id;
                        users.schoolCode = request.saveSchool.schoolCode;
                        await this.userRepository.save(users);
                    }
                }
            }

            let cosmosStudents = []

            for (let user of students) {
                cosmosStudents.push({
                    value: user.studentId,
                    type: 'studentProfile'
                })
            }
            try {
                const cosmosData = {
                    ...batch,
                    students: cosmosStudents,
                    schoolCode: request.saveSchool.schoolCode,
                    schoolStatus: request.saveSchool.schoolStatus,
                }
                await this.batchService.createBatch(cosmosData)
            } catch (error) {
                console.error(error);
            }
        }

        if (!isNullOrUndefined(request.csv)) {
            return {
                success: true,
                data: request.batchesToSave,
            };
        }
    }


    async saveSchool(request: any) {
        try {
            let school: any;

            if (request.operation === OPERATION.ADD) {

                const currentSchools = await this.schoolRepository.find();

                for (let school of currentSchools) {
                    if (request.schoolCode.toUpperCase() === school.schoolCode.toUpperCase()) {
                        return {
                            success: true,
                            errorMessage: 'School code already exists',
                        };
                    }
                }

                school = new School();
                school.createdAt = new Date();
                request.schoolStatus = Status.ACTIVE_CAPS

            } else {
                school = await this.schoolRepository.findOne({ where: { id: request.id } });
            }
            school.schoolName = request.schoolName;
            school.schoolCode = request.schoolCode;
            school.sraId = request.sraId;
            school.schoolStatus = request.schoolStatus;
            school.poc = request.poc;
            school.country = request.country;
            school.state = request.state;
            school.city = request.city;
            const saveSchool = await this.schoolRepository.save(school);

            if (!isNullOrUndefined(request.batches)) {
                if (!isNullOrUndefined(request.batches.addBatches) && request.batches.addBatches.length > 0) {
                    request.saveSchool = saveSchool;
                    request.batchesToSave = request.batches.addBatches;
                    await this.saveSchooltoBatches(request);
                }

                if (!isNullOrUndefined(request.batches.removeBatches) && request.batches.removeBatches.length > 0) {
                    request.saveSchool = {
                        id: null,
                        schoolName: null,
                        schoolCode: null,
                        schoolStatus: null
                    };
                    request.batchesToSave = request.batches.removeBatches;
                    await this.saveSchooltoBatches(request);
                }
            }

            return {
                success: true,
                data: saveSchool,
            };
        } catch (error) {
            console.error(error);
        }
    }

}