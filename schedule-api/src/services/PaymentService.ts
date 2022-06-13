import { getConnection, getManager, getRepository } from "typeorm";
import { isNull, isNullOrUndefined } from "util";
import { Payment } from "../entity/Payment";
import { PaymentModeDetails } from "../entity/PaymentModeDetails";
import { Student } from "../entity/Student";
import { Transactions } from "../entity/Transaction";
import { TransactionDetails } from "../entity/TransactionDetails";
import { User } from "../entity/User";
import { PaymentsView } from "../model/PaymentView";
import { CollectionAgent } from "../entity/CollectionAgent";
import { totalmem } from "os";
const { usersLogger } = require("../Logger.js");
const date = require('date-and-time');
import { PAYMENT_MODE, PAYMENT_STATUS } from '../helpers/Constants';
import { RazorPayUtils } from "../utils/payment/RazorPayUtils";
import { InstallmentService } from "./InstallmentService";


export class PaymentService {

  private transactionRepository = getRepository(Transactions);
  private transaDetailsRepository = getRepository(TransactionDetails);
  private paymentModeDetails = getRepository(PaymentModeDetails);
  private collectionAgent = getRepository(CollectionAgent);
  private studentRepository = getRepository(Student);
  private razorPayUtils = new RazorPayUtils();
  private installmentService = new InstallmentService();

  /**
   * 
   * @param parameters 
   * @returns 
   */


  async fetchCollectionAgent(parameters: any) {
    let t;
    var offset = parameters.current;
    var current = offset;
    var limit = parameters.pageSize;
    offset = offset == 1 ? offset = 0 : offset;
    var whereCondition = [];
    var condition = ""
    for (let param in parameters) {
      switch (param) {
        case "firstName":
          whereCondition.push(`firstName = '${parameters["firstName"]}'`);
          break;
        case "lastName":
          whereCondition.push(`lastName = '${parameters["lastName"]}'`)
          break;
        case "gender":
          whereCondition.push(`gender = '${parameters["gender"]}'`)
          break;
        case "phoneNumber":
          whereCondition.push(`phoneNumber = '${parameters["phoneNumber"]}'`)
          break;
        case "alternativeMobile":
          whereCondition.push(`alternativeMobile = '${parameters["alternativeMobile"]}'`)
          break;
        case "id":
          whereCondition.push(`id = '${parameters["id"]}'`)
          break;
        case "email":
          whereCondition.push(`email = '${parameters["email"]}'`)
          break;
      }
    }

    whereCondition.push(" 1 = 1 ");
    condition = whereCondition.length > 1 ? whereCondition.join(' and ') : whereCondition.toString();

    if (parameters.id) {
      t = await this.collectionAgent.find({ id: parameters.id });
    } else {
      t = await getManager()
        .createQueryBuilder(CollectionAgent, "collectionAgent").where(condition).offset(offset).limit(limit).getMany();
    }
    return {
      success: true,
      pageSize: t.length,
      current: offset,
      data: t,
      status: 200
    }

  }

  /**
   * Student Payment Service 
   */

  async studentPaymentDetails(parameters: any) {
    console.log('parameters');
    console.log(parameters);
    const moment = require("moment");
    var paymentView: PaymentsView[] = [];
    var transactions: Transactions[] = []
    let response = {}
    usersLogger.info('Student Service payment Details ::Start');
    let t;
    const offset = parameters.current ? parseInt(parameters.current) : 0;
    const limit = parameters.pageSize ? parseInt(parameters.pageSize) : 0;
    const offsetRecords = (offset - 1) * limit;
    var whereCondition = [];
    var condition = ""
    // whereCondition.push("");
    for (let param in parameters) {
      console.log('param');
      console.log(param);
      switch (param) {
        case "dueDate":
          whereCondition.push(`due_date = '${parameters["dueDate"]}'`);
          break;
        case "paidDate":
          whereCondition.push(`paid_date = '${parameters["paidDate"]}'`)
          break;
        case "emiAmount":
          whereCondition.push(`emi_amount = '${parameters["emiAmount"]}'`)
          break;
        case "status":
          whereCondition.push(`payment_status = '${parameters["status"]}'`)
          break;
        case "paidAmount":
          whereCondition.push(`paid_amount = '${parameters["paidAmount"]}'`)
          break;
        case "id":
          whereCondition.push(`id = '${parameters["id"]}'`)
          break;
        case "referenceId":
          whereCondition.push(`reference_id = '${parameters["referenceId"]}'`)
          break;
        case "collection_agent":
          whereCondition.push(`collection_agent = '${parameters["collectionAgent"]}'`)
          break;
      }
    }

    console.log(whereCondition.join(' and '));
    whereCondition.push(" 1 = 1 ");
    condition = whereCondition.length > 1 ? whereCondition.join(' and ') : whereCondition.toString();
    console.log(condition);

    let total: number = 0;
    if (parameters.studentId) {
      t = await getManager()
        .createQueryBuilder(Transactions, "transactions").where({ studentId: parameters.studentId }).skip(offsetRecords).take(limit).getMany();
      total = await getManager()
        .createQueryBuilder(Transactions, "transactions").where({ studentId: parameters.studentId }).getCount();
    } else {
      t = await getManager()
        .createQueryBuilder(Transactions, "transactions").where(condition).skip(offsetRecords).take(limit).getMany();
      total = await getManager()
        .createQueryBuilder(Transactions, "transactions").where(condition).skip(offsetRecords).getCount();
    }

    console.log('Transaction condition');
    console.log(condition);

    var ids = t.map((i) => "'" + i.id + "'").join(",");

    whereCondition = [];
    if (ids.length > 0)
      whereCondition.push(`transaction_id in  (${ids})`);

    for (let param in parameters) {

      switch (param) {
        case "tdstatus":
          whereCondition.push(`status = '${parameters["tdstatus"]}'`);
          break;
        case "whatsAppLinkSent":
          whereCondition.push(`whatsapp_link_sent = '${parameters["whatsAppLinkSent"]}'`);
          break;
        case "modeOfPayment":
          whereCondition.push(`mode_of_payment = '${parameters["modeOfPayment"]}'`);
          break;
        case "callDisposition":
          whereCondition.push(`call_disposition = '${parameters["callDisposition"]}'`);
          break;
        case "feedBackCall":
          whereCondition.push(`feedback_call = '${parameters["paidAmount"]}'`);
          break;
        case "paymentMode":
          whereCondition.push(`paymentMode = '${parameters["paymentMode"]}'`)
          break;
        case "transaction_details_id":
          whereCondition.push(`transaction_details_id = '${parameters["transaction_details_id"]}'`)
          break;
      }
    }

    condition = whereCondition.length > 1 ? whereCondition.join(' and ') : whereCondition.toString();
    usersLogger.info(condition);



    var tdetails = await getManager()
      .createQueryBuilder(TransactionDetails, "transactiondetails").where(condition).getMany();

    console.log("Transaction details log");
    console.log(condition);

    for (let item of tdetails) {
      var record = await this.transactionRepository.findOne({ id: item.transactionId });
      var view = new PaymentsView();

      var student: string;
      var studentQuer = "select * from user where id = '" + record.studentId + "';";
      student = await getManager().query(studentQuer);

      const studentData = await this.studentRepository.findOne({ id: record.studentId });
      const collectionAgent = await this.collectionAgent.findOne({ id: studentData.collection_agent_id });



      view.id = record.id;
      view.studentId = record.studentId;
      view.dueDate = record.dueDate;
      view.paidDate = record.paidDate;
      view.emiAmount = record.emiAmount;
      view.paidAmount = record.paidAmount;
      view.collectionAgent = collectionAgent?.firstName ? `${collectionAgent?.firstName} ${collectionAgent?.lastName || ''}` : "Not Found";
      view.status = record.status;
      view.created_at = record.created_at;
      view.updated_at = record.updated_at;
      // const td = await this.transaDetailsRepository.findOne({transactionId:item["transactionId"]});

      view.transaction_details_id = item.id;
      view.transactionId = item.transactionId;
      view.razorpayLink = record.paymentLink;
      view.whatsAppLinkSent = item.whatsAppLinkSent
      view.callDisposition = item.callDisposition;
      view.feedBackCall = item.feedBackCall;
      view.paymentMode = item.paymentMode;
      view.created_at = item.created_at;
      view.updated_at = item.updated_at;
      view.student = student;
      view.collectionAgentObj = collectionAgent;
      view.actualStartDate = studentData.classesStartDate;
      view.notes = item.notes;
      view.leadId = studentData.studentID;
      paymentView.push(view);
    }

    usersLogger.info('Fetching student payment details::End');

    return {
      success: true,
      pageSize: limit,
      current: offset,
      total: total,
      data: paymentView,
      status: 200
    }
  }

  async paymentDetails(requestData: any) {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    usersLogger.info('Save payment Details::Start');
    usersLogger.info(`Request data ${JSON.stringify(data)}`);

    let response = [];
    try {

      for (var data of requestData)
        var transaction = new Transactions();
      if (data.id) {
        transaction.id = data.id;
        transaction.updated_at = new Date();
      } else {
        transaction.created_at = new Date();
        transaction.updated_at = new Date();
      }
      transaction.studentId = data.studentId
      transaction.dueDate = data.dueDate;
      transaction.paidDate = data.paidDate;
      transaction.emiAmount = data.emiAmount;
      transaction.paidAmount = data.paidAmount;
      transaction.status = data.status;
      //payment details from razor pay
      transaction.transactionId = data.paymentId;
      transaction.paymentLink = data.paymentLink;

      var transactions = await this.transactionRepository.save(transaction);

      var transactiondetail = new TransactionDetails();
      if (data.transaction_details_id) {
        transactiondetail.id = data.transaction_details_id
        transactiondetail.updated_at = new Date();
      } else {
        transactiondetail.transactionId = transactions.id;
        transactiondetail.created_at = new Date();
        transactiondetail.updated_at = new Date();
      }

      transactiondetail.whatsAppLinkSent = data.whatsAppLinkSent;
      transactiondetail.callDisposition = data.callDisposition;
      transactiondetail.feedBackCall = data.feedBackCall;
      transactiondetail.paymentMode = data.paymentMode;
      transactiondetail.notes = data.notes;


      let tdeails = await this.transaDetailsRepository.save(transactiondetail);
      response.push({ ...transactions, ...tdeails });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      return {
        status: "error",
        message: "Unable to create payment data"
      }
    }
    console.log('Successfully updated payment details....');
    return {
      status: "success",
      data: response
    };
  }

  async createPaymentLinksForInstallments() {
    var currentMonth = date.format(new Date(), "YYYY-MM") + '%';
    var successCount = 0;
    var failureCount = 0;
    usersLogger.info('currMonth: ' + currentMonth);
    var installmentsWithoutLinks = await getRepository(Transactions)
      .createQueryBuilder("transactions")
      .where("((transactions.paymentLink is null or transactions.paymentLink = '') and (transactions.transactionId is null or transactions.transactionId = '')) and transactions.dueDate like :currentMonth and transactions.status = :status", { currentMonth: currentMonth, status: PAYMENT_STATUS.PENDING })
      .getMany();
    usersLogger.info('installments without links: ' + installmentsWithoutLinks.length);

    var installmentsForUpdate: Transactions[] = [];
    for (let installment of installmentsWithoutLinks) {
      var paymentResponse = await this.createPaymentLink(installment);
      if (isNullOrUndefined(paymentResponse) || isNullOrUndefined(paymentResponse.id) || isNullOrUndefined(paymentResponse.short_url)) {
        usersLogger.info('Payment link generation failed for installment: ' + installment.id + 'payment response: ' + JSON.stringify(paymentResponse));
        failureCount++;
      }
      else {
        //update installment data
        installment.transactionId = paymentResponse.id;
        installment.paymentLink = paymentResponse.short_url;
        installmentsForUpdate.push(installment);
        successCount++;
      }
    }
    await this.updateInstallmentData(installmentsForUpdate);
    return {
      status: "success",
      message: "Payment links generated for " + successCount + " installments, Failure count: " + failureCount
    }
  }

  async regeneratePaymentLink(request: any) {
    if (isNullOrUndefined(request.installmentId)) {
      usersLogger.info('No installment id available for regenerating payment link');
      return {
        status: "error",
        message: "No installment id available for regenerating payment link"
      }
    }
    var installment = await this.transactionRepository.findOne({ id: request.installmentId });
    if (isNullOrUndefined(installment)) {
      usersLogger.info('No installment available for the given id');
      return {
        status: "error",
        message: "No installment available for the given id"
      }
    }

    // update payment status of current transaction for real time data, if the current status is PENDING
    let paymentStatus = installment.status;
    usersLogger.info('current payment status: ' + paymentStatus);
    if (paymentStatus == PAYMENT_STATUS.PENDING && !isNullOrUndefined(installment.transactionId)) {
      paymentStatus = await this.installmentService.updateInstallmentStatus(installment.transactionId);
    }
    usersLogger.info('updated payment status: ' + paymentStatus);

    if (paymentStatus == PAYMENT_STATUS.PAID) {
      usersLogger.info('Installment status is paid for the given id');
      return {
        status: "error",
        message: "Installment status is paid for the given id"
      }
    }

    //regenerate payment link
    var paymentResponse = await this.createPaymentLink(installment);
    if (isNullOrUndefined(paymentResponse) || isNullOrUndefined(paymentResponse.id) || isNullOrUndefined(paymentResponse.short_url)) {
      usersLogger.info('Payment link generation failed for installment: ' + installment.id + 'payment response: ' + JSON.stringify(paymentResponse));
      return {
        status: "error",
        message: "Razor pay response: " + paymentResponse
      }
    }
    else {
      var installmentsForUpdate: Transactions[] = [];
      installment.transactionId = paymentResponse.id;
      installment.paymentLink = paymentResponse.short_url;
      // paid date is set to null since installment status is pending
      installment.paidDate = null;
      installmentsForUpdate.push(installment);
      await this.updateInstallmentData(installmentsForUpdate);
      return {
        status: "success",
        message: "Payment link regenerated for installment id",
        paymentId: paymentResponse.id,
        paymentLink: paymentResponse.short_url
      }
    }
  }

  createPaymentLink = async (installment: any) => {
    if (isNullOrUndefined(installment)) {
      usersLogger.info('No installment available for generating payment link');
      return {
        status: "error",
        message: "No installment available for generating payment link"
      }
    }

    usersLogger.info('Generating payment link for installment id: ' + installment.id);
    var user = await getManager()
      .createQueryBuilder(User, "user")
      .where("user.id = :id", { id: installment.studentId })
      .getOne();
    if (isNullOrUndefined(user)) {
      usersLogger.info('No user available for the given id: {0}' + installment.studentId);
      return {
        status: "error",
        message: "No user available for the given id"
      }
    }
    usersLogger.info('User: ' + JSON.stringify(user));

    return await this.razorPayUtils.createRazorPayLink(installment, user);
  }

  async updateInstallmentData(installmentsWithoutLinks: Transactions[]) {
    usersLogger.info('installments without links for update: ' + installmentsWithoutLinks.length);
    for (let installment of installmentsWithoutLinks) {
      await this.transactionRepository.update({ id: installment.id }, installment);
    }
    return;
  }

}
