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
import { StudentAvailability } from "../entity/StudentAvailability";
import { Payment } from "../entity/Payment";

export class StudentService {
  private usersRepository = getRepository(User);
  private studentRepository = getRepository(Student);
  private paymentRepository = getRepository(Payment);
  private studentAvailabilityRepository = getRepository(StudentAvailability);
  private teacherService  = new TeacherService();


  private QUERY_FILTER = `select SQL_CALC_FOUND_ROWS concat(u.firstName , "  ", u.lastName) as name,  u.phoneNumber, u.email, u.dob, u.whatsapp, u.address, st.studentId, u.status as status, u.id  as teacherId , u.id as userId, u.id, u.type from user u left join student st on u.id=st.id `;

  private COSMOS_URL = process.env.COSMOS_URL;
  private COSMOS_CODE = process.env.COSMOS_CODE;

  async listStudentDetails(data:any, parameters: any) {

    
    var results: any[] = [];
    var leadView: LeadView[] = [];
    var map = new Map();
    var leadTem: Teacher[] = [];
    var filter = false;
    var parametersList = [];
    var student: Student[] = [];

    var offset = parameters.current;
    var current = offset;
    var limit = parameters.pageSize;
    if (offset == 1) {
      offset = 0;
    }

    let query_list = [];
    let query_string = "";
  
    const name = parameters.name ? parameters.name : parameters.keyword;
    if (name) {
     
      query_list.push(
        ` (u.firstName like '%${name}%' or u.lastName like '%${name}%' ${parameters.keyword ? 'or u.phoneNumber LIKE "%'+ name+'%"' : ''}) `
      );
    }
    const mobile = parameters.phoneNumber;
    if (mobile) {
      query_list.push(` u.phoneNumber  like '%${mobile}%' `);
    }

    const email = parameters.email;
    if (email) {
      query_list.push(` u.email  like '%${email}%' `);
    }


    const type = parameters.type;
    var status = parameters.status;
    if (status) {
      //  status = parseInt(status);    
      query_list.push(` u.status like '${status}' `);
    }

    if (type) {
           query_list.push(` u.type like '%${type}%'  `);
      console.log("user type ", type);
    }
    var StudentIds = [];
    if (parameters.studentID) {
      StudentIds.push(parameters.studentID);
    }

    if (parameters.batchCode) {
      let bathCodeQuery = `SELECT u.id FROM user u join batch_students bs on bs.id = u.id
      join classes cl on cl.id = bs.batchId
      where cl.batchNumber like '%${parameters.batchCode}%'`;
      
      let ids = await getManager().query(bathCodeQuery); 
      for (let element of ids) {  
        StudentIds.push(element.id);
      }

    }
    console.log('Student ids',StudentIds);
    const keyword = parameters.keyword;
    let query_search: string;
    if (!!keyword?.length) {
      query_search = ` (u.firstName like '%${keyword}%' or u.lastName like '%${keyword}%' or u.phoneNumber like '%${keyword}%' )`;
    }
    let qIds = new Set();  
 
      for (let element of StudentIds) {
        qIds.add("'"+ element + "'");
      }
      usersLogger.info(`Finale query ids ${JSON.stringify(StudentIds)}`);
    
      if (qIds.size > 0) {
            query_list.push(` u.id in (${[...qIds].join(",")})`);
      } 

      query_list.forEach((value, index) => {
        console.log(query_list.join(" and "));
        if (index != query_list.length - 1) {
          query_string = query_string + query_list[index] + " and ";
        } else {
          query_string = query_string + query_list[index];
        }
      });
  
      if(query_string) {
        query_string = " where " + query_string;
      }


  

    var finalQuery =  `select SQL_CALC_FOUND_ROWS concat(u.firstName , "  ", u.lastName) as name, u.firstName, u.lastName, u.phoneNumber, u.email, u.status as status, u.dob, u.whatsapp, u.address, u.id  as teacherId , u.id as userId, u.id, u.id as cosmos_ref, u.type, s.classType, s.age, s.startDate, s.startLesson, s.pfirstName, s.plastName, s.course, s.comments, s.alternativeMobile, p.paymentid from user as u LEFT JOIN student as s ON s.id = u.id LEFT JOIN payment as p On p.id = u.id ${query_string} limit ` ;
    

  finalQuery = finalQuery +  offset * limit +
  "," +
  limit +
  `;`;
  let totalQuery = `SELECT COUNT (*) as total from user as u ${query_string}`

  console.log(`query string ${query_list}`);

  console.log('Final query executing ', finalQuery);


      results = await getManager().query(finalQuery);
      var total = await getManager().query(totalQuery);
      console.log("results size", results.length);

      for (const element of results) {
        
        let slotsResult: any[] = [];
        let batchCodes: any[] = [];
        let payment: string;
   
        var studentOrTeacherId=[];
        var batchCode = '';
  
        if (type == 'student' ) {
            
          var quer =
          "select id,batchNumber from classes where id IN (select batchId from batch_students where studentId='" +
          element.id +
          "');";
          
          batchCodes = await getManager().query(quer);
          batchCodes.forEach((element) => {
            console.log("batchCode", element);
            studentOrTeacherId.push(element.batchNumber);
          });

          var paymentQuer =
          "select * from payment where studentId = '"+element.id+"';";
          
          payment = await getManager().query(paymentQuer);
        }
        var l = new LeadView(
          element.id,
          element.id,
          new Date().toString(),
          element.name,
          element.exp,
          element.phoneNumber,
          element.email,
          element.status,
            0,
          element.ratings,
          '',
          element.leadtype,
          element.type,
          studentOrTeacherId.join(","),
          element.id,
          element.dob,
          element.whatsapp,
          element.address,
          element.classType,
          payment,
          element.age,
          element.startDate,
          element.startLesson,
          element.pfirstName,
          element.plastName,
          element.course,
          element.comments,
          element.alternativeMobile,
          element.paymentid,
          element.firstName,
          element.lastName,
        );
        leadView.push(l);
      }

      console.log('leadsview', leadView)
  
      return {
        success: true,
        data: leadView,
        total: parseInt(total[0].total),
        current: current,
        pageSize: limit,
      };
  


    }
  
  
  



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
                `Successfully registered user: ${data.phoneNumber}`
              );
              return user;
            }
         
          })
          .catch((error) => {
            usersLogger.info(`Error while updating student : ${error.response.data}`);
            return { status: 400, data: error.response.data };
          });
      } else {
        usersLogger.info(`Update Request`);
        response = await axios
          .put(options.url, options.body)
          .then(async (res) => {
            usersLogger.info("Successfully updated user record in cosomos DB")
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
      var studentAvailability: StudentAvailability[] = [];
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
      let payment = new Payment();

    if (user.id) {
      usersLogger.info(`Student Id is ${JSON.stringify(user.id)}`);
      student.id = user.id;
      student.updated_at = new Date();
    } else {
      student.created_at = new Date();
      student.updated_at = new Date();
    }

    if (data.payment) {
      for (let element of data.payment) {
        if (element.id) {
          payment.id = element.id;
        }
        payment.paymentid = element.paymentid;
        payment.studentId = element.studentId;
        payment.plantype = element.plantype;
        payment.classtype = element.classtype;
        payment.classessold = element.classessold ? element.classessold : 0;
        payment.saleamount = element.saleamount ? element.saleamount :0;
        payment.dateofsale = element.dateofsale;
        payment.downpayment = element.downpayment ? element.downpayment : 0;
        payment.duedate = element.duedate;
        payment.no_of_delayed_payments = element.no_of_delayed_payments ? element.no_of_delayed_payments: 0;
        payment =  await this.paymentRepository.save(payment);
        user.payment = [payment];
        usersLogger.info(`Successfully updated payment  ${JSON.stringify(payment)}`);
      }
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
    student.wabatch= data.wabatch;
    student.logApp  = data.logApp;
    student.pfirstName= data.pfirstName;
    student.plastName= data.plastName;
    student.comments= data.comments;
    student.incentive= data.incentive;
    student.classesPurchase= data.classesPurchase;
    student.classesAttended = data.classesAttended;
    student.classesMissed = data.classesMissed;
    student.partner = data.partner;
    student.lesson= data.lesson;
    student.course = data.course;
    student.assesmentComplete  = data.assesmentComplete;
    student.assesmentMissed = data.assesmentMissed ;
    student.averageScore = data.averageScore;
    student.batchChange = data.batchChange ;
    student.assesmentDate = data.assesmentDate;


      student = await this.studentRepository.save(student);

      
    let i = 0;
    if (data.studentAvailability) {
      for (let element of  data.studentAvailability) {
      //data.leadAvailability.forEach(async (element) => {
        var availability = new StudentAvailability();
        availability.start_date = element.startDate;
        availability.start_slot = element.start_slot;
        console.log("start slot" + element.start_slot);
        if (element.start_slot) {
          let time = element.start_slot.split(":");
          availability.start_slot = time[0];
          console.log("time is ", time);
          availability.start_min = time[1];
          availability.startMin = time[0] * 60 + time[1];
        }
        if (element.end_slot) {
          let time = element.end_slot.split(":");
          availability.end_slot = time[0];
          availability.end_min = time[1];
          availability.endMin = time[0] * 60 + time[1];
        }

        availability.weekday = element.weekday;
        if (element.id) availability.id = element.id;
//        availability.student = student;
        availability.created_at = new Date();
        availability.updated_at = new Date();
        availability = await this.studentAvailabilityRepository.save(
          availability
        );
        availability.start_slot = element.start_slot;
        availability.end_slot = element.end_slot;
        studentAvailability[i++] = availability;
      }
    }

    console.log("leadAvailability", teacherAvailability);

  user.teacherAvailability = teacherAvailability;
  user.studentAvailability = studentAvailability;
    

      usersLogger.info(`Student object inserted  ${JSON.stringify(student)}`);
      //user.id = student.id; 
     
      return {...user};
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

    student.wabatch= element.wabatch;
    student.logApp  =element.logApp;
    student.pfirstName= element.pfirstName;
    student.plastName= element.plastName;
    student.comments=element.comments;
    student.incentive=element.incentive;
    student.classesPurchase= element.classesPurchase;
    student.classesAttended = element.classesAttended;
    student.classesMissed = element.classesMissed;
    student.partner =element.partner;
    student.lesson=element.lesson;
    student.course = element.course;
    student.assesmentComplete  =element.assesmentComplete;
    student.assesmentMissed = element.assesmentMissed ;
    student.averageScore = element.averageScore;
    student.batchChange = element.batchChange ;
    student.assesmentDate =element.assesmentDate;

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
        
        var quer =
        "select studentId , batchId from batch_students where studentId='" +
        id +
        "';";
        var studentOrTeacherId=[];
     var  batchCodes = await getManager().query(quer);
      batchCodes.forEach((element) => {
        console.log("batchdode", element);
        studentOrTeacherId.push(element.batchId);
      });
    
 
    const response = {
      ...users,...student,batchCode:studentOrTeacherId.join(","),studentID:id
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
