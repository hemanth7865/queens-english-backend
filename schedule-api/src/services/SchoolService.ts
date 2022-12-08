import { getRepository, getManager, createQueryBuilder } from "typeorm";
import { School } from "../entity/School";
import { SRA } from "../entity/SRA";
import { Classes } from "../entity/Classes";
import { SchoolView } from "../model/SchoolView";
import { OPERATION } from "../helpers/Constants";
import { Status } from "../helpers/Constants";
import { BatchStudent } from "../entity/BatchStudent";
import { Student } from "../entity/Student";
import { User } from "../entity/User";

export class SchoolService {
    private schoolRepository = getRepository(School);
    private sraRepository = getRepository(SRA);
    private classesRepository = getRepository(Classes);
    private batchStudentRepository = getRepository(BatchStudent);
    private studentRepository = getRepository(Student);
    private userRepository = getRepository(User);
    public request: any = {};

    async getAllSchools(parameters: any) {
        let current = parseInt(parameters.current);
        const pageSize = parseInt(parameters.pageSize);
        let offset = parseInt(parameters.current);
        current = offset;
        if (offset == 1) {
            offset = 0;
        }

        let schoolView: SchoolView[] = [];
        let batchStudents: any[] = [];

        const schools = await this.schoolRepository.find();

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

    async getAllSra() {
        const sra = await this.sraRepository.find({ where: { status: Status.ACTIVE } });
        return {
            success: true,
            data: sra,
            total: sra.length,
        };
    }

    async saveSra(request: any) {
        if (request.operation === OPERATION.ADD) {
            console.log('request', request)
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


    async saveSchool(request: any) {
        if (request.operation === OPERATION.ADD) {
            let school = new School();
            console.log('request', request)
            school.schoolName = request.schoolName;
            school.schoolCode = request.schoolCode;
            school.sraId = request.sraId;
            school.schoolStatus = Status.ACTIVE_CAPS;
            school.poc = request.poc;
            school.createdAt = new Date();
            const newSchool = await this.schoolRepository.create(school);
            const saveSchool = await this.schoolRepository.save(newSchool);
            if (request.batches) {
                for (const batch of request.batches) {
                    const classes = await this.classesRepository.findOne({ where: { id: batch } });
                    classes.schoolId = saveSchool.id;
                    await this.classesRepository.save(classes);
                }
            }
            return {
                success: true,
                data: newSchool,
            };
        } else if (request.operation === OPERATION.UPDATE) {
            let school = await this.schoolRepository.findOne({ where: { id: request.id } });
            school.schoolName = request.schoolName;
            school.schoolCode = request.schoolCode;
            school.sra = request.sra;
            school.schoolStatus = request.schoolStatus;
            //school.poc = request.poc;
            const newSchool = await this.schoolRepository.save(school);
            if (request.batches) {
                for (const batch of request.batches) {
                    const classes = await this.classesRepository.findOne({ where: { id: batch } });
                    classes.schoolId = school.id;
                    await this.classesRepository.save(classes);
                }
            }
            return {
                success: true,
                data: newSchool,
            };
        }
    }

}