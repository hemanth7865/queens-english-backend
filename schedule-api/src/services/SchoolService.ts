import { getRepository, getManager, Like } from "typeorm";
import { School } from "../entity/School";
import { SRA } from "../entity/SRA";
import { Classes } from "../entity/Classes";
import { SchoolView } from "../model/SchoolView";
import { COSMOS_API, OPERATION } from "../helpers/Constants";
import { Status } from "../helpers/Constants";
import { BatchStudent } from "../entity/BatchStudent";
import { Student } from "../entity/Student";
import { User } from "../entity/User";
import { isNullOrUndefined } from "util";
import { BatchService } from "./BatchService";
import { getRandomNumber } from "../helpers";
import { StudentService } from "./StudentService";
import { TeacherService } from "./TeacherService";
import axios from "./../helpers/axios";
const { logger } = require("../Logger.js");

export class SchoolService {
  private schoolRepository = getRepository(School);
  private sraRepository = getRepository(SRA);
  private classesRepository = getRepository(Classes);
  private batchStudentRepository = getRepository(BatchStudent);
  private studentRepository = getRepository(Student);
  private userRepository = getRepository(User);
  private batchService = new BatchService();
  private studentService = new StudentService();
  private TeacherService = new TeacherService();
  public request: any = {};

  async getAllSra() {
    const sra = await (
      await this.sraRepository.find({ where: { status: Status.ACTIVE } })
    ).sort((a, b) => a.name.localeCompare(b.name));
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

    let schools: School[] = [];
    let query_list = [];
    let query_string = "";

    if (parameters.id) {
      query_list.push(` id = '${parameters.id}' `);
    }
    if (parameters.schoolId) {
      query_list.push(` schoolId = '${parameters.schoolId}' `);
    }
    if (parameters.schoolName) {
      query_list.push(` schoolName like '%${parameters.schoolName}%' `);
    }
    if (parameters.schoolCode) {
      query_list.push(` schoolCode like '%${parameters.schoolCode}%' `);
    }
    if (parameters.locationCode) {
      query_list.push(` locationCode like '%${parameters.locationCode}%' `);
    }
    if (parameters.sraName) {
      let sras: any[] = [];
      const data = await this.getAllSra();
      sras = data.data;
      let sraId = data.data[Number(parameters.sraName)].id;
      query_list.push(` sraId = '${sraId}' `);
    }
    if (parameters.status) {
      const status =
        Number(parameters.status) === 0
          ? Status.ACTIVE_CAPS
          : Status.INACTIVE_CAPS;
      query_list.push(` schoolStatus = '${status}' `);
    }
    if (parameters.poc) {
      query_list.push(` poc like '%${parameters.poc}%' `);
    }
    if (parameters.createdAt) {
      if (parameters.createdAt.length === 9) {
        parameters.createdAt = `0${parameters.createdAt}`;
      }
      const createdAt = parameters.createdAt.split("/").reverse().join("-");
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
        return false;
      } else {
        return true;
      }
    };
    if ((await checkParams()) === false) {
      schools = await this.schoolRepository.find({
        where: { schoolStatus: Status.ACTIVE_CAPS },
        order: { createdAt: "DESC" },
      });
    } else {
      let query = `select * from school ${query_string} order by createdAt desc limit ${pageSize} offset ${
        current * pageSize
      }`;
      schools = await getManager().query(query);
    }

    let schoolView: SchoolView[] = [];
    let batchStudents: any[] = [];

    for (const element of schools) {
      let classes: any[] = [];
      let classesData: any[] = [];
      if (!parameters?.onlySchools) {
        classes = await this.classesRepository.find({
          where: { schoolId: element.id },
        });
        let classesLength = classes.length + 1;
        for (const c of classes) {
          let classObject: any[] = [];
          let studentArray: any[] = [];
          batchStudents = await this.batchStudentRepository.find({
            where: { batchId: c.id },
          });
          let batchStudentlength = batchStudents.length + 1;
          for (const student of batchStudents) {
            let user = await this.userRepository.findOne({
              where: { id: student.studentId },
            });
            let s = await this.studentRepository.findOne({
              where: { id: student.studentId },
            });
            let studentObject: any[] = [];
            studentObject.push({
              id: user.id,
              name: s?.studentName ?? user?.firstName + " " + user?.lastName,
              email: user?.email ?? user?.customerEmail,
              mobile: user?.phoneNumber,
              status: s?.status,
              schoolId: user?.schoolId ?? s?.schoolId,
            });
            do {
              studentArray = [...studentArray, ...studentObject];
            } while (!--batchStudentlength);
          }
          classObject.push({
            batchId: c.id,
            batchNumber: c.batchNumber,
            students: studentArray,
          });
          do {
            classesData = [...classesData, ...classObject];
          } while (!--classesLength);
        }
      }

      const sra = await this.sraRepository.findOne({
        where: { id: element.sraId },
      });
      let location = "";
      if (element.country) location += element.country;
      if (element.state) location += ", " + element.state;
      if (element.city) location += ", " + element.city;

      element.poc =
        element?.poc && element?.poc.includes("[")
          ? JSON.parse(element?.poc)
          : element?.poc
          ? [{ name: element.poc, phoneNumber: "" }]
          : [{ name: "", phoneNumber: "" }];
      let s = new SchoolView(
        element.id,
        element.schoolId,
        element.schoolName,
        element.schoolCode,
        element.locationCode,
        element.poc,
        sra?.name,
        sra,
        classes,
        classesData,
        element.createdAt.toLocaleDateString("en-IN"),
        element.schoolStatus,
        classes.length,
        location,
        Boolean(element.lockLesson)
      );
      schoolView.push(s);
    }

    // Fetching total school count for pagination to work
    const query = "SELECT count(*) as totalSchools FROM school";
    let totalSchools = await getManager().query(query);
    totalSchools = totalSchools[0]?.totalSchools;

    return {
      success: true,
      data: schoolView,
      total: totalSchools || schools.length,
      current: current,
      pageSize: pageSize,
    };
  }

  async listBatches() {
    const classes = await this.classesRepository.find({
      where: { schoolId: null, offlineBatch: 1 },
    });
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
        batch = await this.classesRepository.findOne({
          where: [{ id: b }, { batchNumber: b }],
        });
      } else {
        batch = await this.classesRepository.findOne({
          where: { batchNumber: b },
        });
      }
      //Teacher Update
      await this.userRepository.update(
        { id: batch.teacherId },
        {
          schoolId: request.saveSchool.id,
          schoolCode: request.saveSchool.schoolCode,
        }
      );

      batch.schoolId = request.saveSchool.id;
      batch.schoolName = request.saveSchool.schoolName;
      await this.classesRepository.save(batch);

      let studentsData: any;

      // Updating Students Table
      const studentsQuery = `SELECT student.id, student.studentId FROM  batch_students INNER JOIN student ON student.id = batch_students.studentId WHERE batch_students.batchId = '${batch.id}'`;
      const students = await getManager().query(studentsQuery);
      if (students && Array.isArray(students) && students.length > 0) {
        const studentIds = students.map((e) => `'${e.id}'`);
        const studentUpdateQuery = `UPDATE student SET student.schoolId = '${
          request.saveSchool.id
        }' WHERE student.id IN (${studentIds.join(",")});`;
        try {
          await getManager().query(studentUpdateQuery);
        } catch (error) {}
      }

      // Updating Users Table
      const usersQuery = `SELECT user.id FROM  batch_students INNER JOIN user ON user.id = batch_students.studentId WHERE batch_students.batchId = '${batch.id}'`;
      const users = await getManager().query(usersQuery);
      if (users && Array.isArray(users) && users.length > 0) {
        const userIds = students.map((e) => `'${e.id}'`);
        const userUpdateQuery = `UPDATE user SET user.schoolId = '${
          request.saveSchool.id
        }', user.schoolCode = '${
          request.saveSchool.schoolCode
        }'  WHERE user.id IN (${userIds.join(",")});`;
        try {
          await getManager().query(userUpdateQuery);
        } catch (error) {}
      }

      let cosmosStudents = [];

      if (students.length > 0) {
        for (let user of students) {
          cosmosStudents.push({
            value: user.studentId,
            type: "studentProfile",
          });
        }
      }
      try {
        const cosmosData = {
          ...batch,
          students: cosmosStudents,
          schoolCode: request.saveSchool.schoolCode,
          schoolStatus: request.saveSchool.schoolStatus,
        };
        await this.batchService.createBatch(cosmosData);
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
      let school: School;

      if (request.operation === OPERATION.ADD) {
        const currentSchools = await this.schoolRepository.find();

        for (let school of currentSchools) {
          if (
            request.schoolCode.toUpperCase() === school.schoolCode.toUpperCase()
          ) {
            return {
              success: true,
              errorMessage: "School code already exists",
            };
          }
        }

        school = new School();
        school.createdAt = new Date();
        request.schoolStatus = Status.ACTIVE_CAPS;
      } else {
        school = await this.schoolRepository.findOne({
          where: { id: request.id },
          relations: ["classes"],
        });
      }
      const prevLockLesson = school.lockLesson;
      school.schoolName = request.schoolName;
      school.schoolCode = request.schoolCode;
      school.locationCode = request.locationCode;
      school.schoolId = request.schoolCode + (request.locationCode ?? "");
      school.sraId = request.sraId;
      school.schoolStatus = request.schoolStatus;
      school.poc = Array.isArray(request?.poc)
        ? JSON.stringify(request?.poc)
        : request.poc;
      school.country = request.country;
      school.state = request.state;
      school.city = request.city;
      school.lockLesson = request.lockLesson ?? false;

      const saveSchool = await this.schoolRepository.save(school);

      // overwriting the lockLesson feature for teachers if it is changed
      if (prevLockLesson !== school.lockLesson) {
        const teachers = school.classes
          .map((e) => {
            if (!e.teacherId) return null;
            return {
              id: e.teacherId,
              lockLesson: school.lockLesson,
            };
          })
          .filter((e) => e !== null);
        if (teachers.length > 0) {
          await this.TeacherService.updateLockLessonFeature(teachers);
        }
      }

      if (!isNullOrUndefined(request.batches)) {
        if (
          !isNullOrUndefined(request.batches.addBatches) &&
          request.batches.addBatches.length > 0
        ) {
          request.saveSchool = saveSchool;
          request.batchesToSave = request.batches.addBatches;
          await this.saveSchooltoBatches(request);
        }

        if (
          !isNullOrUndefined(request.batches.removeBatches) &&
          request.batches.removeBatches.length > 0
        ) {
          request.saveSchool = {
            id: null,
            schoolName: null,
            schoolCode: null,
            schoolStatus: null,
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
      return {
        success: false,
        errorMessage: error.message,
      };
    }
  }

  async getAvailableStudentIds(request: { schoolId: string; count?: number }) {
    let { schoolId, count } = request;
    if (!schoolId || schoolId?.trim() === "") {
      return {
        success: false,
        errorMessage: "Please provide schoolId",
      };
    }

    if (!count) count = 1;

    const school = await this.schoolRepository.findOne({
      where: { id: schoolId },
    });
    if (!schoolId) {
      return {
        success: false,
        errorMessage: "School does not exists with provided schoolId",
      };
    }

    const existingStudentIds = await this.studentRepository.find({
      select: ["studentID"],
      where: {
        studentID: Like(`${school.schoolCode}____`),
      },
    });

    const result = [];
    const existingIDSet = new Set(existingStudentIds.map((e) => e.studentID));

    let i = 1;
    while (result.length < count && i <= 9999) {
      const newID: any = `${school.schoolCode}${i.toString().padStart(4, "0")}`;
      if (!existingIDSet.has(newID)) {
        result.push(newID);
      }
      i++;
    }

    return {
      success: true,
      data: result,
    };
  }

  async updateStudentIdsToNewFormat(schoolCode: string) {
    if (!schoolCode || schoolCode?.trim() === "") {
      return {
        success: false,
        message: "Please provide a valid school code",
      };
    }
    let updatedStudents = [];
    let errors = [];

    // Fetching all schools
    let schoolResponse: any = await this.schoolRepository.find({
      select: ["id", "schoolCode"],
      where: {
        schoolCode: schoolCode,
      },
    });

    if (schoolResponse.length === 0) {
      return {
        success: false,
        message: "Please provide a valid school code",
      };
    }

    const school = schoolResponse[0];

    // Fetching all students linked with this school
    const studentQuery = `SELECT student.* FROM batch_students
        INNER JOIN classes ON batch_students.batchId = classes.id
        INNER JOIN student ON batch_students.studentId = student.id
        WHERE classes.schoolId = "${school.id}"`;

    let studentsData = await getManager().query(studentQuery);
    if (studentsData.length > 0) {
      //   Fetching available ids
      let availableStudentIds: any = [];
      try {
        const response = await this.getAvailableStudentIds({
          schoolId: school.id,
          count: studentsData.length,
        });
        if (response.success === false) throw new Error(response.errorMessage);
        availableStudentIds = response.data;
      } catch (error) {
        errors.push(error.message);
      }

      let idCount = 0;
      for (const student of studentsData) {
        // Checking if we don't have any incorrect student to update
        if (
          !student.id ||
          (student.studentID &&
            student.studentID?.startsWith(school.schoolCode))
        ) {
          continue;
        }
        const updatedStudentId = availableStudentIds[idCount];
        const password = getRandomNumber(6);
        idCount += 1;

        let user: any = await this.userRepository.findOne({
          where: {
            id: student.id,
          },
        });

        user = { ...user, studentID: updatedStudentId, password: password };
        delete user.studentId;

        try {
          await this.studentService.saveStudentDetails(user);
          updatedStudents.push({
            id: student.id,
            previousStudentId: student.studentID,
            updatedStudentId: updatedStudentId,
          });
        } catch (error) {
          logger.error(
            `While Converting studentId to new format : School : ${school.schoolCode} : Student Id : ${user.id}`,
            error
          );
        }
      }
    }

    return {
      success: true,
      total: updatedStudents.length,
      updatedStudents,
      errors,
    };
  }

  async deactivateSchool(schoolId: string) {
    try {
      const response = {
        batches: {
          success: 0,
          failure: 0,
        },
        teachers: {
          success: 0,
          failure: 0,
        },
        students: {
          success: 0,
          failure: 0,
        },
      };

      // For batches
      const batchResponse = await this.batchService.listBatch(null, {
        schoolId: schoolId,
        current: 0,
        pageSize: 100,
      });
      const batches = batchResponse.data || [];

      for (const batch of batches) {
        if (batch.status === 0) continue;
        const cosmosBatch = await this.batchService.getCosmosBatch(batch.id);
        if (cosmosBatch) {
          try {
            const batchBody = {
              ...cosmosBatch,
              edit: true,
              status: 0,
              useNewZoomLink: 0,
            };
            const resp: any = await this.batchService.createBatch(
              batchBody,
              true
            );
            if (resp?.status === false) {
              response.batches.failure += 1;
              continue;
            }
            response.batches.success += 1;
          } catch (error) {
            response.batches.failure += 1;
          }
        }
      }

      // For teachers
      const teachersQuery = `SELECT id FROM user where user.schoolId = '${schoolId}' AND user.type = 'teacher'`;
      const teachersIdsResp = await getManager().query(teachersQuery);
      const teachersIds = teachersIdsResp.map((e) => e.id);

      for (const teacherId of teachersIds) {
        const teacherResp = await this.TeacherService.leadFullDetails(
          {},
          teacherId
        );
        if (!teacherResp?.success || !teacherResp?.data) continue;

        const teacher = teacherResp?.data;
        const teacherBody = {
          ...teacher,
          status: 0,
          lockLesson: true,
          offlineUser: true,
        };

        try {
          const resp: any = await this.TeacherService.saveTeacher(teacherBody);
          if (resp?.status === 400 || resp?.status === 501 || resp?.error) {
            response.teachers.failure += 1;
            continue;
          }
          response.teachers.success += 1;
        } catch (error) {
          response.teachers.failure += 1;
        }
      }

      // For Students
      let current = 1;
      const pageSize = 100;
      let students = [];
      do {
        const studentsRes = await this.studentService.listStudentDetails(
          {},
          {
            schoolId: schoolId,
            type: "student",
            pageSize: pageSize,
            current: current,
          }
        );
        students = studentsRes?.data || [];
        current += 1;

        for (const student of students) {
          const studentBody = {
            ...student,
            status: Status.INACTIVE,
          };

          try {
            const resp: any = await this.studentService.saveStudentDetails(
              studentBody,
              {
                ignoreDuplicateCheck: true,
              }
            );
            if (resp?.error) {
              response.students.failure += 1;
              continue;
            }
            response.students.success += 1;
          } catch (error) {
            response.students.failure += 1;
          }
        }
      } while (students.length > 0);

      // Changing status of the school to `Inactive`
      const updateQuery = `UPDATE school SET schoolStatus = 'Inactive' WHERE id = '${schoolId}'`;
      await getManager().query(updateQuery);

      return response;
    } catch (error) {
      console.log("Error while inactivating school", error?.message);
      throw new Error(error?.message);
    }
  }

  async syncStudentsCreatedByTeacher() {
    // Getting students from CosmosDB
    const cosmos_url = COSMOS_API.STUDENTS_CREATED_BY_TEACHER;
    try {
      const data = await axios.get(cosmos_url).then((res) => {
        return res?.data || [];
      });

      // preparing students data classProfileId wise
      const studentsData: any = {};

      for (const student of data) {
        if (student.classProfileId) {
          if (!studentsData[student.classProfileId]) {
            studentsData[student.classProfileId] = [];
          }
          studentsData[student.classProfileId].push(student);
        }
      }

      const batchIds = Object.keys(studentsData);
      for (const currentBatchId of batchIds) {
        const currentBatch = await this.batchService.getBatchDetails(
          currentBatchId
        );

        const schoolId = currentBatch?.data?.classes?.schoolId;
        let school = await this.schoolRepository.findOne({
          where: { id: schoolId },
        });

        const allStudentsOfBatch = studentsData[currentBatchId];
        const studentsCreatedSuccessfully = [];
        for (const student of allStudentsOfBatch) {
          student.schoolId = schoolId;
          if (!student?.studentID && student?.schoolId) {
            student.studentID = await (
              await this.getAvailableStudentIds({ schoolId })
            ).data[0];

            if (student.phoneNumber.startsWith(school.schoolCode)) {
              student.phoneNumber = student.studentID;
            }
          }
          if (!student?.password && student?.schoolId) {
            student.password = getRandomNumber(6);
          }
          console.log("student ==>>", student);
          const res = await this.studentService.saveStudentDetails(student, {
            ignoreDuplicateCheck: false,
            cosmosSync: false,
          });
          console.log("RES ==>>", res);
          if (res.id) {
            studentsCreatedSuccessfully.push(student);
          }
        }

        const idsOfStudentsBatched = studentsCreatedSuccessfully.map(
          (e) => e.id
        );

        await this.batchService.addStudents(
          idsOfStudentsBatched,
          currentBatchId
        );

        for (const student of studentsCreatedSuccessfully) {
          student.isCreatedInMySQL = true;
          const res = await this.studentService.saveStudentDetails(student, {
            ignoreDuplicateCheck: false,
            cosmosSync: false,
          });
        }
      }

      return { status: 200, message: "Users updates successfully" };
    } catch (error) {
      console.log("ERROR", error);
      return { status: 400, error: error?.message };
    }
  }
}
