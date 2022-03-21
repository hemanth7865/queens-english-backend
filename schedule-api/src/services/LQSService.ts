import { getRepository, LessThan, MoreThan } from "typeorm";
import { User } from "../entity/User";
import { getManager } from "typeorm";
import axios from "axios";
import { Student } from "../entity/Student";
import { LQSEntry } from "../entity/LQSEntry";
import { Payment } from "../entity/Payment";
import { format } from "date-and-time";
const { usersLogger } = require("../Logger.js");
const date = require('date-and-time')

export class LQSService {
  private COSMOS_URL = process.env.COSMOS_URL;
  private COSMOS_CODE = process.env.COSMOS_CODE;
  private LSQ_ACCESS_KEY = process.env.LSQ_ACCESS_KEY;
  private LSQ_SECRETKEY = process.env.LSQ_SECRETKEY;
  private LSQ_URL = process.env.LSQ_URL;
  private LSQ_SALES_LEAD_URL = process.env.LSQ_SALES_LEAD_URL;


  private lQSRepository = getRepository(LQSEntry);
  private userRepository = getRepository(User);
  private studentRepository = getRepository(Student);
  private paymentRepository = getRepository(Payment);


  /**
   * Create student from LSQ
   */

  async createStudents() {
    usersLogger.info('updating LQS entries in user table::Start');
    const now  =  new Date();
    now.setDate(now.getDate() - 1);
var lqsEntries = await this.lQSRepository.find({
      where: { updated_at:  MoreThanDate(now) },
    })
    usersLogger.info('Loading LSQ details from DB');
    usersLogger.info(lqsEntries);
    lqsEntries.forEach(async (element) => {
      var customerRecord = element;
      usersLogger.info('element');
      usersLogger.info(element);
      var userDetails = await this.fillLeadDetails(element);
    })
    usersLogger.info('updating LQS entries in user table::End');
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
      usersLogger.info('Fetch Sales Details');
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
      user.status = 'enrolled';
      user.type = 'student';
      student.status = element.status;
      payment.dateofsale = element.dateofsale;
      student.studentID = element.studentID;
      user.dob = element.dob;
      student.pfirstName = element.pfirstName;
      user.whatsapp = element.whatsapp;
      user.alternativeMobile = element.alternativeMobile;
      user.customerEmail = element.customerEmail;
      user.address = element.address;
      user.state = element.customerAddressState;
      payment.plantype = element.saleType;
      payment.subscription = element.subscription;
      payment.subscriptionNo = element.subscriptionNo;
      student.course = element.value;
      student.courseFrequency = element.courseFrequency;
      student.timings = element.timings;
      student.startLesson = element.startingLevel;
      student.startDate = element.startDate;
      payment.classessold = element.classessold;
      payment.saleamount = element.saleamount;
      payment.downpayment = element.downpayment;
      payment.emi = element.emi;
      payment.emiMonths = element.value;
      payment.paymentMode = element.paymentMode;
      payment.paymentid = element.transactionID;
      payment.notes = element.bdaComments;


      await this.updateCosmos(user,student,payment);
      this.userRepository.save(user);
      this.studentRepository.save(student);
      this.paymentRepository.save(payment);
    } catch (error) {
      usersLogger.info("Failed during LSQ update");
    }

  }

  async updateCosmos(user: User, student:Student, payment:Payment) {
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
        dob:user.dob,
        whatsapp:user.whatsapp,
        studentStatus:student.status,
        dateofsale:payment.dateofsale,
        studentID : student.studentID,
        pfirstName:student.pfirstName,
        alternativeMobile:user.alternativeMobile,
        customerEmail:user.customerEmail,
        address:user.address,
        state:user.state,
        plantype:payment.plantype,
        subscription:payment.subscription,
        subscriptionNo:payment.subscriptionNo,
        courseFrequency:student.courseFrequency,
        timings:student.timings ,
        startLesson:student.startLesson,
        startDate:student.startDate,
        classessold:payment.classessold,
        saleamount:payment.saleamount,
        downpayment:payment.downpayment,
        emi:payment.emi,
        emiMonths:payment.emiMonths,
        paymentMode:payment.paymentMode,
        paymentid:payment.paymentid,
        notes:payment.notes
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
        usersLogger.info("API Response ");
        usersLogger.info(res.data);
        if (res.data) {
          for (let element of res.data) {
            usersLogger.info("Iterating element ");
            usersLogger.info(element);
            var lqsEntry = new LQSEntry();
            lqsEntry.id = element.ProspectID;
            usersLogger.info(element.ProspectID);
            lqsEntry.firstName = element.FirstName;
            lqsEntry.lastName = element.LastName;
            lqsEntry.pfirstName = element.mx_Parent_Name;
            lqsEntry.email = element.EmailAddress;
            lqsEntry.phoneNumber = element.Phone;
            lqsEntry.whatsapp = element.mx_WhatsApp_Phone_Number;
            lqsEntry.dob = element.mx_Date_of_Birth;
            await this.lQSRepository.save(lqsEntry);
          }
        }
        return res.data;
      })
      .catch((error) => {
        usersLogger.info(`Error while fetching Data from LQS ${error}`);
        return { status: 400, error: error?.response?.data };
        return Promise.reject(error);
      });

    usersLogger.info("Updated Mandatory Fields from Lead API ");
    var lqsEntries = await getManager().query('SELECT * from  lsqentry');
    usersLogger.info('Updating Extra Fields');
    for (let element of lqsEntries) {
      var lqsEntry = new LQSEntry();
      lqsEntry = await this.lQSRepository.findOne(
        {
          where:
            { id: element.id }
        }
      );

      payment: Payment;

      var url = `${this.LSQ_SALES_LEAD_URL}?leadId=${element.id}&accessKey=${this.LSQ_ACCESS_KEY}&secretKey=${this.LSQ_SECRETKEY}`
      let user = await this.userRepository.findOne(
        {
          where:
            { id: element.id }
        }
      );
      user == null ? new User() : user;
      let payment = await this.paymentRepository.findOne(
        {
          where:
            { id: element.id }
        }
      );
      payment == null ? new Payment() : payment;
      let lsq = await this.lQSRepository.findOne(
        {
          where:
            { id: element.id }
        }
      );

      const details = await axios(url)
        .then(response => {
          if (response.data.message) {
            console.log(
              `Got ${Object.entries(response.data.message).length} breeds`
            )
          }
          return response.data;
        })
        .catch(error => {
          console.log(error)
        })

      usersLogger.info("Updating Extra fields :: start");
      if (details && details.length > 0) {
        details[0].Fields.map(item => {
          if (item.Value) {
            switch (item.SchemaName) {


              case 'Status':
                lsq.status = item.Value;

                break;
              case "mx_Custom_3":
                lsq.dateofsale = item.Value;
                break;
              case "mx_Custom_10":
                lsq.studentID = item.Value;

                break;
              case "mx_Custom_11":
                lsq.dob = item.Value ? item.value : null;
                break;
              case "mx_Customer_name":
                lsq.pfirstName = item.Value;
                break;
              case "mx_WhatsApp_Phone_Number":
                lsq.whatsapp = item.Value;

                break;

              case "mx_Custom_12":
                lsq.alternativeMobile = item.Value;

                break;
              case "mx_Custom_13":
                lsq.customerEmail = item.Value;

                break;
              case "mx_Custom_14":
                lsq.address = item.Value;
                break;
              case "mx_Custom_15":
                lsq.customerAddressState = item.Value;

                break;
              case "mx_Custom_16":
                lsq.saleType = item.Value;
                break;
              case "mx_Custom_17":
                lsq.subscription = item.Value;
                break;
              case "mx_Custom_18":
                lsq.subscriptionNo = item.Value;
                break;
              case "mx_Custom_1":
                lsq.course = item.Value;
                break;
              case "mx_Custom_19":
                lsq.courseFrequency = item.Value;
                break;
              case "mx_Custom_21":
                lsq.timings = item.Value;
                break;
              case "mx_Custom_22":
                lsq.startingLevel = item.Value;
                break;

              case "mx_Custom_23":
                lsq.startDate = item.Value;
                break;
              case "mx_Custom_24":
                lsq.classessold = item.Value;
                break;
              case "mx_Custom_2":
                lsq.saleamount = item.Value;
                console.log(item.Value);
                break;
              case "mx_Custom_6":
                lsq.downpayment = item.Value;
                break;


              case "mx_Custom_25":
                lsq.emi = item.Value;
                break;
              case "mx_Custom_26":
                lsq.emiMonths = item.Value;
                break;

              case "mx_Custom_27":
                lsq.paymentMode = item.Value;
                break;

              case "mx_Custom_8":
                lsq.transactionID = item.Value;
                break;
              case "mx_Custom_8":
                lsq.bdaComments = item.Value;
                break;

              default:
                usersLogger.info(`Not valid schema name ${item.SchemaName}`);
            }
          }

        })


      }

      await this.lQSRepository.save(lsq);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('Response is ', res1);
    usersLogger.info("fetchLQSData :: END")

    return res1;
  }

  async saveTeacher(data: any) {

  }

}

export const MoreThanDate = (date: Date) => MoreThan(format(date, 'YYYY-MM-DD HH:MM:SS'))
export const LessThanDate = (date: Date) => LessThan(format(date, 'YYYY-MM-DD HH:MM:SS'))


