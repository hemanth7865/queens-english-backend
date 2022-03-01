import { Any, getConnection, getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { Teacher as Teacher } from "../entity/Teacher";
import { LeadView } from "../model/LeadView";
import { TeacherAvailability as TeacherAvailability } from "../entity/TeacherAvailability";
import { getManager } from "typeorm";
import { BatchAvailability } from "../entity/BatchAvailability";
import { BatchStudent } from "../entity/BatchStudent";
import { Classes } from "../entity/Classes";
import { BatchView } from "../model/BatchView";
import { TeacherView } from "../model/TeacherView";
import axios from "./../helpers/axios";
import { v4 as uuidv4 } from "uuid";

export class BatchService {
  private classesRepository = getRepository(Classes);
  private batchAvailabilityRepository = getRepository(BatchAvailability);
  private batchStudentRepository = getRepository(BatchStudent);

  BatchService() {}

  constructor() {
    axios.defaults;
  }

  async createBatch(data: any) {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    var batchStudent: BatchStudent[] = [];
    var studnets = [];
    let create: boolean = false;
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      if(!data.id){
        data.id = uuidv4();
        create = true;
      }

      if (data.students) {
        let i = 0;
        for (const element of data.students) {
          var batchStud = new BatchStudent();
          batchStud.type = element.type;
          if (element.value) batchStud.studentId = element.value;
          batchStud.created_at = new Date();
          batchStud.updated_at = new Date();
          batchStud.type = "studentProfile";
          if(element.value){
            batchStudent[i++] = batchStud;
            studnets.push({id: batchStud.studentId, type: batchStud.type});
          }
        }
      }

      data.students = batchStudent;

      var cosomos_url = "/api/classProfile/" + data.id;

      data.type = data.type || "classProfile";
      data.followupVersion = data.followupVersion || "v2";
      data.version = data.version || "v2";
      data.maxAttemptsAllowed = data.maxAttemptsAllowed || -1;

      let alreadyExists;

      if(create){
        alreadyExists = await this.batchExists(data);
        if(alreadyExists?.id){
          return { status: false, message: "Batch Number Already Exists" };
        }
      }else if(!create) {
        alreadyExists = await this.batchExists(data, 'id');
        if(!alreadyExists?.id){
          return { status: false, message: "Batch Not Found" };
        }
      }

      const options = {
        url: cosomos_url,
        json: true,
        body: {
          id: data.id,
          type: data.type,
          batchNumber: data.batchNumber,
          teacherId: data.teacherId,
          classStartDate: data.classStartDate,
          classEndDate: data.classEndDate,
          lessonStartTime: data.lessonStartTime,
          lessonEndTime: data.lessonEndTime,
          ageGroup: data.ageGroup,
          startingLessonId: data.startingLessonId,
          endingLessonId: data.endingLessonId,
          version: data.version,
          followupVersion: data.followupVersion,
          maxAttemptsAllowed: data.maxAttemptsAllowed,
          partitionKey: data.partitionKey,
          classCode: data.classCode,
          students: studnets,
        },
      };

      var res1 = {};
      if (!data.id || create) {
        res1 = await axios
          .post(options.url, options.body)
          .then(async (res) => {
            data.id = res.data.id;
            var batch = await this.createBatchSql(data);
            return batch;
          })
          .catch((error) => {
            return Promise.reject(error);
          });
      } else {

        const studentsChange = await this.getBatchStudentsChange(data, alreadyExists);

        console.log(studentsChange);

        return { status: false, message: "Batch Number Already Exists" };

        res1 = await axios
          .put(options.url, options.body)
          .then(async (res) => {
            data.id = res.data.id;
            var batch = await this.updateBatchSql(data);
            return batch;
          })
          .catch((error) => {
            return Promise.reject(error);
          });
      }

      await queryRunner.commitTransaction();
      return res1;
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      return { status: false, message: "Service Error" };
    } finally {
      await queryRunner.release();
    }
  }

  async batchExists(data: Classes, column = "batchNumber"): Promise<boolean|Classes>{
    let result: boolean|Classes = false;

    const batch = await this.classesRepository.createQueryBuilder("classes").where("classes."+column+" = :val", {val: data[column]}).getOne();

    if(batch){
      result = batch;
    }

    return result;
  }

  async getBatchStudentsChange(batch: Classes, oldBatch: Classes): Promise<{add: [], remove: []}> {
    let result: {add: [], remove: []} = {add: [], remove: []};

    const students = await getRepository(BatchStudent)
      .createQueryBuilder("batchStudent")
      .leftJoin("batchStudent.student", "student")
      .addSelect(["student.firstName", "student.lastName"])
      .where("batchStudent.batchId = :id", { id: batch.id })
      .getMany();

    const newStudents = batch.students;
    
    oldBatch.students = students;

    console.log("batch", batch, oldBatch, students, newStudents);

    return result;
  }

  async createBatchSql(data: any) {
    try {
      var batchStudent: BatchStudent[] = [];
      var classes = new Classes();
      classes.classCode = data.classCode;
      classes.batchNumber = data.batchNumber;
      classes.teacherId = data.teacherId;

      classes.startingLessonId = data.startingLessonId;
      classes.endingLessonId = data.endingLessonId;
      classes.classStartDate = data.classStartDate;

      classes.classEndDate = data.classEndDate;
      classes.lessonStartTime = data.lessonStartTime;
      classes.lessonEndTime = data.lessonEndTime;

      classes.version = data.version;
      classes.followupVersion = data.followupVersion;
      classes.maxAttemptsAllowed = data.maxAttemptsAllowed;
      classes.ageGroup = data.ageGroup;
      classes.type = data.type;
      classes.createdBy = data.createdBy;

      if (data.id) {
        classes.id = data.id;
        classes.updated_at = new Date();
      } else {
        classes.created_at = new Date();
        classes.updated_at = new Date();
      }

      classes = await this.classesRepository.save(classes);
      if (data.teacherId) {
        var quer = `select id, firstName, lastName from user where (id like '%${data.teacherId}%')`;
        var details = await getManager().query(quer);
        if (details.length > 0 && details[0].firstName && details[0].lastName)
          classes.name = details[0].firstName + " " + details[0].lastName;
      }

      if (data.batchAvailability) {
        let i = 0;
        for (const element of data.batchAvailability) {
          var batchAvail = new BatchAvailability();
          batchAvail.start_date = new Date();
          batchAvail.end_date = new Date();
          if (element.start_slot) {
            let time = element.start_slot.split(":");
            batchAvail.start_slot = time[0];
            console.log("time is ", time);
            batchAvail.start_min = time[1];
            batchAvail.startMin = time[0] * 60 + time[1];
          }
          if (element.end_slot) {
            let time = element.end_slot.split(":");
            batchAvail.end_slot = time[0];
            console.log("time is ", time);
            batchAvail.end_min = time[1];
            batchAvail.endMin = time[0] * 60 + time[1];
          }

          batchAvail.weekday = element.weekday;
          batchAvail.created_at = new Date();
          batchAvail.updated_at = new Date();
          if (element.id) {
            batchAvail.id = element.id;
          } else if (classes.id) {
            batchAvail.id = classes.id;
          }

          batchAvail = await this.batchAvailabilityRepository.save(batchAvail);
          classes.batchAvailability = batchAvail;
        }

        if (data.students) {
          let i = 0;
          for (const element of data.students) {
            var batchStud = new BatchStudent();
            batchStud.type = element.type;
            batchStud.studentId = element.studentId;
            batchStud.batchId = classes.id;
            batchStud.created_at = new Date();
            batchStud.updated_at = new Date();
            batchStud = await this.batchStudentRepository.save(batchStud);
            if (element.studentId) {
              var quer = `select id, firstName, lastName from user where (id like '%${element.studentId}%')`;
              var details = await getManager().query(quer);
              if (
                details.length > 0 &&
                details[0].firstName &&
                details[0].lastName
              )
                batchStud.name =
                  details[0].firstName + " " + details[0].lastName;
            }
            batchStudent[i++] = batchStud;
          }
        }
        classes.students = batchStudent;
      }

      return classes;
    } catch (error) {
      console.log(error);
      throw new Error("Excetion while stroing teacher");
    }
  }

  async updateBatchSql(data: any) {
    try {
      var batchStudent: BatchStudent[] = [];
      var classes = new Classes();
      classes.classCode = data.classCode;
      classes.batchNumber = data.batchNumber;
      classes.teacherId = data.teacherId;

      classes.startingLessonId = data.startingLessonId;
      classes.endingLessonId = data.endingLessonId;
      classes.classStartDate = data.classStartDate;

      classes.classEndDate = data.classEndDate;
      classes.lessonStartTime = data.lessonStartTime;
      classes.lessonEndTime = data.lessonEndTime;

      classes.version = data.version;
      classes.followupVersion = data.followupVersion;
      classes.maxAttemptsAllowed = data.maxAttemptsAllowed;
      classes.ageGroup = data.ageGroup;
      classes.type = data.type;
      classes.createdBy = data.createdBy;

      if (data.id) {
        classes.id = data.id;
        classes.updated_at = new Date();
      } else {
        classes.created_at = new Date();
        classes.updated_at = new Date();
      }

      classes = await this.classesRepository.save(classes);
      if (data.teacherId) {
        var quer = `select id, firstName, lastName from user where (id like '%${data.teacherId}%')`;
        var details = await getManager().query(quer);
        if (details.length > 0 && details[0].firstName && details[0].lastName)
          classes.name = details[0].firstName + " " + details[0].lastName;
      }

      if (data.batchAvailability) {
        let i = 0;
        for (const element of data.batchAvailability) {
          var batchAvail = new BatchAvailability();
          batchAvail.start_date = new Date();
          batchAvail.end_date = new Date();
          if (element.start_slot) {
            let time = element.start_slot.split(":");
            batchAvail.start_slot = time[0];
            console.log("time is ", time);
            batchAvail.start_min = time[1];
            batchAvail.startMin = time[0] * 60 + time[1];
          }
          if (element.end_slot) {
            let time = element.end_slot.split(":");
            batchAvail.end_slot = time[0];
            console.log("time is ", time);
            batchAvail.end_min = time[1];
            batchAvail.endMin = time[0] * 60 + time[1];
          }

          batchAvail.weekday = element.weekday;
          batchAvail.created_at = new Date();
          batchAvail.updated_at = new Date();
          if (element.id) {
            batchAvail.id = element.id;
          } else if (classes.id) {
            batchAvail.id = classes.id;
          }

          batchAvail = await this.batchAvailabilityRepository.save(batchAvail);
          classes.batchAvailability = batchAvail;
        }

        if (data.students) {
          let i = 0;
          for (const element of data.students) {
            var batchStud = new BatchStudent();
            batchStud.type = element.type;
            batchStud.studentId = element.studentId;
            batchStud.batchId = classes.id;
            batchStud.created_at = new Date();
            batchStud.updated_at = new Date();
            batchStud = await this.batchStudentRepository.save(batchStud);
            if (element.studentId) {
              var quer = `select id, firstName, lastName from user where (id like '%${element.studentId}%')`;
              var details = await getManager().query(quer);
              if (
                details.length > 0 &&
                details[0].firstName &&
                details[0].lastName
              )
                batchStud.name =
                  details[0].firstName + " " + details[0].lastName;
            }
            batchStudent[i++] = batchStud;
          }
        }
        classes.students = batchStudent;
      }

      return classes;
    } catch (error) {
      console.log(error);
      throw new Error("Excetion while stroing teacher");
    }
  }

  async listBatch(request: Request, parameters) {
    var current = parseInt(parameters.current);
    var pageSize = parseInt(parameters.pageSize);
    var batchView: BatchView[] = [];

    var offset = parseInt(parameters.current);
    var current = offset;
    //const limit  =  parseInt(request.query['pageSize']);
    var limit = parameters.pageSize;
    if (offset == 1) {
      offset = 0;
    }

    let query_list = [];
    let query_string = "";

    const batchId = parameters.batchId;
    if (batchId) {
      query_string = query_string + ` batchNumber like  '%${batchId}%' `;
      query_list.push(` batchNumber like  '%${batchId}%' `);
    }

    const createdBy = parameters.createdBy;
    if (createdBy) {
      query_string = query_string + ` createdBy =${createdBy} `;
      query_list.push(` createdBy like '%${createdBy}%' `);
    }

    var start_slot = parameters.start_slot;
    var end_slot = parameters.end_slot;
    var week_day = parameters.week_day;
    let start_min;
    let end_min;
    let startMin;
    let endMin;
    if (start_slot) {
      let time = start_slot.split(":");
      start_slot = time[0];
      start_min = time[1];
      startMin = time[0] * 60 + time[1];
    }

    if (end_slot) {
      let time = end_slot.split(":");
      end_slot = time[0];
      end_min = time[1];
      endMin = time[0] * 60 + time[1];
    }

    if (start_slot && end_slot) {
      query_string =
        query_string + `  ${startMin} >= startMin and ${endMin}<=endMin;`;
      query_list.push(`  ${startMin} >= startMin and ${endMin}<=endMin;`);
    }

    let teacher = parameters.teacher;

    if (teacher) {
      var teacherQuery = `select id, firstName, lastName from user where (firstName like '%${teacher}%' or lastName like '%${teacher}%' )`;
      var teacherDetails = await getManager().query(teacherQuery);
      var ids = "";
      for (var i of teacherDetails) {
        ids = ids + `${i.id}`;
      }
      let studentCount = [];
    }

    if (query_list.length > 0) {
      query_string = " where ";
    }

    query_list.forEach((value, index) => {
      if (index != query_list.length - 1) {
        query_string = query_string + query_list[index] + " and ";
      } else {
        query_string = query_string + query_list[index];
      }
    });
    var quer = `select id, teacherId,  batchNumber, lessonStartTime, lessonEndTime from classes ${query_string} limit ${offset}, ${pageSize};`;
    current--;
    var quer = `select id,  batchNumber, lessonStartTime, lessonEndTime, teacherId from classes ${query_string} limit ${current}, ${pageSize};`;
    var results = await getManager().query(quer);
    let studentCount = [];
    let name = "";

    for (const element of results) {
      studentCount = await getManager()
        .createQueryBuilder(BatchStudent, "batchStudent")
        .where("batchStudent.batchId = :id", { id: element.id })
        .getMany();
      var classes = await getManager()
        .createQueryBuilder(Classes, "classes")
        .where("classes.id = :id", { id: element.id })
        .getOne();
      var user = await getManager()
        .createQueryBuilder(User, "user")
        .where("user.id = :id", { id: element.teacherId })
        .getOne();
      if (user && user.firstName && user.lastName) {
        name = user.firstName + " " + user.lastName;
      }
      let startTime;
      let endTime;
      let status;
      if (classes.lessonStartTime) {
        startTime = classes.lessonStartTime.split("T")[1].substring(0, "00:00".length);
      }

      if (classes.lessonEndTime) {
        endTime = classes.lessonEndTime.split("T")[1].substring(0, "00:00".length);
      }
      if (classes.status == 4) {
        status = "In Active";
      } else {
        status = "Active";
      }

      let view = new BatchView(
        element.id,
        new Date(),
        classes.batchNumber,
        "Admin",
        name,
        studentCount.length,
        `${startTime}-${endTime}`,
        status
      );
      batchView.push(view);
    }
    return {
      success: true,
      data: batchView,
      total: batchView.length,
      current: current,
      pageSize: pageSize,
    };
  }

  async getBatchDetails(id: any) {
    let teacherView = new TeacherView();
    const batchId = id;
    var batchAvailability: BatchAvailability[] = [];
    var batchStudent: BatchStudent[] = [];
    var classes = new Classes();
    let i = 0;
    classes = await getManager()
      .createQueryBuilder(Classes, "classes")
      .leftJoin("classes.teacher", "teacher")
      .addSelect(["teacher.firstName", "teacher.lastName"])
      .where("classes.id = :id", { id: batchId })
      .getOne();
    const batchavail = await getManager()
      .createQueryBuilder(BatchAvailability, "batchAvailability")
      .where("batchAvailability.id = :id", { id: batchId })
      .getOne();
    const students = await getRepository(BatchStudent)
      .createQueryBuilder("batchStudent")
      .leftJoin("batchStudent.student", "student")
      .addSelect(["student.firstName", "student.lastName"])
      .where("batchStudent.batchId = :id", { id: batchId })
      .getMany();
    teacherView.classes = classes;
    teacherView.batchAvailability = [batchavail];
    teacherView.students = students;
    return {
      success: true,
      data: teacherView,
      total: 1,
      current: 1,
      pageSize: 1,
    };
  }
}
