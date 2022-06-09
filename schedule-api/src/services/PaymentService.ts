import { getConnection, getManager, getRepository } from "typeorm";
import { isNullOrUndefined } from "util";
import { Payment } from "../entity/Payment";
import { PaymentModeDetails } from "../entity/PaymentModeDetails";
import { Student } from "../entity/Student";
import { Transactions } from "../entity/Transaction";
import { TransactionDetails } from "../entity/TransactionDetails";
import { User } from "../entity/User";
import { PaymentsView } from "../model/PaymentView";
const { usersLogger } = require("../Logger.js");
const date = require('date-and-time');
const { createRazorPayLink } = require("../utils/payment/RazorPayUtils");


export class PaymentService {

  private transactionRepository = getRepository(Transactions);
  private transaDetailsRepository = getRepository(TransactionDetails);
  private paymentModeDetails = getRepository(PaymentModeDetails);


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
    var offset = parameters.current;
    var current = offset;
    var limit = parameters.pageSize;
    offset = offset == 1 ? offset = 0 : offset;
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


    if (parameters.studentId) {
      t = await this.transactionRepository.find({ studentId: parameters.studentId });
    } else {
      t = await getManager()
        .createQueryBuilder(Transactions, "transactions").where(condition).offset(offset).limit(limit).getMany();
    }

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
      .createQueryBuilder(TransactionDetails, "transactiondetails").where(condition).offset(offset).limit(limit).getMany();

    for (let item of tdetails) {
      var record = await this.transactionRepository.findOne({ id: item.transactionId });
      var view = new PaymentsView();
      view.id = record.id;
      view.studentId = record.studentId;
      view.dueDate = record.dueDate;
      view.paidDate = record.paidDate;
      view.emiAmount = record.emiAmount;
      view.paidAmount = record.paidAmount;
      view.collectionAgent = record.collectionAgent;
      view.status = record.status;
      view.created_at = record.created_at;
      view.updated_at = record.updated_at;
      // const td = await this.transaDetailsRepository.findOne({transactionId:item["transactionId"]});

      view.transaction_details_id = item.id;
      view.transactionId = item.transactionId;
      view.whatsAppLinkSent = item.whatsAppLinkSent
      view.callDisposition = item.callDisposition;
      view.feedBackCall = item.feedBackCall;
      view.paymentMode = item.paymentMode;
      view.created_at = item.created_at;
      view.updated_at = item.updated_at;
      paymentView.push(view);
    }

    usersLogger.info('Fetching student payment details::End');

    return {
      success: true,
      pageSize: paymentView.length,
      current: offset,
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

  async createPaymentLinksForStudents(request) {
    return await this.fetchPaymentData(request);
  }

  fetchPaymentData = async (request: any) => {
    if (!request.id) {
      console.log('No Student available for generating payment link');
      return;
    }
    var id = request.id;
    console.log('Fetch Student details with id: {0}', id);

    var user = await getManager()
      .createQueryBuilder(User, "user")
      .where("user.id = :id", { id: id })
      .getOne();
    if (isNullOrUndefined(user)) {
      console.log('No user available for the given id: {0}', id);
      return;
    }
    var student = await getManager()
      .createQueryBuilder(Student, "student")
      .where("student.id = :id", { id: id })
      .getOne();
    if (isNullOrUndefined(student)) {
      console.log('No Student available for the given id: {0}', id);
      return;
    }
    var payment = await getManager()
      .createQueryBuilder(Payment, "payment")
      .where("payment.studentId = :id", { id: id })
      .getOne();
    if (isNullOrUndefined(payment)) {
      console.log('No payment available for the given id: {0}', id);
      return;
    }
    console.log(user);
    console.log(student);
    console.log(payment);

    var razorPayResponse = await createRazorPayLink(payment, student, user);

    return;
  }

}
