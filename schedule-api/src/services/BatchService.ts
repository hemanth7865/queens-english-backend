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

const generateRandomCode = (): string => {
  var length = 5;
  var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  var retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}
export class BatchService {
  private classesRepository = getRepository(Classes);
  private batchAvailabilityRepository = getRepository(BatchAvailability);
  private batchStudentRepository = getRepository(BatchStudent);

  BatchService() {}

  constructor() {
    axios.defaults;
  }

  fixDate(date: string): string {
    let dates = date.split("-");
    if(dates[1]){
      if(dates[1].length < 2){
        dates[1] = "0"+dates[1];
      }

      date = dates.join("-");
    }
    return date;
  }

  async createBatch(data: any) {
    const moment = require("moment");
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

      data.classStartDate =  this.fixDate(data.classStartDate);
      data.classEndDate =  this.fixDate(data.classEndDate);
      data.lessonStartTime =  this.fixDate(data.lessonStartTime);
      data.lessonEndTime =  this.fixDate(data.lessonEndTime);
      data.activeLessonId =  data.startingLessonId;

      const dateValidate = [
        moment(data.classStartDate).format("YYYY-MM-DD"),
        moment(data.classEndDate).format("YYYY-MM-DD"),
        moment(data.lessonStartTime).format("YYYY-MM-DD"),
        moment(data.lessonEndTime).format("YYYY-MM-DD"),
      ];

      if(dateValidate.includes("Invalid date")){
        return { status: false, message: "Invalid Date", data: dateValidate };
      }

      let alreadyExists;

      if(create){
        data.classCode = generateRandomCode();
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
          activeLessonId: data.activeLessonId
        },
      };

      var res1 = {};
      if (!data.id || create) {
        res1 = await axios
          .post(options.url, options.body)
          .then(async (res) => {
            var batch = await this.createBatchSql(data);
            await axios.put(options.url, options.body).catch((error) => {
            return Promise.reject(error);
          });
            return batch;
          })
          .catch((error) => {
            console.log(error);
            return Promise.reject(error);
          });
      } else {
        const studentsChange = await this.getBatchStudentsChange(data, alreadyExists);

        /**
         * Add Students To Batch
         */
        await this.addStudents(studentsChange.add, data.id);

        /**
         * Remove Students From Batch
         */
        await this.removeStudents(studentsChange.remove, data.id);

        res1 = await axios
          .put(options.url, options.body)
          .then(async (res) => {
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
      await queryRunner.rollbackTransaction();
      return { status: false, message: error?.response?.data || "Service Error" };
    } finally {
      await queryRunner.release();
    }
  }

  async deleteBatch(data: any){
    const alreadyExists: any = await this.batchExists(data, 'id');
    console.log(data);
    if(!alreadyExists?.id){
      return { status: false, message: "Batch Not Found" };
    }
    let res1 = await axios
    .delete("/api/classProfile/" + data.id)
    .then(async (res) => {
      var batch = await this.deleteBatchSql(data.id);
      return batch;
    })
    .catch((error) => {
      return Promise.reject(error);
    });

    return res1;
  }

  async deleteBatchSql(id: string){
    await this.classesRepository.delete({id});
    await this.batchStudentRepository.delete({batchId: id});
    return { message: "Batch Deleted Successfully" };
  }

  async batchExists(data: Classes, column = "batchNumber"): Promise<boolean|Classes>{
    let result: boolean|Classes = false;

    const batch = await this.classesRepository.createQueryBuilder("classes").where("classes."+column+" = :val", {val: data[column]}).getOne();

    if(batch){
      result = batch;
    }

    return result;
  }

  async getBatchStudentsChange(batch: Classes, oldBatch: Classes): Promise<{add: string[], remove: string[]}> {
    let result: {add: string[], remove: string[]} = {add: [], remove: []};

    const students = await getRepository(BatchStudent)
      .createQueryBuilder("batchStudent")
      .leftJoin("batchStudent.student", "student")
      .addSelect(["student.firstName", "student.lastName"])
      .where("batchStudent.batchId = :id", { id: batch.id })
      .getMany();

    /**
     * Get IDs Of Current Students
     */
    result.remove = students.map(student => student.studentId);

    batch.students.map(student => {
      /**
       * Add New Added Students
       */
      if(!result.remove.includes(student.studentId)){
        result.add.push(student.studentId);
      }
      /**
       * Keep Students That Are Already In The Batch
       */
      else{
        result.remove = result.remove.filter(id => id !== student.studentId);
      }
    });

    return result;
  }

  async updateBatchAgeGroup(batch: Classes){
    console.log(batch);
    try{
      let students: any[];
        students = await getRepository(BatchStudent)
        .createQueryBuilder("batchStudent")
        .leftJoin("batchStudent.student", "student")
        .addSelect(["student.dob"])
        .where("batchStudent.batchId = :id", { id: batch.id })
        .getMany();
  
      console.log(students);
  
      const moment = require("moment");
  
      let ages = [];
  
      ages = students.map((i: any) => {
        return moment(new Date()).diff(moment(i.student?.dob,"YYYY-MM-DD"),'years',true)
      });
  
      let minAge: number = 0;
      let maxAge: number = 0;
  
      for(let age of ages){
        if(!parseInt(String(age))){
          continue;
        }
        if(age > maxAge){
          maxAge = age;
        }
        if(age < minAge || minAge <= 0){
          minAge = age;
        }
      }
  
      if(parseInt(String(minAge))){
        batch.minAge = parseInt(String(minAge));
      }
  
      if(parseInt(String(maxAge))){
        batch.maxAge = parseInt(String(maxAge));
      }
  
  
      if(batch.minAge && batch.maxAge && typeof batch.minAge === "number" && typeof batch.maxAge === "number"){
        const allowedAges: any[] = [];
  
        const sub: number = batch.maxAge - batch.minAge;
  
        const gap = 3 - sub;
  
        allowedAges.push(batch.minAge < 10 ? `0${batch.minAge}` : batch.minAge);
        for(let i = batch.minAge + 1; i < batch.maxAge; i++){
          allowedAges.push(i < 10 ? `0${i}` : i);
        }
        for(let i = 0; i < gap; i++){
          let m = batch.minAge - i - 1;
          let ma = batch.maxAge + i + 1;
          allowedAges.push(m < 10 ? `0${m}` : m);
          allowedAges.push(ma < 10 ? `0${ma}` : ma);
        }
        allowedAges.push(batch.maxAge < 10 ? `0${batch.maxAge}` : batch.maxAge);
        batch.ages = JSON.stringify(allowedAges);
      }
      
      const classes = await this.classesRepository.update( {id: batch.id}, {ages: batch.ages, minAge: batch.minAge, maxAge: batch.maxAge});
      
      return classes;
    }catch(e){
      console.log(e);
      return e;
    }
  }

  async updateAllBatchesAgeGroup(){
    let result = 0;
    const batches = await this.classesRepository.find();
    for(let batch of batches){
      await this.updateBatchAgeGroup(batch);
      result += 1;
    }

    return { success: true, message: `${result} Batches Updated` };
  }

  async createBatchSql(data: any) {
    try {
      var batchStudent: BatchStudent[] = [];
      var classes = new Classes();
      classes.classCode = data.classCode;
      classes.batchNumber = data.batchNumber;
      classes.teacherId = data.teacherId;
      classes.id = data.id;

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
      classes.frequency = data.frequency;
      classes.zoomLink = data.zoomLink;
      classes.zoomInfo = data.zoomInfo;
      classes.activeLessonId = data.activeLessonId;
      classes.created_at = new Date();
      classes.updated_at = new Date();

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

      await this.updateBatchAgeGroup(classes);

      return classes;
    } catch (error) {
      console.log(error);
      throw new Error("Excetion while stroing teacher");
    }
  }

  async updateBatchSql(data: any) {
    try {
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
      classes.frequency = data.frequency;
      classes.zoomLink = data.zoomLink;
      classes.zoomInfo = data.zoomInfo;
      classes.createdBy = data.createdBy;
      
      if (data.id) {
        classes.id = data.id;
        classes.updated_at = new Date();
      } else {
        classes.created_at = new Date();
        classes.updated_at = new Date();
      }

      const batch = await this.classesRepository.update( {id: classes.id}, classes);
      await this.updateBatchAgeGroup(classes);
      return batch;
    } catch (error) {
      console.log(error);
      throw new Error("Excetion while stroing teacher");
    }
  }

  async addStudents(students: string[], batchId: string){
    for(let student of students){
      let res1 = await axios
      .post("/api/classProfile/" + batchId + "/students", {
        type: "studentProfile",
        id: student
      })
      .then(async (res) => {
        let batchStud = new BatchStudent();
        batchStud.type = "studentProfile";
        batchStud.studentId = student;
        batchStud.batchId = batchId;
        batchStud.created_at = new Date();
        batchStud.updated_at = new Date();
        batchStud = await this.batchStudentRepository.save(batchStud);
        return batchStud;
      })
      .catch((error) => {
        return Promise.reject(error);
      });

      console.log(res1);
    }
  }

  async removeStudents(students: string[], batchId: string){
    for(let student of students){
      let res1 = await axios
      .delete("/api/classProfile/" + batchId + "/students/" + student)
      .then(async (res) => {
        return await this.batchStudentRepository.delete({studentId: student, batchId});
      })
      .catch((error) => {
        return Promise.reject(error);
      });
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
    let havingQuery = "";
    let query_string = "";

    const batchId = parameters.batchId;
    if (batchId) {
      query_list.push(`classes.batchNumber like  '%${batchId}%' `);
    }

    if(parameters.frequency){
      query_list.push(` classes.frequency = '${parameters.frequency}' `);
    }

    if(parameters.startingLessonId){
      query_list.push(` classes.startingLessonId = '${parameters.startingLessonId}' `);
    }

    if(parameters.activeLessonId){
      query_list.push(` classes.activeLessonId = '${parameters.activeLessonId}' `);
    }

    if(parameters.lessonStartTime){
      query_list.push(` classes.lessonStartTime LIKE '%${parameters.lessonStartTime}%' `);
    }

    if(parameters.lessonEndTime){
      query_list.push(` classes.lessonEndTime LIKE '%${parameters.lessonEndTime}%' `);
    }

    if(parameters.classStartDate){
      query_list.push(` classes.classStartDate LIKE '%${parameters.classStartDate}%' `);
    }

    if(parameters.age){
      // +18 students in a separate class
      if(parameters.age >= 18){
        query_list.push(` (classes.maxAge >= 18 OR classes.maxAge IS NULL) `);
      }
      // below 6 years students be in separate class
      if(parameters.age < 6){
        query_list.push(` (classes.maxAge < 6 OR classes.maxAge IS NULL) `);
      }
      query_list.push(` (classes.ages LIKE '%${parameters.age < 10 ? "0"+parseInt(parameters.age) : parseInt(parameters.age)}%' OR classes.ages IS NULL)`);
    }

    if(parameters.maxStudentsCount){
      havingQuery = ` having students_count < ${parameters.maxStudentsCount} `;
    }

    const createdBy = parameters.createdBy;
    if (createdBy) {
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
      query_list.push(`  ${startMin} >= classes.startMin and ${endMin}<= classes.endMin;`);
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
    current--;
    var quer = `select classes.id, classes.batchNumber, classes.lessonStartTime, classes.lessonEndTime, classes.activeLessonId, classes.startingLessonId, classes.endingLessonId, classes.classStartDate, 
    classes.classEndDate, classes.created_at, classes.teacherId, classes.frequency, (SELECT COUNT(*) FROM batch_students WHERE batch_students.batchId = classes.id) as students_count from 
    classes ${query_string} ${havingQuery} ORDER BY classes.created_at DESC LIMIT ${pageSize >= 0 ? pageSize : 20} OFFSET ${(current >= 0 ? current : 0) * (pageSize >= 0 ? pageSize : 20)};`;
    
      console.log(quer);
    var results = await getManager().query(quer);
    let studentCount = [];
    let students = [];
    let name = "";
    const count = await getManager().query(`select count(classes.id) as total, (SELECT COUNT(*) FROM batch_students WHERE batch_students.batchId = classes.id) as students_count from classes 
    ${query_string} ${havingQuery};`);

    for (const element of results) {
      students = [];
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

      for(let student of studentCount){
        students.push(await getManager()
        .createQueryBuilder(User, "user")
        .where("user.id = :id", { id: student.studentId })
        .getOne());
      }

      if (user && user.firstName && user.lastName) {
        name = user.firstName + " " + user.lastName;
      }
      let startTime;
      let endTime;
      let status;
      if (classes.lessonStartTime && classes.lessonStartTime.split("T")[1]) {
        startTime = classes.lessonStartTime.split("T")[1]?.substring(0, "00:00".length);
      }else{
        startTime = "";
      }

      if (classes.lessonEndTime && classes.lessonEndTime.split("T")[1]) {
        endTime = classes.lessonEndTime.split("T")[1]?.substring(0, "00:00".length);
      }else{
        endTime = "";
      }

      if (classes.status == 4) {
        status = "In Active";
      } else {
        status = "Active";
      }

      let view = new BatchView(
        element.id,
        classes.created_at,
        classes.batchNumber,
        "Admin",
        name,
        studentCount.length,
        `${startTime}-${endTime}`,
        classes?.classStartDate && classes?.classEndDate ? classes.classStartDate.split("T")[0] + " To " + classes.classEndDate.split("T")[0] : "NA",
        status,
        students,
        classes.startingLessonId,
        classes.endingLessonId,
        classes.lessonStartTime,
        classes.lessonEndTime,
        classes.zoomLink,
        classes.zoomInfo,
        classes.frequency
      );
      view.activeLessonId = classes.activeLessonId;
      batchView.push(view);
    }

    return {
      success: true,
      data: batchView,
      total: parseInt(count[0]?.total),
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
      .addSelect(["student.firstName", "student.lastName", "student.phoneNumber"])
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


  async getBatchesWorkingTeachers(request: Request, parameters) {
    let query_list = [];
    let query_string = "";
    const moment = require("moment");

    if(parameters.lessonStartTime){
      query_list.push(` classes.lessonStartTime LIKE '%${parameters.lessonStartTime}%' `);
    }

    if(parameters.lessonEndTime){
      query_list.push(` classes.lessonEndTime LIKE '%${parameters.lessonEndTime}%' `);
    }

    if(parameters.frequency){
      query_list.push(` classes.frequency = '${parameters.frequency}' `);
    }

    query_list.push(` classes.classEndDate >= '${moment().format("YYYY-MM-DD")}' `);

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

    var quer = `select DISTINCT teacherId from classes ${query_string};`;
    var results = await getManager().query(quer);
    var ids = [];

    for (const element of results) {
      ids.push(element.teacherId)
    }

    return ids;
  }
}
