import { getRepository, LessThan, MoreThan, Not, In } from "typeorm";
import { User } from "../entity/User";
import { getManager } from "typeorm";
import axios from "axios";
import { Student } from "../entity/Student";
import { LQSEntry } from "../entity/LQSEntry";
import { Payment } from "../entity/Payment";
import { format } from "date-and-time";
import { randomFill } from "crypto";
import { Constants } from "../helpers/Constants";
const { usersLogger } = require("../Logger.js");
import { validations } from "../helpers/validations";
const date = require('date-and-time')

export class LQSService {


  private COSMOS_URL = process.env.COSMOS_URL;
  private COSMOS_CODE = process.env.COSMOS_CODE;
  private LSQ_ACCESS_KEY = process.env.LSQ_ACCESS_KEY;
  private LSQ_SECRETKEY = process.env.LSQ_SECRETKEY;
  private LSQ_URL = process.env.LSQ_URL;
  private LSQ_ACTIVITY_URL = process.env.LSQ_ACTIVITY_URL;
  private LSQ_SALES_LEAD_URL = process.env.LSQ_SALES_LEAD_URL;
  private LSQ_RETRY = process.env.LSQ_RETRY ? process.env.LSQ_RETRY : "3";
  public static LSQ_STATUS_ENROLLED = "Enrolled";
  public static LSQ_STATUS_CREATED = "Created";
  public static LSQ_STATUS_FAILED = "Failed";
  public static LSQ_STATUS_SUCCESS = "Success";
  public static LSQ_STATUS_Error = "Error";


  private lQSRepository = getRepository(LQSEntry);
  private userRepository = getRepository(User);
  private studentRepository = getRepository(Student);
  private paymentRepository = getRepository(Payment);


  /**
   * Create student from LSQ
   */

  async createStudents() {
    usersLogger.info('Registering students::Start');
    var lqsEntries = await this.fetchLastDayLSQRecords();
    usersLogger.info('Loading... data from database');
    lqsEntries.forEach(async (element) => {
      usersLogger.info(element.id);
      var userDetails = await this.fillLeadDetails(element);
      element.lsqstatus = "created";
      await this.lQSRepository.save(element);
    });
    usersLogger.info('Created students in Admin portal::End');
  }

  async getPRMsAvailability() {
    var prmsData = await getManager().query(
      `SELECT SQL_NO_CACHE prm.id, prm.firstName, prm.lastName, COUNT(student.id) as students FROM prm LEFT JOIN student ON prm.id = student.prm_id AND student.status = 'enrolled' or student.status = 'startclasslater' or student.status = 'onboarding' or student.status = 'error' or student.status = 'batching' WHERE prm.allocate = 1 group by prm.id order by count(student.id) asc limit 1`
    );

    return prmsData;
  }

  getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  async assignPrm() {
    usersLogger.info('Assigning PRM relation::start');
    var lqsEntries = await this.fetchLastDayPRMRecords();
    console.log(lqsEntries);
    var prm = await this.fetchPrmRecords();
    console.log(prm);
    usersLogger.info('Created students in Admin portal::End');
  }

  async fetchPrmRecords() {
    usersLogger.info('PRMs count');
    var prmsCount = await getManager().query(
      'SELECT COUNT(*) as total FROM prm'
    );
    //    console.log(prmsCount);
    //    var prmsAllotment = await getManager().query('SELECT prm_id, COUNT(*) as total FROM student group by prm_id order by count(*) desc');
    var lqsEntries = await this.fetchLastDayPRMRecords();
  }

  async fetchLastDayPRMRecords() {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    var lqsEntries = await this.lQSRepository.find({
      where: {
        updated_at: MoreThanDate(now),
        lsqstatus: In([
          LQSService.LSQ_STATUS_CREATED,
          LQSService.LSQ_STATUS_SUCCESS,
        ]),
      },
    });
    return lqsEntries;
  }

  async fetchLastDayLSQRecords() {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    var lqsEntries = await this.lQSRepository.find({
      where: {
        updated_at: MoreThanDate(now),
        lsqstatus: In([
          LQSService.LSQ_STATUS_ENROLLED,
          LQSService.LSQ_STATUS_FAILED,
          LQSService.LSQ_STATUS_SUCCESS,
        ]),
      },
    });
    return lqsEntries;
  }

  /**
   * Fetch data from LSQ
   * @param element
   */
  async fillLeadDetails(element: any) {
    try {
      var user = new User();
      var payment = new Payment();
      var student = new Student();
      usersLogger.info(`Fetch and update LSQ information:${element.id}`);
      user.id = element.id;
      student.id = element.id;
      payment.id = element.id;
      user.firstName = element.firstName ? element.firstName : '-';
      user.lastName = element.lastName ? element.lastName : '-';
      if (element.phoneNumber) {
        element.phoneNumber = element.phoneNumber.replace('-', '');
        user.phoneNumber = element.phoneNumber;
      }
      if (element.pfirstName) {
        student.pfirstName = element.pfirstName;
      }
      student.course = element.course;
      user.dob = element.dob;
      user.email = element.email ? element.email : ' ';
      if (element.whatsapp) {
        element.whatsapp = element.whatsapp.replace('-', '');
        user.whatsapp = element.whatsapp;
      }
      user.status = LQSService.LSQ_STATUS_ENROLLED;
      user.type = 'student';
      user.dob = element.dob;
      student.pfirstName = element.pfirstName;
      user.whatsapp = element.whatsapp;
      user.alternativeMobile = element.alternativeMobile;
      user.customerEmail = element.customerEmail;
      user.address = element.address;
      user.created_at = new Date();
      user.updated_at = new Date();
      user.state = element.customerAddressState;

      student.studentID = element.studentID;
      student.course = element.course;
      student.courseFrequency = element.courseFrequency;
      student.status = element.status == 'Won' ? 'enrolled' : element.status;
      student.salesowner = element.salesowner;
      student.timings = element.timings;
      student.startLesson = element.startingLevel;
      student.startDate = element.startDate;
      student.teacherName = element.teacherName;
      student.partner = Constants.PARTNER_CODE_QE;

      payment.classessold = element.classessold;
      payment.saleamount = element.saleamount;
      payment.downpayment = element.downpayment;
      payment.emi = element.emi;
      payment.dateofsale = element.dateofsale;
      payment.plantype = element.saleType;
      payment.subscription = element.subscription;
      payment.subscriptionNo = element.subscriptionNo;
      payment.emiMonths = element.emiMonths;
      payment.paymentMode = element.paymentMode;
      payment.paymentid = element.transactionID;
      payment.notes = element.bdaComments;

      usersLogger.info(`Applying Validate ${user.id}`);
      const validateStudent = await (new validations()).validateStudent('LSQValidate', student, user, payment);
      if (validateStudent.status == LQSService.LSQ_STATUS_Error) {
        user.status = LQSService.LSQ_STATUS_Error;
        usersLogger.info(`Validate failed ${user.id}`);
      }


      await this.updateCosmos(user, student, payment);
      await this.userRepository.save(user);
      student.prm_id = await (await this.getPRMsAvailability())[0].id;
      await this.studentRepository.save(student);
      await this.paymentRepository.save(payment);
    } catch (error) {
      console.log(error);
      usersLogger.info(`Failed during Registering students ${element.id}`);
    }
  }

  async updateCosmos(user: User, student: Student, payment: Payment) {
    const options = {
      url: `${this.COSMOS_URL}/api/user/?code=${this.COSMOS_CODE}`,
      json: true,
      body: {
        type: user.type,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdministrator: false,
        phoneNumber: user.phoneNumber,
        status: user.status,
        course: student.course,
        dob: user.dob,
        whatsapp: user.whatsapp,
        studentStatus: student.status == 'Won' ? 'enrolled' : student.status,
        dateofsale: payment.dateofsale,
        studentID: student.studentID,
        pfirstName: student.pfirstName,
        alternativeMobile: user.alternativeMobile,
        customerEmail: user.customerEmail,
        address: user.address,
        state: user.state,
        plantype: payment.plantype,
        subscription: payment.subscription,
        subscriptionNo: payment.subscriptionNo,
        courseFrequency: student.courseFrequency,
        timings: student.timings,
        startLesson: student.startLesson,
        startDate: student.startDate,
        classessold: payment.classessold,
        saleamount: payment.saleamount,
        downpayment: payment.downpayment,
        emi: payment.emi,
        emiMonths: payment.emiMonths,
        paymentMode: payment.paymentMode,
        paymentid: payment.paymentid,
        notes: payment.notes
      }
    };

    if (user.id) {
      options.body["id"] = user.id;
    }
    await axios
      .post(options.url, options.body)
      .then(async (res) => {
        usersLogger.info(`Successfully updated cosmos db for id ${user.id} `);
        return user;
      })
      .catch((error) => {
        usersLogger.info(`Failed during LSQ update ${error}`);
        return { status: 400, error: error?.response?.data };
        return Promise.reject(error);
      });
  }

  async fetchLQSData(data: any) {
    usersLogger.info("fetchLQSData :: Start")
    const options = {
      url: `${this.LSQ_URL}/Leads.Get?accessKey=${this.LSQ_ACCESS_KEY}&secretKey=${this.LSQ_SECRETKEY}`,
      json: true,
      body: {
        "Parameter": {
          "LookupName": "ModifiedOn",
          "LookupValue": data.LookupValue,
          "SqlOperator": ">"
        },
        "Columns": {
          "Include_CSV": "ProspectID, CreatedOn,ModifiedOn,Source,ProspectStage,mx_Parent_Name,LastModifiedOn, FirstName, LastName, EmailAddress, mx_WhatsApp_Phone_Number, mx_Date_of_Birth,Phone"
        },
        "Sorting": {
          "ColumnName": "ModifiedOn",
          "Direction": "1"
        },
        "Paging": {
          "PageIndex": data.PageIndex,
          "PageSize": data.PageSize
        }
      },
    };

    var status;
    var res1 = {};


    res1 = await axios
      .post(options.url, options.body)
      .then(async (res) => {
        usersLogger.info("Fetching Mandatory Fields from Lead API ");
        if (res.data) {
          for (let element of res.data) {
            var lqsEntry = await this.lQSRepository.findOne(
              {
                where:
                  { id: element.ProspectID }
              }
            );
            if (element.ProspectStage.toUpperCase() === LQSService.LSQ_STATUS_ENROLLED.toUpperCase() &&
              !lqsEntry) {
              if (!lqsEntry) {
                lqsEntry = new LQSEntry();
              }
              usersLogger.info("Iterating element ");
              usersLogger.info(element);
              lqsEntry.id = element.ProspectID;
              usersLogger.info(element.ProspectID);
              lqsEntry.firstName = element.FirstName;
              lqsEntry.lastName = element.LastName;
              lqsEntry.pfirstName = element.mx_Parent_Name;
              lqsEntry.email = element.EmailAddress;
              lqsEntry.phoneNumber = element.Phone;
              lqsEntry.whatsapp = element.mx_WhatsApp_Phone_Number;
              lqsEntry.dob = element.mx_Date_of_Birth;
              lqsEntry.retry = parseInt(this.LSQ_RETRY);
              lqsEntry.updated_at = new Date();
              lqsEntry.lsqstatus = LQSService.LSQ_STATUS_ENROLLED;
              lqsEntry.created_at = new Date();
              await this.lQSRepository.save(lqsEntry);
            } else {
              usersLogger.info(`Record processed or with different status id:${element.id} && LSQ record status ${element.ProspectStage}`);
            }
          }
        }
        return await res.data.filter(element => element.ProspectStage.toUpperCase() === 'ENROLLED');
      })
      .catch((error) => {
        usersLogger.info(`Error while fetching Data from LQS ${error}`);
        return { status: 400, error: error?.response?.data };
        return Promise.reject(error);
      });

    usersLogger.info("Updated Mandatory Fields from Lead API ");
    var lqsRecords = await this.lQSRepository.find(
      {
        where:
          { lsqstatus: In([LQSService.LSQ_STATUS_SUCCESS, LQSService.LSQ_STATUS_ENROLLED]) }
      }
    );
    usersLogger.info('Updating... Sales fields in LSQ Records ');
    for (let element of lqsRecords) {
      usersLogger.info(`Total no of records ... ${lqsRecords.length}`);
      payment: Payment;
      var url = `${this.LSQ_SALES_LEAD_URL}?leadId=${element.id}&accessKey=${this.LSQ_ACCESS_KEY}&secretKey=${this.LSQ_SECRETKEY}`;
      let user = await this.userRepository.findOne({
        where: { id: element.id },
      });
      user == null ? new User() : user;
      let payment = await this.paymentRepository.findOne({
        where: { id: element.id },
      });
      payment == null ? new Payment() : payment;

      const details = await axios(url)
        .then(async (response) => {
          element.retry = element.retry - 1
          if (response.data) {
            element.lsqstatus = LQSService.LSQ_STATUS_SUCCESS;
            element.updated_at = new Date();
            this.lQSRepository.save(element);
          }
          return response.data;
        })
        .catch(error => {
          element.lsqstatus = LQSService.LSQ_STATUS_FAILED
          element.updated_at = new Date();
          this.lQSRepository.save(element);
        })


      usersLogger.info("Updating student Sale related fields :: start");
      if (details && details.length > 0) {
        details[0].Fields.map((item) => {

          if (item.Value && item.Value !== "Other" && item.Value !== "") {
            switch (item.SchemaName) {
              case "Status":
                element.status = item.Value;
                break;
              case "SalesOwner":
                element.salesowner = item.Value;
                break;
              case "mx_Customer_name":
                element.pfirstName = item.Value;
                break;
              case "mx_WhatsApp_Phone_Number":
                element.whatsapp = item.Value;
                break;
              case "ProductName":
                element.course = item.Value;
                break;
              case "mx_Custom_2":
                element.saleamount = item.Value;
                break;
              case "mx_Custom_3":
                element.dateofsale = item.Value;
                break;
              case "mx_Custom_6":
                element.downpayment = item.Value;
                break;
              case "mx_Custom_31":
                element.downpayment = item.Value;
                break;
              case "mx_Custom_8":
                element.transactionID = item.Value;
                break;
              case "mx_Custom_9":
                element.teacherName = item.Value;
                break;
              case "mx_Custom_11":
                element.dob = item.Value ? item.Value : null;
                break;
              case "mx_Custom_12":
                element.alternativeMobile = item.Value;
                break;
              case "mx_Custom_13":
                element.customerEmail = item.Value;
                break;
              case "mx_Custom_14":
                element.address = item.Value;
                break;
              case "mx_Custom_15":
                element.customerAddressState = item.Value;
                break;
              case "mx_Custom_16":
                element.saleType = item.Value;
                break;
              case "mx_Custom_17":
                element.subscription = item.Value;
                break;
              case "mx_Custom_18":
                element.subscriptionNo = item.Value;
                break;
              case "mx_Custom_19":
                element.courseFrequency = item.Value;
                break;
              case "mx_Custom_20":
                element.courseFrequency = item.Value;
                break;
              case "mx_Custom_21":
                element.timings = item.Value;
                break;
              case "mx_Custom_22":
                element.startingLevel = item.Value;
                break;
              case "mx_Custom_23":
                element.startDate = item.Value;
                break;
              case "mx_Custom_24":
                element.classessold = item.Value;
                break;
              case "mx_Custom_25":
                element.emi = item.Value;
                break;
              case "mx_Custom_7":
                element.emi = item.Value;
                break;
              case "mx_Custom_26":
                element.emiMonths = item.Value;
                break;
              case "mx_Custom_10":
                element.emiMonths = item.Value;
                break;
              case "mx_Custom_27":
                element.paymentMode = item.Value;
                break;
              case "mx_Custom_28":
                element.paymentMode = item.Value;
                break;
              case "mx_Custom_29":
                element.bdaComments = item.Value;
                break;
              case "mx_Custom_32":
                element.studentID = item.Value;
                break;
              default:
                usersLogger.info(`Not valid schema name ${item.SchemaName}`);
            }
          }
        });
      }

      await this.lQSRepository.save(element);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    usersLogger.info("fetchLQSData :: END");

    return res1;
  }

  async fetchFailedLSQRecords() {
    usersLogger.info("Fetch failed records from data source...");
    var lqsRecords = await this.lQSRepository.find(
      {
        where:
          { lsqstatus: In([LQSService.LSQ_STATUS_FAILED]) }
      }
    );

    await this.processRecords(lqsRecords,{
      PageIndex:1,
      PageSize:100
    });
    return {status:400}
  }



  async fetchLSQData(data: any) {
    usersLogger.info("fetchLSQData :: Start")
    const options = {
      url: `${this.LSQ_URL}/Leads.Get?accessKey=${this.LSQ_ACCESS_KEY}&secretKey=${this.LSQ_SECRETKEY}`,
      json: true,
      body: {
        "Parameter": {
          "LookupName": "ModifiedOn",
          "LookupValue": data.LookupValue,
          "SqlOperator": ">"
        },
        "Columns": {
          "Include_CSV": "ProspectID, CreatedOn,ModifiedOn,Source,ProspectStage,mx_Parent_Name,LastModifiedOn, FirstName, LastName, EmailAddress, mx_WhatsApp_Phone_Number, mx_Date_of_Birth,Phone"
        },
        "Sorting": {
          "ColumnName": "ModifiedOn",
          "Direction": "1"
        },
        "Paging": {
          "PageIndex": data.PageIndex,
          "PageSize": data.PageSize
        }
      },
    };

    var status;
    var res1 = {};


    res1 = await axios
      .post(options.url, options.body)
      .then(async (res) => {
        usersLogger.info("Fetching Mandatory Fields from Lead API ");
        if (res.data) {
          for (let element of res.data) {
            usersLogger.info(element);
            var lqsEntry = await this.lQSRepository.findOne(
              {
                where:
                  { id: element.ProspectID }
              }
            );
            usersLogger.info("*******");
            usersLogger.info(element.ProspectStage.toUpperCase() );
            if (element.ProspectStage.toUpperCase() === LQSService.LSQ_STATUS_ENROLLED.toUpperCase() &&
               !lqsEntry) {
              if (!lqsEntry) {
                lqsEntry = new LQSEntry();
                lqsEntry.id = element.ProspectID;
              }
            
              usersLogger.info(element.ProspectID);
              lqsEntry.firstName = element.FirstName;
              lqsEntry.lastName = element.LastName;
              lqsEntry.pfirstName = element.mx_Parent_Name;
              lqsEntry.email = element.EmailAddress;
              lqsEntry.phoneNumber = element.Phone;
              lqsEntry.whatsapp = element.mx_WhatsApp_Phone_Number;
              lqsEntry.dob = element.mx_Date_of_Birth;
              lqsEntry.retry = parseInt(this.LSQ_RETRY);
              lqsEntry.updated_at = new Date();
              lqsEntry.lsqstatus = LQSService.LSQ_STATUS_ENROLLED;
              lqsEntry.created_at = new Date();
              await this.lQSRepository.save(lqsEntry);
            } else {
              usersLogger.info(`Record processed or with different status id:${element.id} && LSQ record status ${element.ProspectStage}`);
            }
          }
        }
        return await res.data.filter(element => element.ProspectStage.toUpperCase() === 'ENROLLED');
      })
      .catch((error) => {
        usersLogger.info(`Error while fetching Data from LQS ${error}`);
        return { status: 400, error: error?.response?.data };
        return Promise.reject(error);
      });

    usersLogger.info("Updated Mandatory Fields from Lead API ");
    var lqsRecords = await this.lQSRepository.find(
      {
        where:
          { lsqstatus: In([LQSService.LSQ_STATUS_SUCCESS, LQSService.LSQ_STATUS_ENROLLED]) }
      }
    );
    usersLogger.info('Updating... Sales fields in LSQ Records ');
    await this.processRecords(lqsRecords,data);
    usersLogger.info("fetchLQSData :: END");
    return res1;
  }

  
async processRecords(lqsRecords:any,data:any) {
  usersLogger.info(`Total no of records ... ${lqsRecords?.length}`);
  for (let element of lqsRecords) { 
    payment: Payment;
    // var url = `${this.LSQ_ACTIVITY_URL}?leadId=${element.id}&accessKey=${this.LSQ_ACCESS_KEY}&secretKey=${this.LSQ_SECRETKEY}`;

    const options = {
      url: `${this.LSQ_ACTIVITY_URL}?leadId=${element.id}&accessKey=${this.LSQ_ACCESS_KEY}&secretKey=${this.LSQ_SECRETKEY}`,
      json: true,
      body: {
        "Parameter": {
          "ActivityEvent": 210
        },
        "Paging": {
          "PageIndex": data.PageIndex,
          "PageSize": data.PageSize
        }
      },
    };


    let user = await this.userRepository.findOne({
      where: { id: element.id },
    });
    user == null ? new User() : user;
    let payment = await this.paymentRepository.findOne({
      where: { id: element.id },
    });
    payment == null ? new Payment() : payment;

    const details = await axios
      .post(options.url, options.body)
      .then(async (response) => {
        element.retry = element.retry - 1;
        if (response.data) {
          element.lsqstatus = LQSService.LSQ_STATUS_SUCCESS;
          element.updated_at = new Date();
          this.lQSRepository.save(element);
        }
        return response.data;
      })
      .catch(error => {
        element.lsqstatus = LQSService.LSQ_STATUS_FAILED
        element.updated_at = new Date();
        this.lQSRepository.save(element);
        console.log(error);
      })

    if (details && details?.ProspectActivities.length > 0 && details?.ProspectActivities[0].ActivityFields) {
      usersLogger.info("Updating ProspectActivities...");
      var item = details?.ProspectActivities[0].ActivityFields;
      usersLogger.info(JSON.stringify(item));
      element.status = item.Status;
      element.salesowner = item.Owner;
      element.pfirstName = item.pfirstName;
      element.dateofsale = item.mx_Custom_1;
      element.teacherName = item.mx_Custom_2;
      element.studentID = item.mx_Custom_3;
      element.dob = item.mx_Custom_4 ? item.mx_Custom_4 : null;
      element.alternativeMobile = item.mx_Custom_5;
      element.customerEmail = item.mx_Custom_6;
      element.address = item.mx_Custom_7;
      element.customerAddressState = item.mx_Custom_8;
      element.course = item.mx_Custom_9;
      element.courseFrequency = item.mx_Custom_10 !== "Other" ? item.mx_Custom_10 : item.mx_Custom_11;
      element.timings = item.mx_Custom_12;
      element.startingLevel = item.mx_Custom_13;
      element.startDate = item.mx_Custom_14;
      element.saleType = item.mx_Custom_15;
      element.saleamount = item.mx_Custom_16;
      element.classessold = item.mx_Custom_17;
      element.subscription = item.mx_Custom_18;
      element.subscriptionNo = item.mx_Custom_19;
      element.emi = item.mx_Custom_20 !== "Other" ? item.mx_Custom_20 : item.mx_Custom_21;
      element.emiMonths = item.mx_Custom_22 !== "Other" ? item.mx_Custom_22 : item.mx_Custom_23;
      element.downpayment = item.mx_Custom_24 !== "Other" ? item.mx_Custom_24 : item.mx_Custom_25;
      element.paymentMode = item.mx_Custom_26 !== "Other" ? item.mx_Custom_26 : item.mx_Custom_27;
      element.transactionID = item.mx_Custom_28;
      element.bdaComments = item.mx_Custom_29;
      element.whatsapp = item.mx_Custom_30;
    }

    await this.lQSRepository.save(element);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}


}

export const MoreThanDate = (date: Date) => MoreThan(format(date, 'YYYY-MM-DD HH:mm:ss.SSS'))
export const LessThanDate = (date: Date) => LessThan(format(date, 'YYYY-MM-DD HH:mm:ss.SSS'))




