import { FileLogger, getConnection, getRepository } from "typeorm";
import { User } from "../entity/User";
import { Teacher } from "../entity/Teacher";
import { LeadView } from "../model/LeadView";
import { TeacherAvailability  } from "../entity/TeacherAvailability";
import { getManager } from "typeorm";
import axios from "axios";

import { Student } from "../entity/Student";
const { usersLogger } = require("../Logger.js");
import { TeacherService } from "./TeacherService";

export class StudentService {
  private usersRepository = getRepository(User);
  private studentRepository = getRepository(Student);
  private teacherService  = new TeacherService();


  private QUERY_FILTER = `select SQL_CALC_FOUND_ROWS concat(u.firstName , "  ", u.lastName) as name,  u.phoneNumber, u.email, st.studentId, u.status as status, u.id  as teacherId , u.id as userId, u.id, u.type from user u left join student st on u.id=st.id `;

  private COSMOS_URL = process.env.COSMOS_URL;
  private COSMOS_CODE = process.env.COSMOS_CODE;


  async saveStudentDetails(data: any) {
    let response;
    usersLogger.info('Start::UserController::Register Student');
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();

    const options = {
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

    usersLogger.info(`Start - Reqeust to cosmos DB : ${JSON.stringify(options)}`);
    try {
      if (data.id) {
        usersLogger.info("Update Request");
        usersLogger.info(data.id);
        options.body["id"] = data.id;
        usersLogger.info(`Start - Reqeust to cosmos DB1 : ${JSON.stringify(options)}`);
      }

      await queryRunner.connect();
      await queryRunner.startTransaction();
      usersLogger.info(`Data id is ${data.id}`);

      let response;
      if (!data.id) {
        response = await axios
          .post(options.url, options.body)
          .then(async (res) => {
            usersLogger.info(
              `Successfully inserted request in cosmos db:  ${data.phoneNumber}`
            );
            usersLogger.info(`Update oracle DB:  data.phoneNumber`);
            data.id = res.data.id;
            if(res.status == 400) {            
              usersLogger.error(`Error while updating student : ${res.data}`);
              return { status: 400, data: res.data };
            } else {
              usersLogger.info(`Data id from cosmos is ${data.id}`);
              var user = await this.saveStudentSQL(data,data.id);
              usersLogger.info(
                `Successfully updated oracle db: ${data.phoneNumber}`
              );
              return user;
            }
         
          })
          .catch((error) => {
            usersLogger.info(`Error while updating student : ${error.response.data}`);
            return { status: 400, data: error.response.data };
          });
      } else {
        response = await axios
          .put(options.url, options.body)
          .then(async (res) => {
            usersLogger.info("Successfully updated student record in cosomos DB")
            // console.log("Posted to cosmos and response is ", res);
            usersLogger.info("Id created in cosmos is ", res.data.id);
            usersLogger.info("Creating data in sql database ", res.data.id);
            usersLogger.info("Response: ", res.data);
            var user = await this.saveStudentSQL(data, data.id);
            //Promise.resolve(res);
            return user;
          })
          .catch((error) => {
            console.log("error", error);
            response = { status: error.response.status, errors: [error.response.data] };
            return response;
          });
      }
      await queryRunner.commitTransaction();
      return response;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return;
    } finally {
      await queryRunner.release();
    }
  }

  
  async saveStudentSQL(data: any, id) {
    usersLogger.info(
      `Register user in Admin portal with phoneNumber : ${data?.phoneNumber}`
    );
    try {
      var teacherAvailability: TeacherAvailability[] = [];
      var teacherItem: Teacher[] = [];
      var teacher = new Teacher();
      var user = new User();
      console.log('type', data.type);
      console.log('Data is ', data);
      user.firstName = data.firstName;
      user.lastName = data.lastName;
      user.gender = data.gender;
      user.phoneNumber = data.phoneNumber;
      user.email = data.email;
      user.type = data.type;
      if (data.id) {
        user.id = data.id;
        usersLogger.info(
          `Userid : ${data.id}`
        );
        usersLogger.info(
          `id : ${data.id}`
        );
      } else {
        user.id = id;
      }
     // user.startDate = data.startDate;
      user.address = data.address;
      user.whatsapp = data.whatsapp;
      user.nationalityId = data.nationalityId;
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
     // console.log("user", user);
     usersLogger.info(`user data is ${JSON.stringify(user)}`);
      user = await this.usersRepository.save(user);
      usersLogger.info(`user data after insert ${JSON.stringify(user)}`);
      let student = new Student();

    if (user.id) {
      usersLogger.info(`Student Id is ${JSON.stringify(user.id)}`);
      student.id = user.id;
      student.updated_at = new Date();
    } else {
      student.created_at = new Date();
      student.updated_at = new Date();
    }

    student.teacherName = data.teacherName;
    student.studentName = data.studentName;
    student.address = data.address;
    student.age = data.age;
    student.batchCode = data.batchCode;
    student.classType = data.classType;
    student.referralCode = data.referralCode;
    student.days = data.days;
    student.studentType = data.studentType;
    student.dateOfBirth = new Date();
    student.poc = data.poc;
    student.studentID = data.studentID;
    student.days = data.days;
    student.alternativeMobile = data.alternativeMobile;

    student.startDate = data.startDate;
    student.endDate = data.endDate;
    student.startLesson = data.startLesson;
    student.bottleSend = data.bottleSend;
    student.firstFeedback = data.firstFeedback;
    student.fifthFeedback = data.fifthFeedback;
    student.fifteenthFeedback = data.fifteenthFeedback;
    student.classesCompleted = data.classesCompleted;
    student.customersReferred = data.customersReferred;

      student = await this.studentRepository.save(student);
      usersLogger.info(`Student object inserted  ${JSON.stringify(student)}`);
      //user.id = student.id; 
     
      return {...user,...student};
    } catch (error) {
      console.log(error);
     return {status:500, error:"Unable to register student"}
    }
  }

  setStudentData = (element: any, id): Student => {
    let student = new Student();
    console.log("student id is ", id);

    if (id) {
      student.id = id;
      student.updated_at = new Date();
    } else {
      student.id = element.id;
      student.created_at = new Date();
    }

    student.teacherName = element.teacherName;
    student.batchCode = element.batchCode;
    student.classType = element.classType;
    student.studentName = element.studentName;
    student.studentID = element.studentID;
    student.referralCode = element.referralCode;
    student.days = element.days;
    student.studentType = element.studentType;
    student.dateOfBirth = element.dateOfBirth;
    student.poc = element.poc;
    student.alternativeMobile = element.alternativeMobile;

    student.startDate = element.startDate;
    student.endDate = element.endDate;
    student.startLesson = element.startLesson;
    student.firstFeedback = element.firstFeedback;
    student.fifthFeedback = element.fifthFeedback;
    student.fifteenthFeedback = element.fifteenthFeedback;
    student.classesCompleted = element.classesCompleted;
    student.customersReferred = element.customersReferred;
    usersLogger.info("student record updating is ", student);
    return student;
  }


  async getStudentDetailsById(id: string) {  
    return this.fetchStudentFilterData(id);

  }


  
  fetchStudentFilterData = async (id: string) => {
    usersLogger.info(`Fetch Student details from oracle with ${id}`);    

   var users = await getManager()
      .createQueryBuilder(User, "user")
      .where("user.id = :id", { id: id })
      .getOne();

    var student = await getManager()
      .createQueryBuilder(Student, "student")
      .where("student.id = :id", { id: id })
      .getOne();
      console.log(student);
 
    const response = {
      ...users,...student
    }
   
    usersLogger.info(`Fetch Student details from oracle with ${id} and response ${response}`);    
    return {
      success: true,
      data: response,
      total: 1,
      current: 1,
      pageSize: 1,
    };
  };


  async getStudentDetails(data: any, parameters: any) {

    var offset = parameters.current == 1 ? 0 : parameters.current;
    var limit = parameters.pageSize;

    let query_list = []//getFilterStudentQuery(parameters);
    var unique = [-1];
    console.log(`query string ${query_list}`);

    let query_with_filters = query_list.join(" and ");
    let condition = query_with_filters
      ? `where ${query_list.join(" and ")}`
      : " where 1=1";

    console.log("value sis ", condition);

    var finalQuery = this.QUERY_FILTER + `${condition} limit ` + offset * limit + "," + limit + `;`;

    console.log("finalQuery", finalQuery);
    var results = await getManager().query(finalQuery);
    var total = await getManager().query(`SELECT FOUND_ROWS() as total;`);
    console.log("results size", results.length);


    return {
      success: true,
      data: results,
      total: total[0].total,
      current: parameters.current,
      pageSize: limit,
    };
  }
}
