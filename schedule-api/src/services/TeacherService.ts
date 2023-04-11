import { Any, getConnection, getRepository, Like, Not } from "typeorm";
import { User } from "../entity/User";
import { Teacher as Teacher } from "../entity/Teacher";
import { LeadView } from "../model/LeadView";
import { TeacherAvailability as TeacherAvailability } from "../entity/TeacherAvailability";
import { getManager } from "typeorm";
import { BatchService } from "./BatchService";
import axios from "axios";
import { Student } from "../entity/Student";
import { UserService } from "./UserService";
import { School } from "../entity/School";
import { Classes } from "../entity/Classes";
import { BatchStudent } from "../entity/BatchStudent";
const { usersLogger } = require("../Logger.js");
const fs = require('fs');
const csv = require('csv-parser');

export class TeacherService {

  private usersRepository = getRepository(User);
  private teacherAvailabilityRepository = getRepository(TeacherAvailability);
  private teacherRepository = getRepository(Teacher);
  private COSMOS_URL = process.env.COSMOS_URL;
  private COSMOS_CODE = process.env.COSMOS_CODE;
  private schoolRepository = getRepository(School);
  private classesRepository = getRepository(Classes);
  private batchStudentRepository = getRepository(BatchStudent);
  private studentRepository = getRepository(Student);


  TeacherService() { }

  async availableTeachers(data: any, parameters: any) {
    var results: User[] = [];
    var leadView: LeadView[] = [];
    var map = new Map();
    var leadTem: Teacher[] = [];
    var filter = false;
    var parametersList = [];

    map.set(0, "Sun");
    map.set(1, "Mon");
    map.set(2, "Tue");
    map.set(3, "Wed");
    map.set(4, "Thu");
    map.set(5, "Fri");
    map.set(6, "Sat");

    var offset = parameters.current;
    var current = offset;
    var limit = parameters.pageSize;
    if (offset == 1) {
      offset = 0;
    }

    let query_list = [];
    let query_string = "";
    console.log(parameters);
    const date = parameters.date;
    if (date) {
      query_string = query_string + ` and le.joiningdate =  '${date}' `;
      query_list.push(` le.joiningdate =  '${date}' `);
    }

    const name = parameters.name;
    if (name) {
      query_string =
        query_string +
        ` and (u.firstName like '%${name}%' or u.lastName like '%${name}%' )`;
      query_list.push(
        ` (u.firstName like '%${name}%' or u.lastName like '%${name}%' ) `
      );
    }
    const mobile = parameters.phoneNumber;
    if (mobile) {
      query_string = query_string + ` and u.phoneNumber  like '%${mobile}%' `;
      query_list.push(` u.phoneNumber  like '%${mobile}%' `);
      console.log("query phonen umber ", mobile);
    }

    const type = parameters.type;
    if (type) {
      query_string = query_string + ` and u.type like '%${type}%' `;
      query_list.push(` u.type like '%${type}%'  `);
      console.log("user type ", type);
    }

    var totalexp = parameters.totalexp;
    if (totalexp) {
      totalexp = parseFloat(totalexp);
      query_string = query_string + ` and le.totalexp =${totalexp} `;
      query_list.push(` le.totalexp =${totalexp} `);
    }

    var classesTaken = parameters.classesTaken;
    if (classesTaken) {
      classesTaken = parseInt(classesTaken);
      query_string = query_string + ` and le.classestaken=${classesTaken} `;
      query_list.push(` le.classestaken=${classesTaken} `);
    }

    var status = parameters.status;
    if (status) {
      //  status = parseInt(status);    
      query_string = query_string + ` and u.status like '${status}' `;
      query_list.push(` u.status like '${status}' `);
    }

    var studentID = parameters.studentID;

    if (studentID) {
      //  status = parseInt(status);    
      query_string = query_string + ` and u.status like '${status}' `;
      query_list.push(` u.status like '${status}' `);
    }

    var batchID = parameters.batchID;
    if (status) {
      //  status = parseInt(status);    
      query_string = query_string + ` and u.status like '${status}' `;
      query_list.push(` u.status like '${status}' `);
    }

    var ratings = parameters.ratings;
    if (ratings) {
      ratings = parseInt(ratings);
      query_string = query_string + ` and le.ratings =${ratings} `;
      query_list.push(`  le.ratings =${ratings} `);
    }

    const keyword = parameters.keyword;
    let query_search: string;
    if (!!keyword?.length) {
      query_search = ` (u.firstName like '%${keyword}%' or u.lastName like '%${keyword}%' or u.phoneNumber like '%${keyword}%' )`;
    }

    var start_slot = parameters.start_slot;
    var end_slot = parameters.end_slot;

    var week_day = parameters.weekday;
    if (!week_day) {
      week_day = `1,2,3,4,5,6,7`;
    }
    let start_min;
    let end_min;
    let startMin;
    let endMin;
    if (start_slot) {
      let time = start_slot.split(":");
      start_slot = time[0];
      console.log("time is ", time);
      start_min = time[1];
      startMin = time[0] * 60 + time[1];
    }
    if (end_slot) {
      let time = end_slot.split(":");
      end_slot = time[0];
      console.log("time is ", time);
      end_min = time[1];
      endMin = time[0] * 60 + time[1];
    }

    var unique = [-1];
    console.log(`query string ${query_list}`);

    if (start_slot && end_slot) {
      filter = true;
      let slotsResultIds;
      slotsResultIds = await this.getMatchedTeacherIds(
        week_day,
        startMin,
        endMin
      );
      console.log("elements", slotsResultIds);
      let idsList = [];
      for (let element of slotsResultIds) {
        idsList = [...idsList, "'" + element + "'"];
      }
      usersLogger.info(`Finale query ids ${JSON.stringify(idsList)}`);

      if (slotsResultIds.length > 0) {
        var quer = `select teacherId as id, weekday , start_slot, end_slot from teacher_availability where teacherId  in (${idsList.join(",")})`;
        console.log("quer", quer);
        let totalResult = await getManager().query(quer);
        console.log("totalResult", totalResult);
        query_list.push(` u.id in (${idsList.join(",")})`);
      } else {
        query_list.push(`  u.id in (-1) `);
      }
    }


    var finalQuery;
    var total;

    if (query_list.length > 0) {
      query_string = " where ";
    }

    query_list.forEach((value, index) => {
      console.log(query_list.join(" and "));
      if (index != query_list.length - 1) {
        query_string = query_string + query_list[index] + " and ";
      } else {
        query_string = query_string + query_list[index];
      }
    });

    if (!!query_search?.length) {
      if (query_list.length === 0) {
        query_string += " where ";
      } else {
        query_string += " and ";
      }
      query_string += query_search;
    }

    console.log("value sis ", query_string);

    finalQuery = !parameters.type ? `select SQL_CALC_FOUND_ROWS concat(u.firstName , "  ", u.lastName) as name,  u.phoneNumber, u.email, u.status as status, u.id  as teacherId , u.id as userId, u.id, u.id as cosmos_ref, u.type from user u ${query_string} limit ` :
      `select SQL_CALC_FOUND_ROWS concat(u.firstName , "  ", u.lastName) as name,  u.phoneNumber, u.email, concat(le.totalexp , "" , " Years") as exp, u.status as status, le.ratings as ratings, u.id  as teacherId , u.id as userId, u.id, u.id as cosmos_ref, '' as slots, le.teachertype as leadtype, le.joiningdate as joiningdate, le.ratings as ratings, le.classestaken as classestaken, u.id as cosmos_ref, u.type from user u left join teacher le on u.id=le.id ${query_string} limit `

    finalQuery = finalQuery + (offset >= 0 ? offset * limit : 0) +
      "," +
      (limit >= 0 ? limit : 20) +
      `;`;

    console.log("finalQuery", finalQuery);
    results = await getManager().query(finalQuery);
    total = results.length;
    console.log("results size", results.length);

    for (const element of results) {
      let slotsResult: any[] = [];
      let batchCodes: any[] = [];

      var quer =
        "select weekday , start_slot, end_slot from teacher_availability where teacherId='" +
        element.teacherId +
        "';";
      slotsResult = await getManager().query(quer);
      var slot = "";
      slotsResult.forEach((element) => {
        if (!element.start_min) {
          element.start_min = "00";
        }
        if (!element.end_min) {
          element.end_min = "00";
        }
        slot =
          slot +
          map.get(element.weekday) +
          ": " +
          element.start_slot +
          ":" +
          element.start_min +
          " to " +
          element.end_slot +
          ":" +
          element.end_min +
          " ";
      });
      var yourDate;
      if (element.joiningdate) {
        yourDate = new Date(element.joiningdate).toISOString().split("T")[0];
      }

      var studentOrTeacherId = [];
      var batchCode = '';

      if (type == 'student') {

        var quer =
          "select id,batchNumber from classes where id = (select batchId from batch_students where studentId='" +
          element.id +
          "');";
        batchCodes = await getManager().query(quer);
        batchCodes.forEach((element) => {
          console.log("batchdode", element);
          studentOrTeacherId.push(element.batchCode);
        });
      } else {
        var quer =
          "select teacherId , batchNumber from classes where teacherId='" +
          element.id +
          "';";
        batchCodes = await getManager().query(quer);
        batchCodes.forEach((element) => {
          console.log("batchcodeTeacher", element);
          studentOrTeacherId.push(element.batchId);
        });
      }
      var l = new LeadView(
        element.id,
        element.id,
        yourDate,
        element.name,
        element.exp,
        element.phoneNumber,
        element.email,
        element.status,
        element.classestaken,
        element.ratings,
        slot,
        element.leadtype,
        element.type,
        studentOrTeacherId.join(","),
        element.id,
        element.dob
      );
      leadView.push(l);
    }

    return {
      success: true,
      data: leadView,
      total: parseInt(total),
      current: current,
      pageSize: limit,
    };

  }


  async saveTeacher(data: any) {
    data.email = data?.email || " "
    data.lastName = data?.lastName || " "
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();

    try {
      usersLogger.info('Save/Update User details in cosmos DB');
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const options: any = {
        url: `${this.COSMOS_URL}/api/user/?code=${this.COSMOS_CODE}`,
        json: true,
        body: {
          type: data.type,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          isAdministrator: false,
          phoneNumber: data.phoneNumber,
        },
      };

      if(typeof data.offlineUser !== 'undefined'){
        options.body.offlineUser = data.offlineUser
      }

      if (data.id) {
        options.body["id"] = data.id;
      }

      var status;
      var res1 = {};
      console.log("options", options)
      if (!data.id) {
        res1 = await axios
          .post(options.url, options.body)
          .then(async (res) => {
            usersLogger.info("Posted to cosmos and response is ");
            data.id = res.data.id;
            usersLogger.info(`Id created in cosmos is ${res.data.id}`);
            var user = await this.saveTeacherSql(data);
            //Promise.resolve(res);
            return user;
          })
          .catch((error) => {

            usersLogger.info(`Posted to cosmos and response is ${error}`);
            return { status: 400, error: error?.response?.data };
            return Promise.reject(error);
          });
      } else {
        usersLogger.info("Update teacher information");
        usersLogger.info(`Update Cosmos Request ${JSON.stringify(options.body)}`);
        res1 = await axios
          .post(options.url, options.body)
          .then(async (res) => {
            console.log("Posted to cosmos and response is ", res);
            console.log("Id created in cosmos is ", res.data.id);
            console.log("Creating data in sql database ", res.data.id);
            var user = await this.saveTeacherSql(data);
            Promise.resolve(res);
            return user;
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
      return { status: 501, error: error.response.data };
    } finally {
      await queryRunner.release();
    }
  }

  async saveTeacherSql(data: any) {
    console.log("service method");
    try {
      var teacherAvailability: TeacherAvailability[] = [];
      var teacherItem: Teacher[] = [];
      var teacher = new Teacher();
      var user = new User();
      if (data.lead) {
        for (let element of data.lead) {
          if (data.userId) {
            teacher.id = data.userId;
          }
          teacher.created_at = new Date();
          teacher.updated_at = new Date();
          if (data.id) {
            teacher.id = data.id;
          }
          teacher.joiningdate = element.joiningdate ? element.joiningdate : new Date();
          teacher.resume = "Resume";
          teacher.video = "video";
          teacher.teachertype = element.teacher_type;
          teacher.qualification = element.qualification;
          teacher.classestaken = element.classestaken;
          teacher.teachertype = element.teacher_type;
          teacher.certificates = element.certificates;
          teacher.ratings = parseInt(element.ratings);
          if (!teacher.ratings) teacher.ratings = 0;

          teacher.totalexp = parseFloat(element.totalexp);
          if (!teacher.totalexp) teacher.totalexp = 0;
          teacher = await this.teacherRepository.save(teacher);
          user.id = teacher.id;
          user.teacher = [teacher];
          usersLogger.info(`Updated data is ${JSON.stringify(user)}}`);
        }
      }


      let i = 0;
      if (data.leadAvailability) {
        for (let element of data.leadAvailability) {
          //data.leadAvailability.forEach(async (element) => {
          var availability = new TeacherAvailability();
          availability.start_date = element.startDate ? element.startDate : null;
          availability.start_slot = element.start_slot;
          console.log("start slot" + element.start_slot);
          if (element?.start_slot) {
            let time = element?.start_slot?.split(":");
            availability.start_slot = time[0];
            console.log("time is ", time);
            availability.start_min = time[1];
            availability.startMin = time[0] * 60 + time[1];
          }
          if (element?.end_slot) {
            let time = element?.end_slot?.split(":");
            availability.end_slot = time[0];
            availability.end_min = time[1];
            availability.endMin = time[0] * 60 + time[1];
          }

          availability.weekday = element.weekday;
          if (element.id) availability.id = element.id;
          availability.teacher = teacher;
          availability.created_at = new Date();
          availability.updated_at = new Date();
          availability = await this.teacherAvailabilityRepository.save(
            availability
          );
          availability.start_slot = element.start_slot;
          availability.end_slot = element.end_slot;
          teacherAvailability[i++] = availability;
        }
      }

      console.log("leadAvailability", teacherAvailability);

      user.teacherAvailability = teacherAvailability;
      user.firstName = data.firstName;
      user.lastName = data.lastName;
      user.gender = data.gender;
      user.phoneNumber = data.phoneNumber;
      user.email = data.email;
      
      if(typeof data.offlineUser !== 'undefined'){
        user.offlineUser = data.offlineUser
      }

      if (data.status) {
        user.status = data.status;
      }
      user.type = data.type;
      if (data.id) user.id = data.id;
      user.startDate = data.startDate ? data.startDate : null;
      user.address = data.address;
      user.whatsapp = data.whatsapp;
      if (data.dob) {
        console.log('dob is');
        console.log(data.dob);
        user.dob = data.dob;
      }
      user.status = data.status;
      user.photo = data.photo;
      user.languages = data.languages;
      user.created_at = new Date();
      user.updated_at = new Date();
      if (data.schoolId) {
        user.schoolId = data.schoolId
      }
      // console.log("user", user);
      user = await this.usersRepository.save(user);
      return user;
    } catch (error) {
      console.log(error);
      throw new Error("Excetion while stroing teacher");
      return { status: 500, error: 'Unable to update/register user' };
    }
  }

  async listLeadDetails(data: any, parameters: any) {
    var results: User[] = [];
    var leadView: LeadView[] = [];
    var map = new Map();
    var batchSerivce = new BatchService();
    var leadTem: Teacher[] = [];
    var filter = false;
    var parametersList = [];

    map.set(0, "Sun");
    map.set(1, "Mon");
    map.set(2, "Tue");
    map.set(3, "Wed");
    map.set(4, "Thu");
    map.set(5, "Fri");
    map.set(6, "Sat");

    var offset = parameters.current;
    var current = offset;
    var limit = parameters.pageSize;
    if (offset == 1) {
      offset = 0;
    }

    let query_list = [];
    let query_string = "";
    console.log(parameters);
    const date = parameters.date;
    if (date) {
      query_string = query_string + ` and le.joiningdate =  '${date}' `;
      query_list.push(` le.joiningdate =  '${date}' `);
    }

    const name = parameters.name;
    if (name) {
      query_string =
        query_string +
        ` and (u.firstName like '%${name}%' or u.lastName like '%${name}%' )`;
      query_list.push(
        ` (u.firstName like '%${name}%' or u.lastName like '%${name}%' ) `
      );
    }
    const mobile = parameters.phoneNumber;
    if (mobile) {
      query_string = query_string + ` and u.phoneNumber  like '%${mobile}%' `;
      query_list.push(` u.phoneNumber  like '%${mobile}%' `);
      console.log("query phonen umber ", mobile);
    }

    const type = parameters.type;
    if (type) {
      query_string = query_string + ` and u.type like '%${type}%' `;
      query_list.push(` u.type like '%${type}%'  `);
      console.log("user type ", type);
    }

    var totalexp = parameters.totalexp;
    if (totalexp) {
      totalexp = parseFloat(totalexp);
      query_string = query_string + ` and le.totalexp =${totalexp} `;
      query_list.push(` le.totalexp =${totalexp} `);
    }

    var classesTaken = parameters.classesTaken;
    if (classesTaken) {
      classesTaken = parseInt(classesTaken);
      query_string = query_string + ` and le.classestaken=${classesTaken} `;
      query_list.push(` le.classestaken=${classesTaken} `);
    }

    var status = parameters.status;
    if (status) {
      //  status = parseInt(status);    
      query_string = query_string + ` and u.status like '${status}' `;
      query_list.push(` u.status like '${status}' `);
    }

    var studentID = parameters.studentID;

    if (studentID) {
      //  status = parseInt(status);    
      query_string = query_string + ` and u.status like '${status}' `;
      query_list.push(` u.status like '${status}' `);
    }

    var batchID = parameters.batchID;
    if (status) {
      //  status = parseInt(status);    
      query_string = query_string + ` and u.status like '${status}' `;
      query_list.push(` u.status like '${status}' `);
    }

    var ratings = parameters.ratings;
    if (ratings) {
      ratings = parseInt(ratings);
      query_string = query_string + ` and le.ratings =${ratings} `;
      query_list.push(`  le.ratings =${ratings} `);
    }

    const keyword = parameters.keyword;
    let query_search: string;
    if (!!keyword?.length) {
      query_search = ` (u.firstName like '%${keyword}%' or u.lastName like '%${keyword}%' or u.phoneNumber like '%${keyword}%' )`;
    }

    const schoolName = parameters.schoolName;
    if (schoolName) {
      query_string = query_string + ` and s.schoolName like '%${schoolName}%'`
      query_list.push(` s.schoolName like '%${schoolName}%'`);
    }

    var start_slot = parameters.start_slot;
    var end_slot = parameters.end_slot;

    var week_day = parameters.weekday;
    if (!week_day) {
      week_day = `1,2,3,4,5,6,7`;
    }
    let start_min;
    let end_min;
    let startMin;
    let endMin;
    if (start_slot) {
      let time = start_slot.split(":");
      start_slot = time[0];
      console.log("time is ", time);
      start_min = time[1];
      startMin = time[0] * 60 + time[1];
    }
    if (end_slot) {
      let time = end_slot.split(":");
      end_slot = time[0];
      console.log("time is ", time);
      end_min = time[1];
      endMin = time[0] * 60 + time[1];
    }

    var unique = [-1];
    console.log(`query string ${query_list}`);

    if (start_slot && end_slot) {
      filter = true;
      let slotsResultIds;
      slotsResultIds = await this.getMatchedTeacherIds(
        week_day,
        startMin,
        endMin
      );
      console.log("elements", slotsResultIds);
      let idsList = [];
      for (let element of slotsResultIds) {
        idsList = [...idsList, "'" + element + "'"];
      }
      usersLogger.info(`Finale query ids ${JSON.stringify(idsList)}`);

      if (slotsResultIds.length > 0) {
        var quer = `select teacherId as id, weekday , start_slot, end_slot from teacher_availability where teacherId  in (${idsList.join(",")})`;
        console.log("quer", quer);
        let totalResult = await getManager().query(quer);
        console.log("totalResult", totalResult);
        query_list.push(` u.id in (${idsList.join(",")})`);
      } else {
        query_list.push(`  u.id in (-1) `);
      }
    }

    if (parameters.autoSearch) {
      var teacherIds = await batchSerivce.getBatchesWorkingTeachers(data, { lessonStartTime: parameters.start_slot, frequency: parameters.frequency });
      if (teacherIds.length > 0) {
        query_list.push(` u.id not in (${teacherIds.map(id => `'${id}'`).join(",")})`);
      }
    }

    var finalQuery;
    var total;

    if (query_list.length > 0) {
      query_string = " where ";
    }

    query_list.forEach((value, index) => {
      console.log(query_list.join(" and "));
      if (index != query_list.length - 1) {
        query_string = query_string + query_list[index] + " and ";
      } else {
        query_string = query_string + query_list[index];
      }
    });

    if (!!query_search?.length) {
      if (query_list.length === 0) {
        query_string += " where ";
      } else {
        query_string += " and ";
      }
      query_string += query_search;
    }

    const limitQuery: string = ` LIMIT ${limit >= 0 ? limit : 20} OFFSET ${(offset >= 0 ? offset : 0) * (limit >= 0 ? limit : 20)}`;
    finalQuery = !parameters.type ? `select SQL_CALC_FOUND_ROWS concat(u.firstName , "  ", u.lastName) as name, u.isSibling, u.phoneNumber, u.email, u.status as status, u.id  as teacherId , u.id as userId, u.id, u.id as cosmos_ref, u.type from user u ${query_string} ${limitQuery} ` :
      `select SQL_CALC_FOUND_ROWS concat(u.firstName , "  ", u.lastName) as name,  u.phoneNumber, u.email, concat(le.totalexp , "" , " Years") as exp, u.status as status, le.ratings as ratings, u.id  as teacherId , u.id as userId, u.id, u.id as cosmos_ref, '' as slots, le.teachertype as leadtype, le.joiningdate as joiningdate, le.ratings as ratings, le.classestaken as classestaken, u.id as cosmos_ref, u.type, s.schoolName as schoolName, s.id as schoolId from user u left join teacher le on u.id=le.id left join school s on u.schoolId=s.id  ${query_string} ORDER BY u.updated_at DESC ${limitQuery}; `;

    console.log("finalQuery", finalQuery);
    results = await getManager().query(finalQuery);
    total = results.length ? results.length : 0;
    console.log("results size", results.length);

    for (const element of results) {
      let slotsResult: any[] = [];
      let batchCodes: any[] = [];

      var quer =
        "select weekday , start_slot, end_slot from teacher_availability where teacherId='" +
        element.teacherId +
        "';";
      slotsResult = await getManager().query(quer);
      var slot = "";
      slotsResult.forEach((element) => {
        if (!element.start_min) {
          element.start_min = "00";
        }
        if (!element.end_min) {
          element.end_min = "00";
        }
        slot =
          slot +
          map.get(element.weekday) +
          ": " +
          element.start_slot +
          ":" +
          element.start_min +
          " to " +
          element.end_slot +
          ":" +
          element.end_min +
          " ";
      });
      var yourDate;
      if (element.joiningdate) {
        yourDate = new Date(element.joiningdate).toISOString().split("T")[0];
      }

      var studentOrTeacherId = [];
      var batchCode = '';

      if (type == 'student') {

        var quer =
          "select id,batchNumber from classes where id = (select batchId from batch_students where studentId='" +
          element.id +
          "');";
        batchCodes = await getManager().query(quer);
        batchCodes.forEach((element) => {
          console.log("batchdode", element);
          studentOrTeacherId.push(element.batchNumber);
        });
      } else {
        var quer =
          "select teacherId , batchNumber from classes where teacherId='" +
          element.id +
          "';";
        batchCodes = await getManager().query(quer);
        batchCodes.forEach((element) => {
          console.log("batchcodeTeacher", element);
          studentOrTeacherId.push(element.batchNumber);
        });
      }

      const user = await this.usersRepository.findOne({ where: { id: element.id } });
      const school = await this.schoolRepository.findOne({ where: { id: user.schoolId } });
      const classes = await this.classesRepository.find({ where: { teacherId: element.id } });
      let classesData: any[] = [];
      let batchStudents: any[] = [];
      let classesLength = classes.length + 1;
      for (const c of classes) {
        let classObject: any[] = [];
        let studentArray: any[] = [];
        batchStudents = await this.batchStudentRepository.find({ where: { batchId: c.id } });
        let batchStudentlength = batchStudents.length + 1;
        for (const student of batchStudents) {
          let user = await this.usersRepository.findOne({ where: { id: student.studentId } });
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

      var l = new LeadView(
        element.id,
        element.id,
        yourDate,
        element.name,
        element.exp,
        element.phoneNumber,
        element.email,
        element.status,
        element.classestaken,
        element.ratings,
        slot,
        element.leadtype,
        element.type,
        studentOrTeacherId.join(","),
        element.id,
        element.dob
      );
      l.isSibling = element.isSibling;
      l.schoolName = school?.schoolName;
      l.school = school;
      l.classesData = classesData;
      leadView.push(l);
    }

    return {
      success: true,
      data: leadView,
      total: parseInt(total),
      current: current,
      pageSize: limit,
    };
  }


  async getMatchedTeacherIds(week_day: string, startMin, endMin) {
    let slotsResultIds = [];
    let searchIds;
    let tempList = [];
    let week = week_day.split(",");

    for (let element of week) {
      var quer = `select teacherId as id, weekday , start_slot, end_slot from teacher_availability where weekday in (  ${element}  ) and (${startMin} >= startMin and ${endMin}<=endMin) and (${startMin} <= endMin and  ${endMin}>=startMin);`;
      console.log("quer", quer);
      let totalResult = await getManager().query(quer);

      if (totalResult.length == 0) {
        slotsResultIds = [];
        return [];
      } else {
        for (var el of totalResult) {
          slotsResultIds = [...slotsResultIds, el.id];
        }
      }

    }
    usersLogger.info(`Filterd ids  ${JSON.stringify(slotsResultIds)}`);
    return slotsResultIds;
  }


  async leadFullDetails(data: any, teacherId: number) {
    var map = new Map();
    var leadTem: Teacher[] = [];

    map.set(0, "Sun");
    map.set(1, "Mon");
    map.set(2, "Tue");
    map.set(3, "Wed");
    map.set(4, "Thu");
    map.set(5, "Fri");
    map.set(6, "Sat");

    let slotsResult: any[] = [];
    let users = new User();
    const leadId = teacherId;

    users = await getManager()
      .createQueryBuilder(User, "user")
      .where("user.id = :id", { id: leadId })
      .getOne();

    console.log("users", users);

    let student = await getManager()
      .createQueryBuilder(Student, "student")
      .where("student.id = :id", { id: leadId })
      .getOne();

    console.log("student", student);

    console.log("teacher id ", teacherId);
    const lead = await getManager()
      .createQueryBuilder(Teacher, "teacher")
      .where("teacher.id = :id", { id: leadId })
      .getOne();
    leadTem[0] = lead;
    console.log(users);
    if (lead && leadTem) users.teacher = leadTem;
    const leadav: TeacherAvailability[] = [];
    const list: any = await getManager()
      .createQueryBuilder(TeacherAvailability, "teacherAvailability")
      .where("teacherAvailability.teacherId = :id", { id: leadId })
      .getMany();
    if (users) users.teacherAvailability = list;
    var quer =
      "select weekday , start_slot, end_slot, start_min, end_min from teacher_availability where teacherId='" +
      teacherId +
      "';";
    slotsResult = await getManager().query(quer);
    var slot = "";
    slotsResult.forEach((element) => {
      console.log("element" + element);
      console.log("element" + element);
      if (element.start_min == 0) {
        element.start_min = "00";
      }
      if (element.end_min == 0) {
        element.end_min = "00";
      }
      slot =
        slot +
        map.get(element.weekday) +
        ":" +
        element.start_slot +
        ":" +
        element.start_min +
        " to " +
        element.end_slot +
        ":" +
        element.end_min +
        " ";
    });
    if (slot) users.slots = slot;
    return { success: true, data: users, total: 1, current: 1, pageSize: 1 };
  }


  async updateTeacherAvailability() {
    var map = new Map();
    map.set("Sun", 0);
    map.set("Mon", 1);
    map.set("Tue", 2);
    map.set("Wed", 3);
    map.set("Thu", 4);
    map.set("Fri", 5);
    map.set("Sat", 6);
    await fs.createReadStream(process.env.FILE_PATH)
      .pipe(csv())
      .on('data', async function (data) {
        let teacherRecord = new Teacher();
        let userRecord = new User();
        try {
          var teacherAvailability: TeacherAvailability[] = [];

          // userRecord = await (new UserService).isUserExists("phoneNumber", data.rmn, '');

          userRecord = await await getRepository(User).findOne({ phoneNumber: Like(`%${data.rmn}%`) });
          if (userRecord) {
            usersLogger.info(`Processing record with phoneNumber ${data.rmn}`);
            usersLogger.info(`User id is  ${userRecord.teacherId}`);
            teacherRecord = await getRepository(Teacher).findOne({ id: Like(`%${userRecord.id}%`) });

            data.weekday.split("-").forEach(async element => {
              let i = 0;
              var availability = new TeacherAvailability();
              availability.start_date = data.start_date ? data.start_date : null;

              if (data.start_time) {
                let time = data.start_time.split(":");
                availability.start_slot = time[0];
                availability.start_min = time[1];
                availability.startMin = time[0] * 60 + time[1];
              }

              if (data.end_time) {
                let time = data.end_time.split(":");
                availability.end_slot = time[0];
                availability.end_min = time[1];
                availability.endMin = time[0] * 60 + time[1];
              }

              availability.weekday = parseInt(map.get(element));
              availability.teacher = await getRepository(Teacher).findOne({ id: userRecord.id });
              availability.created_at = new Date();
              availability.updated_at = new Date();
              availability = await getRepository(TeacherAvailability).save(
                availability
              );
              console.log(availability);
              teacherAvailability[i++] = availability;

            });
            usersLogger.info(`Teacher Id updating ... ${data.rmn}`);
            userRecord.teacherAvailability = teacherAvailability;
            await getRepository(User).save(userRecord);
            return "Loaded teacher availability ...";
          } else {
            usersLogger.info(`User record not found for user ${data.rmn}`)
          }
        }
        catch (err) {
          usersLogger.info(`user not found with phoneNumber ${data.rmn}`);
          usersLogger.info(err);
        }
      })
      .on('end', async function () {
        return "success";
      });
    return "Loaded teacher availability ...";
  }

  async isTeacherExists(column = "phoneNumber", value: string, id: string | undefined): Promise<any> {
    let where: any = { [column]: value };
    if (id) {
      where['id'] = Not(id);
    }
    try {
      const user = await this.teacherRepository.findOne({ where });
      return user;
    } catch (e) {
      usersLogger.error(e);
      return false;
    }
  }

}