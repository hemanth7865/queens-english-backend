import { getRepository, getManager, Like, In } from "typeorm";
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
const { logger } = require("../Logger.js");

import axios from "./../helpers/axios";
import {
  ContractStatus,
  InitialPaymentStatus,
  LeadCategory,
  SchoolStage,
} from "../types";

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

  private COSMOS_URL = process.env.COSMOS_URL;
  private COSMOS_CODE = process.env.COSMOS_CODE;

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
      const data = await this.getAllSra();
      const sraId = data.data[Number(parameters.sraName)]?.id;
      if (sraId) query_list.push(` sraId = '${sraId}' `);
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
      query_string = "where " + query_list.join(" and ");
    }

    current--;

    const checkParams = () => {
      return !(isNaN(parameters.current) && isNaN(parameters.pageSize));
    };

    if (!checkParams()) {
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

    const schoolIds = schools.map((s) => s.id);
    let classes: any[] = [];
    let batchStudents: any[] = [];
    let users: any[] = [];
    let students: any[] = [];

    let classesDataMap: Record<string, any[]> = {};

    if (!parameters?.onlySchools && schoolIds.length > 0) {
      classes = await this.classesRepository.find({
        where: { schoolId: In(schoolIds) },
      });

      const classIds = classes.map((c) => c.id);
      if (classIds.length > 0) {
        batchStudents = await this.batchStudentRepository.find({
          where: { batchId: In(classIds) },
        });
      }

      const studentIds = batchStudents.map((bs) => bs.studentId);
      if (studentIds.length > 0) {
        users = await this.userRepository.find({
          where: { id: In(studentIds) },
        });
        students = await this.studentRepository.find({
          where: { id: In(studentIds) },
        });
      }

      const userMap = new Map(users.map((u) => [u.id, u]));
      const studentMap = new Map(students.map((s) => [s.id, s]));

      // Organize batch students per class
      const batchMap: Record<string, any[]> = {};
      for (const bs of batchStudents) {
        if (!batchMap[bs.batchId]) batchMap[bs.batchId] = [];
        batchMap[bs.batchId].push(bs);
      }

      // Build class-wise student data
      for (const c of classes) {
        const studentArray = [];
        const bsList = batchMap[c.id] || [];

        for (const bs of bsList) {
          const user = userMap.get(bs.studentId);
          const s = studentMap.get(bs.studentId);

          studentArray.push({
            id: user?.id,
            name: s?.studentName ?? user?.firstName + " " + user?.lastName,
            email: user?.email ?? user?.customerEmail,
            mobile: user?.phoneNumber,
            status: s?.status,
            schoolId: user?.schoolId ?? s?.schoolId,
          });
        }

        const classObject = {
          batchId: c.id,
          batchNumber: c.batchNumber,
          students: studentArray,
        };

        if (!classesDataMap[c.schoolId]) classesDataMap[c.schoolId] = [];
        classesDataMap[c.schoolId].push(classObject);
      }
    }

    const schoolView: SchoolView[] = [];

    for (const school of schools) {
      const sra = await this.sraRepository.findOne({
        where: { id: school.sraId },
      });

      const location = [school.country, school.state, school.city]
        .filter(Boolean)
        .join(", ");

      school.poc =
        school?.poc && school?.poc.includes("[")
          ? JSON.parse(school?.poc)
          : school?.poc
          ? [{ name: school.poc, phoneNumber: "" }]
          : [{ name: "", phoneNumber: "" }];

      const schoolClasses = classes.filter((c) => c.schoolId === school.id);
      const schoolClassesData = classesDataMap[school.id] || [];

      const s = new SchoolView(
        school.id,
        school.schoolId,
        school.schoolName,
        school.schoolCode,
        school.locationCode,
        school.poc,
        sra?.name,
        sra,
        schoolClasses,
        schoolClassesData,
        new Date(school.createdAt).toLocaleDateString("en-IN"),
        school.schoolStatus,
        schoolClasses.length,
        location,
        Boolean(school.lockLesson)
      );
      schoolView.push(s);
    }

    const totalQuery = "SELECT count(*) as totalSchools FROM school";
    let totalSchools = await getManager().query(totalQuery);
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
        school = new School();
        school.createdAt = new Date();
        request.schoolStatus = Status.ACTIVE_CAPS;
        school.leadId = "";

        school.stage = SchoolStage.ReadyForContract;
        school.initialPaymentStatus = InitialPaymentStatus.Unpaid;
        school.contractStatus = ContractStatus.NotSigned;

        const currentYear = new Date().getFullYear();
        school.saleYear = currentYear.toString();

        school.studentCount = 0;
        school.address = "";
        school.territory = "";
        school.expectedPrice = 0;
        school.revenue = 0;
        school.realRevenue = 0;
        school.paidDate = null;
        school.postalCode = null;
        school.leadCategory = LeadCategory.NEW_SALE;
        school.designation = "";
        school.leadOwner = "";
        school.hasTVForITTs = false;
        school.mapLocationURL = null;
        school.startDate = null;
        school.booksDate = null;
        school.paymentCycle = null;
        school.paymentType = null;
        school.initialAmount = null;
        school.schoolCode = await this.getUniqueSchoolCode(request.schoolName);
        if (!school.schoolCode) {
          throw new Error("Unable to create the School Code, Please retry.");
        }
        school.schoolId = school.schoolCode + (request.locationCode ?? "");
      } else {
        school = await this.schoolRepository.findOne({
          where: { id: request.id },
          relations: ["classes"],
        });
      }
      const prevLockLesson = school.lockLesson;
      school.schoolName = request.schoolName;
      school.locationCode = request.locationCode;
      school.sraId = request.sraId;
      school.schoolStatus = request.schoolStatus;
      school.poc = Array.isArray(request?.poc ?? [])
        ? JSON.stringify(request?.poc)
        : request.poc;
      school.country = request.country;
      school.state = request.state;
      school.city = request.city;
      school.lockLesson = request.lockLesson ?? false;

      const saveSchool = await this.schoolRepository.save(school);

      const savedSchool = await this.schoolRepository.findOne({
        where: { id: saveSchool.id },
        relations: ["sra"],
      });

      if (savedSchool) {
        await this.updateCosmosSchool(savedSchool);
      }

      // overwriting the lockLesson feature for teachers if it is changed
      if (prevLockLesson !== school.lockLesson) {
        const teachers = (school?.classes ?? [])
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

  async updateCosmosSchool(school: School) {
    const options = {
      url: `${this.COSMOS_URL}/api/school?code=${this.COSMOS_CODE}`,
      json: true,
      body: [school],
    };

    await axios
      .post(options.url, options.body)
      .then(async (res) => {
        return {
          success: true,
          message: "School Updated Successfully.",
        };
      })
      .catch((error) => {
        return {
          success: false,
          message: `Error while updating school in cosmosDB. ${error}`,
        };
      });
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

  // async deleteSchool(schoolId: string) {
  //   try {
  //     const response = {
  //       batches: {
  //         success: 0,
  //         failure: 0,
  //       },
  //       teachers: {
  //         success: 0,
  //         failure: 0,
  //       },
  //       students: {
  //         success: 0,
  //         failure: 0,
  //       },
  //     };
  //     if (schoolId && schoolId?.trim()) {
  //       // Changing status of the school to `Inactive`
  //       const deleteQuery = `DELETE FROM school WHERE id = '${schoolId}'`;
  //       await getManager().query(deleteQuery);
  //       response["deleteQuery"] = deleteQuery;
  //     }

  //     return response;
  //   } catch (error) {
  //     console.log("Error while inactivating school", error?.message);
  //     throw new Error(error?.message);
  //   }
  // }

  async syncStudentsCreatedByTeacher() {
    logger.info(`== SYNC STUDENT FROM COSMOS TO MYSQL STARTED ==`);
    logger.info(`SSFCTM :: SYNC STUDENT FROM COSMOS TO MYSQL STARTED`);
    // Getting students from CosmosDB
    const cosmos_url = COSMOS_API.STUDENTS_CREATED_BY_TEACHER;
    const unsuccessfulRecords = [];
    const successfulRecords = [];
    try {
      const data = await axios.get(cosmos_url).then((res) => {
        return res?.data || [];
      });
      logger.info(`SSFCTM :: ALL STUDENTS :: ${JSON.stringify(data)}`);

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
        logger.info(`SSFCTM :: BATCH ID :: ${currentBatchId}`);
        const allStudentsOfBatch = studentsData[currentBatchId];
        const currentBatch = await this.batchService.getBatchDetails(
          currentBatchId
        );

        if (!currentBatch?.data?.classes) {
          logger.info(`SSFCTM :: BATCH DATA NOT FOUND`);
          unsuccessfulRecords.push(
            allStudentsOfBatch.map((e: any) => ({
              ...e,
              message: "Batch does not exists.",
            }))
          );
          continue;
        }

        logger.info(
          `SSFCTM :: BATCH DATA FOUND :: ${JSON.stringify(
            currentBatch.data.classes
          )}`
        );

        const schoolId = currentBatch?.data?.classes?.schoolId;
        logger.info(`SSFCTM :: SCHOOL ID :: ${schoolId}`);
        let school = await this.schoolRepository.findOne({
          where: { id: schoolId },
        });

        if (!school) {
          logger.info(`SSFCTM :: SCHOOL DATA NOT FOUND`);
          unsuccessfulRecords.push(
            allStudentsOfBatch.map((e: any) => ({
              ...e,
              message: "School does not exists.",
            }))
          );
          continue;
        }

        logger.info(`SSFCTM :: SCHOOL DATA FOUND :: ${JSON.stringify(school)}`);

        logger.info(
          `SSFCTM :: ALL NEW STUDENTS OF A BATCH :: ${JSON.stringify(
            allStudentsOfBatch
          )}`
        );

        const studentsCreatedSuccessfully = [];
        for (const student of allStudentsOfBatch) {
          logger.info(`SSFCTM :: STUDENT PREV :: ${JSON.stringify(student)}`);
          student.schoolId = schoolId;
          if (!student?.studentID && student?.schoolId) {
            student.studentID = await (
              await this.getAvailableStudentIds({ schoolId })
            ).data[0];

            if (
              school.schoolCode &&
              student.phoneNumber.startsWith(school.schoolCode)
            ) {
              student.phoneNumber = student.studentID;
            }
          }
          if (!student?.password && student?.schoolId) {
            student.password = getRandomNumber(6);
          }

          logger.info(
            `SSFCTM :: STUDENT POST EDITING DATA :: ${JSON.stringify(student)}`
          );

          const res = await this.studentService.saveStudentDetails(student, {
            ignoreDuplicateCheck: false,
            cosmosSync: false,
          });
          if (res.id) {
            logger.info(
              `SSFCTM :: STUDENT CREATED SUCCESSFULLY :: ${JSON.stringify(
                student
              )}`
            );
            studentsCreatedSuccessfully.push(student);
            successfulRecords.push(student);
          } else {
            logger.info(
              `SSFCTM :: STUDENT DID NOT CREATED SUCCESSFULLY :: ${JSON.stringify(
                student
              )}`
            );
            unsuccessfulRecords.push(student);
          }
        }

        const idsOfStudentsBatched = studentsCreatedSuccessfully.map(
          (e) => e.id
        );

        logger.info(`SSFCTM :: ADDING STUDENTS TO THE BATCH`);
        await this.batchService.addStudents(
          idsOfStudentsBatched,
          currentBatchId
        );

        for (const student of studentsCreatedSuccessfully) {
          student.isCreatedInMySQL = true;
          logger.info(
            `SSFCTM :: UPDATING STUDENT TO COSMOS DB :: ${JSON.stringify(
              student
            )}`
          );
          const res = await this.studentService.saveStudentDetails(student, {
            ignoreDuplicateCheck: false,
            cosmosSync: true,
          });
        }
      }

      logger.info(`== SYNC STUDENT FROM COSMOS TO MYSQL ENDED ==`);

      return {
        status: 200,
        message: "Users updates successfully",
        successfulRecords: successfulRecords.length,
        unsuccessfulRecords: unsuccessfulRecords,
      };
    } catch (error) {
      logger.info(
        `== SYNC STUDENT FROM COSMOS TO MYSQL ENDED WITH ERROR :: ${
          error?.message || " "
        }`
      );
      console.log("ERROR", error);
      return { status: 400, error: error?.message };
    }
  }

  async getUniqueSchoolCode(rawSchoolName: string) {
    const schoolRepo = this.schoolRepository;
    // Removing every extra characters like `.`, `!` and numbers
    const schoolName = rawSchoolName.replace(/[^a-zA-Z\s]/g, "").toUpperCase();
    const schoolNameWithoutSpaces = schoolName.replace(/\s/g, "");

    const words = schoolName.split(" ");
    let schoolCode = "";

    async function getSchoolBySchoolCOde(schoolCode) {
      return await schoolRepo.findOne({
        where: { schoolCode: schoolCode },
      });
    }

    async function createSchoolCodeCombinations(
      wordIndex,
      charIndex,
      existingString
    ) {
      if (schoolCode !== "") return;

      if (existingString.length === 4) {
        // CHECK if it exists;
        let existingSchool = await getSchoolBySchoolCOde(existingString);
        if (!existingSchool) {
          schoolCode = existingString;
          return;
        }
      }
      if (wordIndex >= words.length) return;
      if (charIndex >= words[wordIndex].length) return;

      await createSchoolCodeCombinations(
        wordIndex + 1,
        charIndex,
        existingString + words[wordIndex][charIndex]
      );
      await createSchoolCodeCombinations(
        wordIndex,
        charIndex + 1,
        existingString + words[wordIndex][charIndex]
      );
      await createSchoolCodeCombinations(
        wordIndex,
        charIndex + 1,
        existingString
      );
      await createSchoolCodeCombinations(
        wordIndex + 1,
        charIndex,
        existingString
      );
    }

    await createSchoolCodeCombinations(0, 0, "");

    /**
     * In some cases where schoolName is less than 4 words and the above code is not able to create combinations
     * In those cases we are adding 0, 1, 2... digits in the end of school name and trying to form a 4 digit unique schoolCode
     *  */
    if (schoolCode === "") {
      let padNumber = 0;
      let tSchoolName = schoolNameWithoutSpaces.slice(0, 2);
      do {
        const tempSchoolCode = tSchoolName.padEnd(4, padNumber.toString());
        const existingSchool = await getSchoolBySchoolCOde(tempSchoolCode);
        if (!existingSchool) {
          schoolCode = tempSchoolCode;
        }
        padNumber += 1;
      } while (schoolCode === "");
    }

    return schoolCode;
  }
}
