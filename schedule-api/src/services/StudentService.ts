import { FileLogger, getConnection, getRepository, Not } from "typeorm";
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
import { PRManager } from "../entity/PRManager";
import { LQSService } from "./LQSService";

export class StudentService {
  private usersRepository = getRepository(User);
  private studentRepository = getRepository(Student);
  private paymentRepository = getRepository(Payment);
  private studentAvailabilityRepository = getRepository(StudentAvailability);
  private teacherService  = new TeacherService();
  private prmRepository = getRepository(PRManager);


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
    
    let prm_name = parameters.prm_name;

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

      let innerJoinPRM: string = "";
      let PRMSelect: string = "";
      let PRMHaving: string = ``;
      if(prm_name){
        PRMHaving = ` HAVING prm_full_name LIKE '%${prm_name}%'`;
        PRMSelect = ", concat(prm.firstName , ' ', prm.lastName) as prm_full_name";
        innerJoinPRM = "INNER JOIN prm ON prm.id = s.prm_id";
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

 

    var finalQuery =  `select SQL_CALC_FOUND_ROWS concat(u.firstName , "  ", u.lastName) as name ${PRMSelect}, s.callStatus, u.firstName, u.lastName, u.phoneNumber, u.email, u.customerEmail, u.status as status, CONVERT_TZ(u.dob, @@session.time_zone, '+11:00') as dob, u.alternativeMobile, u.whatsapp, u.address, u.state, u.id  as teacherId , u.id as userId, u.id, u.id as cosmos_ref, u.type, s.classType, s.age, CONVERT_TZ(s.startDate, @@session.time_zone, '+11:00') as startDate, s.startLesson, s.pfirstName, s.plastName, s.course, s.comments,  CONVERT_TZ(s.startdate, @@session.time_zone, '+11:00') as classesStartDate, s.status as salestatus, s.callBackon, s.bdaName, s.bdmName,  s.poc, s.teacherName, p.paymentid, s.courseFrequency, s.timings, s.prm_id, s.salesowner, s.waMessageSent from user as u LEFT JOIN student as s ON s.id = u.id LEFT JOIN payment as p On p.id = u.id ${innerJoinPRM} ${query_string} ${PRMHaving} ORDER BY u.updated_at DESC LIMIT ${limit >= 0 ? limit : 20} OFFSET ${(offset >= 0 ? offset : 0) * (limit >= 0 ? limit : 20)};`;
  let totalQuery = `SELECT COUNT (*) as total ${PRMSelect} from user as u LEFT JOIN student as s ON s.id = u.id ${innerJoinPRM} ${query_string}`

  console.log(`query string ${query_list}`);

  console.log('Final query executing ', finalQuery);


      results = await getManager().query(finalQuery);
      var total = await getManager().query(totalQuery);
      console.log("results size", results.length);

      for (const element of results) {
        
        let slotsResult: any[] = [];
        let batchCodes: any[] = [];
        let payment: string;
        var prm_info = new PRManager();
   
        var studentOrTeacherId=[];
        var zoomLinkBatch = [];
        var zoomInfoBatch = [];
        var batchCode = '';
  
        if (type == 'student' ) {
          var quer =
          "select id,batchNumber,zoomLink, zoomInfo from classes where id IN (select batchId from batch_students where studentId='" +
          element.id +
          "');";
          
          batchCodes = await getManager().query(quer);
          batchCodes.forEach((element) => {
            console.log("batchCode", element);
            studentOrTeacherId.push(element.batchNumber);
            zoomLinkBatch.push(element.zoomLink)
            zoomInfoBatch.push(element.zoomInfo)
          });

          var paymentQuer =
          "select * from payment where id = '"+element.id+"';";
          
          payment = await getManager().query(paymentQuer);
          console.log(`PRM id is ${element.prm_id}`);

          prm_info = await this.prmRepository.findOne(element.prm_id);
        }

        if (element.dob) {
          var today = new Date();
          var birthDate = new Date(element.dob);
          var age = today.getFullYear() - birthDate.getFullYear();
          var m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) 
          {
              element.age = age--;
          }
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
          element.dob?element.dob.toISOString().split('T')[0]:'',
          element.whatsapp,
          element.address,
          element.classType,
          payment,
          element.age,
          element.startDate?element.startDate.toISOString().split('T')[0]:'',
          element.startLesson,
          element.pfirstName,
          element.plastName,
          element.course,
          element.comments,
          element.alternativeMobile,
          element.paymentid,
          element.firstName,
          element.lastName,
          element.teacherName,
          element.days,
          element.studentType,
          element.firstFeedback,
          element.classesStartDate?element.classesStartDate.toISOString().split('T')[0]:'',
          element.callStatus,
          element.callBackon,
          element.bdaName,
          element.bdmName,
          element.poc,
          element.courseFrequency,
          element.timings,
          element.customerEmail,
          element.state,
          zoomLinkBatch.join(","),
          zoomInfoBatch.join(","),
          prm_info?prm_info.id:'',
          prm_info?prm_info.firstName:'',
          prm_info?prm_info.lastName:'',
          element.salestatus,
          element.salesowner,
          prm_info?`${prm_info.firstName} ${prm_info.lastName}`:'',
          element.waMessageSent,
        );
        leadView.push(l);
      }

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
              var user = await this.saveStudentSQL(data,data.id, true);
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

  async isStudentExist(column = "alternativeMobile", value: string, id: string | undefined): Promise<any>{
      let where: any =  {[column]: value};
      if(id){
          where['id'] = Not(id);
      }
      try{
        const user = await this.studentRepository.findOne({where});
        return user;
      }catch(e){
        console.log(e);
        usersLogger.error(e);
        return false;
      }
    }

  async updateStudentStatus(data: any){
    usersLogger.info(
      `Update user status in Admin portal with phoneNumber : ${data?.phoneNumber}`
    );
    let user;
    if(data.status && data.id){
      user = await this.usersRepository.update({id: data.id}, {status: data.status});
      return {status: 200, data: user};
    }
    return {status: 400, data: "Failed To Update User Status"};
  }

  async mapStudentData(data: any, id: string, create: boolean = false) {
    let payments: any[] = [];
    let studentAvailability: any[] = [];

    let user = new User();
    user.firstName = data.firstName;
    user.lastName = data.lastName;
    user.gender = data.gender;
    user.phoneNumber = data.phoneNumber;
    user.email = data.email;
    user.type = data.type;
    user.customerEmail = data.customerEmail;
    user.alternativeMobile = data.alternativeMobile;

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

    user.startDate = data.startDate;
    user.address = data.address;
    user.whatsapp = data.whatsapp;

    if (data.dob) {
      user.dob = data.dob;
    }
    user.status = data.status;
    user.photo = data.photo;
    user.languages = data.languages;
    user.created_at = new Date();
    user.updated_at = new Date();

    let student = new Student();
    let payment = new Payment();

    if (user.id) {
      student.id = user.id;
      student.updated_at = new Date();
    } else {
      student.created_at = new Date();
      student.updated_at = new Date();
    }

    if (data.payment) {
      for (let element of data.payment) {
        if(element.dateofsale?.length < 5){
          continue;
        }
        if (element.id) {
          payment.id = element.id;
        }
        payment.paymentid = element.paymentid;
        student.id = element.studentId;
        payment.plantype = element.plantype;
        payment.studentId = element.studentId;
        payment.classtype = element.classtype;
        payment.classessold = element.classessold ? element.classessold : 0;
        payment.saleamount = element.saleamount ? element.saleamount :0;
        payment.dateofsale = element.dateofsale;
        payment.downpayment = element.downpayment ? element.downpayment : 0;
        payment.duedate = element.duedate;
        payment.subscription = element.subscription;
        payment.subscriptionNo = element.subscriptionNo;
        payment.emi = element.emi;
        payment.emiMonths = element.emiMonths;
        payment.paymentMode = element.paymentMode;
        payment.dateofsale = element.dateofsale;
        payment.no_of_delayed_payments = element.no_of_delayed_payments ? element.no_of_delayed_payments: 0;
        payments.push(payment);
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
    student.waMessageSent= data.waMessageSent;
    student.logApp  = data.logApp;
    student.pfirstName= data.pfirstName;
    student.plastName= data.plastName;
    student.comments= data.comments;
    student.incentive= data.incentive;
    student.classesStartDate = data.classesStartDate;
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
    student.callStatus = data.callStatus;
    student.callBackon = data.callBackon;
    student.bdaName = data.bdaName;
    student.bdmName = data.bdmName;
    student.courseFrequency = data.courseFrequency;
    student.timings = data.timings;
    student.salesowner = data.salesowner;
    student.status = data.status;
    student.prm_id = data.prm_id;
    student.waMessageSent = data.waMessageSent;
    student.assesmentDate = data.assesmentDate?.length > 0 ? data.assesmentDate : new Date();
    
    if (create){
      const lqsClient = new LQSService();
      student.prm_id = await(await lqsClient.getPRMsAvailability())[0].id;
    }

    if (data.studentAvailability) {
      for (let element of  data.studentAvailability) {
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
          availability.created_at = new Date();
          availability.updated_at = new Date();
          availability.start_slot = element.start_slot;
          availability.end_slot = element.end_slot;
          studentAvailability.push(availability);
        }
    }

    return {student, payments, user, studentAvailability};
  }

  async saveStudentSQL(data: any, id, create = false) {
    usersLogger.info(
      `Register user in Admin portal with phoneNumber : ${data?.phoneNumber}`
    );
    try {
      var studentAvailabilityList: StudentAvailability[] = [];
      var teacherAvailability: TeacherAvailability[] = [];

      const UserData = await this.mapStudentData(data, id, create);

      let {user, payments, studentAvailability, student} = UserData;

      usersLogger.info(`user data is ${JSON.stringify(user)}`);
      user = await this.usersRepository.save(user);
      usersLogger.info(`user data after insert ${JSON.stringify(user)}`);

      for (let element of payments) {
          const payment =  await this.paymentRepository.save(element);
          user.payment = [payment];
          usersLogger.info(`Successfully updated payment  ${JSON.stringify(payment)}`);
      }

      student = await this.studentRepository.save(student);

      if (studentAvailabilityList) {
        for (let element of  studentAvailability) {
          let availability = await this.studentAvailabilityRepository.save(
            element
          );
          studentAvailabilityList.push(availability);
        }
      }
  
      console.log("leadAvailability", teacherAvailability);
  
      user.teacherAvailability = teacherAvailability;
      user.studentAvailability = studentAvailability;

      usersLogger.info(`Student object inserted  ${JSON.stringify(student)}`);
     
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
    student.classesStartDate = element.classesStartDate;
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
    student.callStatus = element.callStatus;
    student.callBackon = element.callBackon;
    student.bdaName = element.bdaName;
    student.bdmName = element.bdmName;
    student.assesmentDate = element.assesmentDate;
    student.courseFrequency = element.courseFrequency;
    student.salesowner = element.salesowner;
    student.status = element.status;
    student.timings = element.timings;
    student.wabatch = element.wabatch;

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

  async updateStudentsCSV(data: any, query: {test: false}){
    const moment = require("moment");
    const formatDate = (date: any) => moment(date, "DD-MM-YYYY").format("YYYY-MM-DD");
    let result = {
      "updated": 0,
      "notFound": 0,
      "errors": 0,
      "duplicated": 0,
      "duplicatedRecords": {},
      "duplicatedRecordsIDs": [],
      "notFoundRecordsIDs": [],
    };

    const allowedReq = {
      "M-T-W-Th-F (Course duration - 5 Months)": "MTWTF",
      "T-Th-S (Course duration - 8 Months)": "TTS",
      "M-W-F (Course duration - 8 Months)": "MWF",
      "Sa - S (Course duration - 14 Months)": "SS",
    }

    for(let d of data){
      try{
        const users = await getManager()
        .createQueryBuilder(User, "user")
        .where(`user.phoneNumber LIKE '%${d["Registered Mobile Number"]}%'`)
        .getMany();
  
        if(users.length < 1){
          result.notFound++;
          result["notFoundRecordsIDs"].push({phoneNumber: d["Registered Mobile Number"], id: d['Student ID']});
          continue;
        }

        if(users.length > 1){
          result.duplicated++;
          result["duplicatedRecords"][d["Registered Mobile Number"]] = users;
          for(let user of users){
            result["duplicatedRecordsIDs"].push({phoneNumber: d["Registered Mobile Number"], studentID: user.id, id: d['Student ID']});
          }
          continue;
        }

        const user = users[0];

        let student: any = await getManager()
        .createQueryBuilder(Student, "student")
        .where("student.id = :id", { id: user.id })
        .getOne();

        if(!student){
          student = new Student;
          student.id = user.id;
        }

        user.created_at = moment(d["Timestamp"], "DD-MM-YYYY hh:mm").format("YYYY-MM-DD hh:mm:ss");
        student.studentID = d["Student ID"];
        student.payment = new Payment();
        student.payment.dateofsale = formatDate(d["Date of Sale"]);
        const [pfirstName, plastName] = d["Full name of the customer"].split(" ");
        student.pfirstName = pfirstName;
        student.plastName = plastName;
        user.whatsapp = d["Whatsapp Number"];
        user.alternativeMobile = d["Alternate Number"];
        user.customerEmail = d["Email ID of the customer"];
        user.address = d["Customer Address"];
        user.state = d["Customer Address - State"];
        student.course = d["Course"];
        student.courseFrequency = allowedReq[d["Course Frequency"]];
        student.timings = d["Preferred Timings"].slice(0, 7);
        student.startLesson = `Lesson ${d["Starting Level of the Student"].split(" ")[d["Starting Level of the Student"].split(" ").length - 1]}`;
        student.startDate = formatDate(d["Tentative Start Date (as requested by the customer)"]);
        student.payment.classessold = d["Number of classes sold"];
        student.payment.saleamount = d["Total Sale Amount (INR)"];
        student.payment.downpayment = d["Down payment (INR)"];
        student.payment.emi = d["EMI Amount (INR)"];
        student.payment.emiMonths = d["Number of months of EMI"];
        student.payment.paymentMode = d["Payment Mode"];
        student.payment.paymentid = d["Transaction ID"];
        student.comments = d["BDA comments"];
        user.dob = formatDate(d["Date of birth of the student"]);
        student.payment.plantype = d["Type of Sale"];
        student.payment.subscription = d["Subscription"];

        student.payment = [student.payment];

        const resultData = {...student, ...user};

        if(!query.test){
          await this.saveStudentDetails(resultData);
        }

        result.updated ++;
      }catch(e){
        console.log(e);
        result.errors++;
      }
    }

    /**
     * Map Data
     */
    // saveStudentDetails
    return result;
  }

  async updateStudentsCSVV2(data: any, query: {test: false}){
    const moment = require("moment");
    const formatDate = (date: any) => moment(date, "DD-MM-YYYY").format("YYYY-MM-DD");
    const primaryColumn = "Contact No.";
    let result: any = {
      "updated": 0,
      "notFound": 0,
      "errors": 0,
      "duplicated": 0,
      "PRMs": 0,
      "notFoundPRMs": [],
      "duplicatedRecords": {},
      "duplicatedRecordsIDs": [],
      "notFoundRecordsIDs": [],
    };

    const allowedReq = {
      "Monday,Wednesday,Friday": "MWF",
      "Monday,Tuesday,Wednesday,Thursday,Friday": "MTWTF",
      "Tuesday,Thursday,Saturday": "TTS",
      "M-T-W-Th-F": "MTWTF",
      "M-W-F": "MWF",
      "T-T-S": "TTS",
      "S-S": "SS",
      "Monday,Tuesday,Wednesday,Thursday": "MTWT",
      "Tuesday,Thursday": "TT",
      "Not found": "",
      "T-Th-S": "TTS",
      "Saturday,Sunday": "SS",
      "Sa - S": "SS",
      "TTS": "TTS",
      "Monday,Wednesday,Thursday": "MWT",
      "Wednesday,Saturday,Sunday": "WSS",
      "Sunday,Monday,Tuesday,Wednesday,Thursday": "SMTWT",
      "M-F": "MF",
      "MWF": "MWF",
      "Monday,Tuesday,Wednesday": "MTW",
      "20bf1398-2adf-4490-af04-c809c2d355d8": undefined,
      "M-T-W-T-F": "MTWTF",
      " Monday,Tuesday,Wednesday,Thrusday,Friday": "MTWTF",
      "Thursday,Friday": "TF",
      "M-T-W-Th-F (Course duration - 5 Months)": "MTWTF",
      "Tuesday,Thursday,Friday,Saturday": "TTFS",
      "Monday,Tuesday,Thursday": "MTT",
      "Thursday,Sunday": "TS",
      "Friday,Saturday,Sunday": "FSS",
      "T T S": "TTS",
      "Sa-S": "SS",
      "Sa - S (Course duration - 14 Months)": "SS",
      "T-Th-S (Course duration - 8 Months)": "TTS",
      "M-W-F (Course duration - 8 Months)": "MWF",
      "S- S": "SS",
      "": undefined,
      "S-S (Course duration - 14Months)": "SS",
      "M-W-F (Course duration- 32Months)": "MWF",
      "T-Th-S (Course duration - 24 Months)": "TTS",
      "M-W-F (Course duration- 8Months)": "MWF",
      "T-Th-S (Course duration - 32 Months)": "TTS",
      "M-W-F (Course duration - 36 Months)": "MWF",
      "M-W-F (Course duration - 32 Months)": "MWF",
      "32 months M-W-F": "MWF",
      "Sa-S (Course duration - 14 Months)": "SS",
      "M-W-F (Course duration - 16 Months)": "MWF",
      "T-Th-Sa (Course duration - 8 Months)": "TTS",
      "M-Tu (Course duration - 14 Months)": "MT",
      "Sa - S (Course duration - 56 Months)": "SS",
      "MWF (Course duration - 8 Months)": "MWF",
      "T Th sat (Course duration - 8 Months)": "TTS",
      "TTS (Course duration - 8 Months)": "TTS",
      "SS (Course duration - 14 Months)": "SS",
      "MTWTF (Course duration - 5 Months)": "MTWTF"
    }

    let qe = `UPDATE student SET prm_id = NULL`;

    await getManager().query(qe); 
    
    try{
      for(let d of data){
        try{
          if(!d[primaryColumn] || d[primaryColumn].length < 4){
            d[primaryColumn] = "NOT_FOUND";
          }
  
          let users = await getManager()
          .createQueryBuilder(User, "user")
          .where(`user.phoneNumber LIKE '%${d[primaryColumn]}%'`)
          .getMany();
          
          if(users.length > 1){
            users = await getManager()
            .createQueryBuilder(User, "user")
            .where(`user.phoneNumber LIKE '%${d[primaryColumn]}%'`)
            .getMany();
            let tmpUsers = [];
            for(let user of users){
              let bathCodeQuery = `SELECT u.id, cl.batchNumber, u.phoneNumber, u.firstName FROM user u LEFT JOIN batch_students bs on bs.studentId = u.id
              LEFT JOIN classes cl on cl.id = bs.batchId
              where cl.batchNumber = '${d['Batch Code']}' AND u.id = "${user.id}"`;
  
              let ids = await getManager().query(bathCodeQuery); 
  
              ids = ids.map(i => {
                i.user = user;
                return i;
              })
              if(ids.length > 0){
                tmpUsers.push(user);
              }
            }
  
            if(tmpUsers.length > 0){
              users = tmpUsers;
            }
          }
  
          if(users.length < 1){
            result.notFound++;
            result["notFoundRecordsIDs"].push({phoneNumber: d[primaryColumn], id: d['Student ID']});
            continue;
          }
  
          if(users.length > 1){
            result.duplicated++;
            result["duplicatedRecords"][d[primaryColumn]] = users;
            for(let user of users){
              result["duplicatedRecordsIDs"].push({phoneNumber: d[primaryColumn], studentID: user.id, id: d['Student ID']});
            }
            continue;
          }
  
          const user = users[0];
  
          let student: any = await getManager()
          .createQueryBuilder(Student, "student")
          .where("student.id = :id", { id: user.id })
          .getOne();
  
          if(!student){
            student = new Student;
            student.id = user.id;
          }
  
          let prmQuery = `SELECT * from prm where firstName='${d['PRM']}'`;
  
          let prm = await getManager().query(prmQuery); 
          prm = prm[0];
  
          student.prm_id = prm?.id
  
          if(prm?.id){
            result.PRMs ++;
          }else{
            const lqsClient = new LQSService();
            student.prm_id = await(await lqsClient.getPRMsAvailability())[0].id;
          }
  
          // TODO: Remap Data
          student.age = d["Age"]
          student.studentID = d["Student ID"];
          student.studentID = d["Days"];
          student.courseFrequency = allowedReq[d["Days"]];
          // user.created_at = moment(d["Timestamp"], "DD-MM-YYYY hh:mm").format("YYYY-MM-DD hh:mm:ss");
          // student.payment = new Payment();
          // student.payment.dateofsale = formatDate(d["Date of Sale"]);
          // const [pfirstName, plastName] = d["Student Name"].split(" ");
          // student.pfirstName = pfirstName;
          // student.plastName = plastName;
          // user.whatsapp = d["Whatsapp Number"];
          // user.alternativeMobile = d["Alternate Number"];
          // user.customerEmail = d["Email ID of the customer"];
          // user.address = d["Customer Address"];
          // user.state = d["Customer Address - State"];
          // student.course = d["Course"];
          // student.timings = d["Preferred Timings"];
          // student.startLesson = `Lesson ${d["Start Lesson"].split(" ")[d["Start Lesson"].split(" ").length - 1]}`;
          // student.startDate = formatDate(d["Tentative Start Date (as requested by the customer)"]);
          // student.payment.classessold = d["Number of classes sold"];
          // student.payment.saleamount = d["Total Sale Amount (INR)"];
          // student.payment.downpayment = d["Down payment (INR)"];
          // student.payment.emi = d["EMI Amount (INR)"];
          // student.payment.emiMonths = d["Number of months of EMI"];
          // student.payment.paymentMode = d["Payment Mode"];
          // student.payment.paymentid = d["Transaction ID"];
          // student.comments = d["BDA comments"];
          // user.dob = formatDate(d["Date of birth of the student"]);
          // student.payment.plantype = d["Type of Sale"];
          // student.payment.subscription = d["Subscription"];
  
          // student.payment = [student.payment];
  
          const resultData = {...student, ...user};
  
          if(!query.test){
            await this.saveStudentSQL(resultData, user.id);
          }
  
          result.updated ++;
        }catch(e){
          console.log(e);
          result.errors++;
        }
      }
    }catch(e){
      console.log(e, data);
    }
 
    /**
     * Map Data
     */
    // saveStudentDetails
    return result;
  }
}
