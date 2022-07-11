import { getConnection, getManager, getRepository, LessThan, Like, MoreThan } from "typeorm";
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
const date = require("date-and-time");
import { CASHFREE_PAYMENT_STATUS, PAYMENT_MODE, PAYMENT_STATUS, SUBSCRIPTION_TYPE } from "../helpers/Constants";
import { RazorPayUtils } from "../utils/payment/RazorPayUtils";
import { InstallmentService } from "./InstallmentService";
import { fail } from "assert";
import LoggerService from "./LoggerService";
import { format } from "date-and-time";
const moment = require("moment");
import {
  getPaymentById as getRazorpayPaymentById,
  Payment as RazorpayPayment,
} from "../services/RazorpayService";
import { CashFreeUtils } from "../utils/payment/CashFreeUtils";

export class PaymentService {
  private transactionRepository = getRepository(Transactions);
  private transaDetailsRepository = getRepository(TransactionDetails);
  private paymentModeDetails = getRepository(PaymentModeDetails);
  private collectionAgent = getRepository(CollectionAgent);
  private studentRepository = getRepository(Student);
  private razorPayUtils = new RazorPayUtils();
  private cashFreeUtils = new CashFreeUtils();
  private installmentService = new InstallmentService();
  private logger = new LoggerService();
  public request: any = {};

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
    offset = offset == 1 ? (offset = 0) : offset;
    var whereCondition = [];
    var condition = "";
    for (let param in parameters) {
      switch (param) {
        case "firstName":
          whereCondition.push(`firstName = '${parameters["firstName"]}'`);
          break;
        case "lastName":
          whereCondition.push(`lastName = '${parameters["lastName"]}'`);
          break;
        case "gender":
          whereCondition.push(`gender = '${parameters["gender"]}'`);
          break;
        case "phoneNumber":
          whereCondition.push(`phoneNumber = '${parameters["phoneNumber"]}'`);
          break;
        case "alternativeMobile":
          whereCondition.push(
            `alternativeMobile = '${parameters["alternativeMobile"]}'`
          );
          break;
        case "id":
          whereCondition.push(`id = '${parameters["id"]}'`);
          break;
        case "email":
          whereCondition.push(`email = '${parameters["email"]}'`);
          break;
      }
    }

    whereCondition.push(" 1 = 1 ");
    condition =
      whereCondition.length > 1
        ? whereCondition.join(" and ")
        : whereCondition.toString();

    if (parameters.id) {
      t = await this.collectionAgent.find({ id: parameters.id });
    } else {
      t = await getManager()
        .createQueryBuilder(CollectionAgent, "collectionAgent")
        .where(condition)
        .offset(offset)
        .limit(limit)
        .getMany();
    }
    return {
      success: true,
      pageSize: t.length,
      current: offset,
      data: t,
      status: 200,
    };
  }

  /**
   * Student Payment Service
   */
  async studentPaymentDetails(parameters: any) {
    try {
      const moment = require("moment");
      var paymentView: PaymentsView[] = [];
      usersLogger.debug("Student Service payment Details ::Start");
      // let t;
      const offset = parameters.current ? parseInt(parameters.current) : 0;
      const limit = parameters.pageSize ? parseInt(parameters.pageSize) : 0;
      const offsetRecords = (offset - 1) * limit;
      var whereCondition = [];
      var condition = "";
      // console.log(whereCondition.join(" and "));
      whereCondition.push(" 1 = 1 ");
      for (let param in parameters) {
        console.log("param");

        switch (param) {
          case "dueDate":
            var startDate = parameters[param][0];
            var endDate = parameters[param][1];
            whereCondition.push(
              `transactions.due_date between '${startDate}' and '${endDate}'`
            );
            break;
          case "paidDate":
            whereCondition.push(
              `transactions.paid_date = '${parameters[param]}'`
            );
            break;
          case "emiAmount":
            whereCondition.push(
              `transactions.emi_amount = '${parameters[param]}'`
            );
            break;
          case "status":
            whereCondition.push(
              `transactions.payment_status = '${parameters[param]}'`
            );
            break;
          case "paidAmount":
            whereCondition.push(
              `transactions.paid_amount = '${parameters[param]}'`
            );
            break;
          case "id":
            whereCondition.push(`transactions.id = '${parameters[param]}'`);
            break;
          case "referenceId":
            whereCondition.push(
              `transactions.reference_id = '${parameters[param]}'`
            );
            break;
          case "collectionAgent":
            whereCondition.push(
              `transactions.collection_agent = '${parameters[param]}'`
            );
            break;
          case "subscriptionId":
            whereCondition.push(
              `tDetails.subscription_id = '${parameters[param]}'`
            );
            break;
          case "tdstatus":
            whereCondition.push(`tDetails.status = '${parameters[param]}'`);
            break;
          case "whatsAppLinkSent":
            whereCondition.push(
              `tDetails.whatsapp_link_sent = '${parameters[param]}'`
            );
            break;
          case "modeOfPayment":
            whereCondition.push(
              `tDetails.mode_of_payment = '${parameters[param]}'`
            );
            break;
          case "callDisposition":
            whereCondition.push(
              `tDetails.call_disposition = '${parameters[param]}'`
            );
            break;
          case "feedBackCall":
            whereCondition.push(
              `tDetails.feedback_call = '${parameters[param]}'`
            );
            break;
          case "paymentMode":
            whereCondition.push(
              `transactions.paymentMode = '${parameters[param]}'`
            );
            break;
          case "transaction_details_id":
            whereCondition.push(
              `tDetails.transaction_details_id = '${parameters[param]}'`
            );
            break;
          case "leadId":
            whereCondition.push(`student.studentID = '${parameters[param]}'`);
            break;
        }
      }

      condition =
        whereCondition.length > 1
          ? whereCondition.join(" and ")
          : whereCondition.toString();
      console.log(condition);

      var tdetailsQuery = await getManager()
        .createQueryBuilder(Transactions, "transactions")
        .leftJoinAndSelect("transactions.student", "student")
        .leftJoinAndSelect(
          TransactionDetails,
          "tDetails",
          "transactions.id = tDetails.transaction_id"
        )
        .leftJoinAndSelect(User, "user", "student.id = user.id")
        .leftJoinAndSelect(
          CollectionAgent,
          "agent",
          "transactions.collection_agent = agent.id"
        )
        .where(condition);

      var tdetails = await tdetailsQuery
        .offset(offsetRecords)
        .limit(limit)
        .getRawMany();

      var tdetailsCount = await tdetailsQuery.getCount();

      console.log("Transaction details log");
      console.log(condition);
      console.log("OFFSET", offsetRecords);

      for (let record of tdetails) {
        let view = new PaymentsView();
        view.id = record.transactions_id;
        view.studentId = record.transactions_student_id;
        view.referenceId = record.transactions_reference_id;
        view.subscriptionId = record.transactions_subscription_id;
        view.dueDate = record.transactions_due_date;
        view.paidDate = record.transactions_paid_date;
        view.emiAmount = record.transactions_emi_amount;
        view.paidAmount = record.transactions_paid_amount;
        view.status = record.transactions_payment_status;
        view.created_at = record.transactions_created_at;
        view.updated_at = record.transactions_updated_at;
        view.reasonAmountChange = record.transactions_reason_amount_change;
        view.transactionId = record.transactions_id;
        view.razorpayLink = record.transactions_payment_link;
        view.netbankRefLink = record.transactions_netbank_ref_link;

        view.transaction_details_id = record.tDetails_id;
        view.whatsAppLinkSent = record.tDetails_whatsapp_link_sent;
        view.callDisposition = record.tDetails_call_disposition;
        view.feedBackCall = record.tDetails_feedback_call;
        view.paymentMode = record.tDetails_payment_mode;
        view.notes = record.tDetails_notes;

        view.actualStartDate = record.student_classesStartDate;
        view.startDate = record.student_startDate;
        view.leadId = record.student_studentID;
        view.firstName = record.user_firstName;
        view.lastName = record.user_lastName;
        view.phoneNumber = record.user_phoneNumber;
        view.whatsapp = record.user_whatsapp;
        view.collectionAgent = record.agent_firstName;
        paymentView.push(view);
      }

      usersLogger.debug("Fetching student payment details::End");

      return {
        success: true,
        pageSize: limit,
        current: offset,
        total: tdetailsCount,
        data: paymentView,
        status: 200,
      };
    } catch (error) {
      console.log(error);
      return {
        success: true,
        msg: "Unable to retrieve data ...",
      };
    }
  }

  async paymentDetails(requestData: any) {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    usersLogger.debug("Save payment Details::Start");
    usersLogger.info(`Request data ${JSON.stringify(data)}`);

    let response = [];
    try {
      for (var data of requestData) {
        const oldTransactionDetails =
          await this.transaDetailsRepository.findOne({
            where: { id: data.transaction_details_id },
          });
        const oldTransaction = await this.transactionRepository.findOne({
          where: { id: data.id },
        });
        const oldData = {
          transactionDetails: oldTransactionDetails,
          transaction: oldTransaction,
        };
        var transaction = new Transactions();
        if (data.id) {
          transaction.id = data.id;
          transaction.updated_at = new Date();
        } else {
          transaction.created_at = new Date();
          transaction.updated_at = new Date();
        }
        transaction.studentId = data.studentId;
        transaction.dueDate = data.dueDate;
        transaction.paidDate = data.paidDate;
        transaction.emiAmount = data.emiAmount;
        transaction.paidAmount = data.paidAmount;
        transaction.status = data.status;
        //payment details from razor pay
        transaction.transactionId = data.referenceId;
        transaction.paymentLink = data.paymentLink;

        var transactions = await this.transactionRepository.save(transaction);

        var transactiondetail = new TransactionDetails();
        if (data.transaction_details_id) {
          transactiondetail.id = data.transaction_details_id;
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
        transactiondetail.reasonAmountChange = data.reasonAmountChange;

        let tdeails = await this.transaDetailsRepository.save(
          transactiondetail
        );

        const newData = {
          transactionDetails: tdeails,
          transaction: transactions,
        };


        if (oldData?.transaction?.id && oldData?.transactionDetails?.id) {
          await (await this.logger.payment(oldData, newData, {})).save();
        } else {
          await (
            await this.logger.customPayment(
              newData?.transaction?.id || "UNKNOWN",
              "Created Payment",
              "PAYMENT_CREATED",
              { requestData, newRecord: newData, oldRecord: newData },
              {}
            )
          ).save();
        }

        response.push({ ...transactions, ...tdeails });
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      const data = requestData[0];
      await (
        await this.logger.customPayment(
          data?.id || "UNKNOWN",
          "Failed To Create/Update Payment",
          data?.id ? "PAYMENT_UPDATE_ERROR" : "PAMYNET_CREATE_ERROR",
          { requestData, error, message: error.message },
          this.request.user || {}
        )
      ).save();
      return {
        status: "error",
        message: "Unable to create payment data",
      };
    }
    console.log("Successfully updated payment details....");
    return {
      status: "success",
      data: response,
    };
  }

  async createBulkPaymentsLink(limit: any, dueMonth: string) {
    // var currentMonth = date.format(new Date(), "YYYY-MM") + '%';
    usersLogger.info('due month: ' + dueMonth + ' limit: ' + limit);
    var installmentsWithoutLinks = await getRepository(Transactions)
      .createQueryBuilder("transactions")
      .where("((transactions.paymentLink is null or transactions.paymentLink = '') and (transactions.transactionId is null or transactions.transactionId = '')) and transactions.dueDate like :dueMonth and transactions.status = :status", { dueMonth: dueMonth, status: PAYMENT_STATUS.PENDING })
      .limit(limit).getMany();
    usersLogger.info('installments without links: ' + installmentsWithoutLinks.length);

    await this.createPaymentLinkForSpecificInstallments(installmentsWithoutLinks);
    return {
      status: "success",
      message:
        "Payment links processed for count: " + installmentsWithoutLinks.length,
    };
  }

  async createPaymentLinkForSpecificInstallments(
    installmentsWithoutLinks: any
  ) {
    var failureCount = 0;
    var successCount = 0;
    var installmentsForUpdate: Transactions[] = [];
    for (let installment of installmentsWithoutLinks) {
      var paymentResponse = await this.createPaymentLink(installment);
      if (
        isNullOrUndefined(paymentResponse) ||
        isNullOrUndefined(paymentResponse.id) ||
        isNullOrUndefined(paymentResponse.short_url)
      ) {
        usersLogger.error(
          "Payment link generation failed for installment: " +
          installment.id +
          "payment response: " +
          JSON.stringify(paymentResponse)
        );
        failureCount++;
      } else {
        //update installment data
        installment.transactionId = paymentResponse.id;
        installment.paymentLink = paymentResponse.short_url;
        installment.updated_at = moment().format("YYYY-MM-DD HH:mm:ss");
        // paid date is set to null since installment status is pending
        installment.paidDate = null;
        installmentsForUpdate.push(installment);
        successCount++;
      }
    }
    usersLogger.info(
      "Payment link generation success count: " +
      successCount +
      "failure count: " +
      failureCount
    );
    return await this.updateInstallmentData(installmentsForUpdate);
  }

  async regeneratePaymentLink(request: any) {
    this.installmentService.request = this.request;
    if (isNullOrUndefined(request.installmentId)) {
      usersLogger.debug(
        "No installment id available for regenerating payment link"
      );
      return {
        status: "error",
        message: "No installment id available for regenerating payment link",
      };
    }
    var installment = await this.transactionRepository.findOne({
      id: request.installmentId,
    });
    if (isNullOrUndefined(installment)) {
      usersLogger.debug("No installment available for the given id");
      return {
        status: "error",
        message: "No installment available for the given id",
      };
    }

    // update payment status of current transaction for real time data, if the current status is PENDING
    let paymentStatus = installment.status;
    usersLogger.info("current payment status: " + paymentStatus);
    if (
      paymentStatus == PAYMENT_STATUS.PENDING &&
      !isNullOrUndefined(installment.transactionId)
    ) {
      paymentStatus = await this.installmentService.updateInstallmentStatus(
        installment.transactionId
      );
    }
    usersLogger.info("updated payment status: " + paymentStatus);

    if (paymentStatus == PAYMENT_STATUS.PAID) {
      usersLogger.info("Installment status is paid for the given id");
      return {
        status: "error",
        message: "Installment status is paid for the given id",
      };
    }

    //cancel existing payment link
    var cancelExistingLinkResponse =
      await this.razorPayUtils.cancelRazorPayLink(installment.transactionId);
    if (
      !isNullOrUndefined(cancelExistingLinkResponse) &&
      !isNullOrUndefined(cancelExistingLinkResponse.status) &&
      cancelExistingLinkResponse.status == "cancelled"
    ) {
      usersLogger.info(
        "Existing payment link cancelled for id: " +
        installment.transactionId +
        " link: " +
        installment.paymentLink
      );
    }

    //regenerate new payment link
    var paymentResponse = await this.createPaymentLink(installment);
    if (
      isNullOrUndefined(paymentResponse) ||
      isNullOrUndefined(paymentResponse.id) ||
      isNullOrUndefined(paymentResponse.short_url)
    ) {
      usersLogger.error(
        "Payment link generation failed for installment: " +
        installment.id +
        "payment response: " +
        JSON.stringify(paymentResponse)
      );
      return {
        status: "error",
        message: "Razor pay response: " + paymentResponse,
      };
    } else {
      var installmentsForUpdate: Transactions[] = [];
      installment.transactionId = paymentResponse.id;
      installment.paymentLink = paymentResponse.short_url;
      // paid date is set to null since installment status is pending
      installment.paidDate = null;
      installment.updated_at = moment().format("YYYY-MM-DD HH:mm:ss");
      installmentsForUpdate.push(installment);
      await this.updateInstallmentData(installmentsForUpdate);
      return {
        status: "success",
        message: "Payment link regenerated for installment id",
        paymentId: paymentResponse.id,
        paymentLink: paymentResponse.short_url,
      };
    }
  }

  async resetExpiredPayments(request: any) {
    const result = {
      error: 0,
      expired: 0,
    };
    const where = {};
    const limit = request?.limit || 100;
    if (request?.fromDate) {
      var fromDate = moment(request.fromDate, "YYYY-MM-DD").set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toDate();
      usersLogger.info('from date: ' + fromDate);
      where["dueDate"] = MoreThanDate(fromDate);
    }
    if (request?.toDate) {
      var toDate = moment(request.toDate, "YYYY-MM-DD").set({ hour: 23, minute: 59, second: 59, millisecond: 0 }).toDate();
      usersLogger.info('to date: ' + toDate);
      where["dueDate"] = LessThanDate(toDate);
    }
    var now = moment().toDate();
    usersLogger.info('now: ' + now);
    where["expireBy"] = LessThanDate(now);
    where["status"] = PAYMENT_STATUS.PENDING;
    where["transactionId"] = Like("plink_%");

    usersLogger.info("where: " + JSON.stringify(where));
    var expiryInstallments = await this.transactionRepository.find({
      where,
      take: limit,
    });
    if (isNullOrUndefined(expiryInstallments)) {
      usersLogger.info("No installment available for the given conditions");
      return {
        status: "success",
        message: "No installment available for the given conditions",
      };
    }

    usersLogger.info("expiry installments: " + expiryInstallments?.length);
    for (const installment of expiryInstallments) {
      try {
        // check if the given link is expired or not
        usersLogger.debug("current payment id: " + installment.transactionId);
        const paymentLinkDetails: RazorpayPayment = await getRazorpayPaymentById(
          installment.transactionId
        );
        usersLogger.info('Fetch payment link id: ' + installment.transactionId + ' response: ' + JSON.stringify(paymentLinkDetails));
        if (paymentLinkDetails.status === "expired") {
          usersLogger.info("expired payment id: " + installment.id);
          let data: any = {
            // status: EXPIRED,
            transactionId: null,
            paymentLink: null,
            lastCheckedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
            updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
          };
          await this.installmentService.updateInstallment(installment.id, data);
          result.expired++;
        }
      }
      catch (error) {
        usersLogger.error('Error in fetching payment record: ' + JSON.stringify(error));
        result.error++;
      }
    }
    usersLogger.info("Result of expiry installments processing: " + JSON.stringify(result));
    return result;
  }

  createPaymentLink = async (installment: any) => {
    if (isNullOrUndefined(installment)) {
      usersLogger.debug("No installment available for generating payment link");
      return {
        status: "error",
        message: "No installment available for generating payment link",
      };
    }

    usersLogger.info(
      "Generating payment link for installment id: " + installment.id
    );
    var user = await getManager()
      .createQueryBuilder(User, "user")
      .where("user.id = :id", { id: installment.studentId })
      .getOne();
    if (isNullOrUndefined(user)) {
      usersLogger.debug(
        "No user available for the given id: {0}" + installment.studentId
      );
      return {
        status: "error",
        message: "No user available for the given id",
      };
    }
    usersLogger.debug("User: " + JSON.stringify(user));

    return await this.razorPayUtils.createRazorPayLink(installment, user);
  };

  async updateInstallmentData(installmentsWithoutLinks: Transactions[]) {
    usersLogger.info(
      "installments without links for update: " +
      installmentsWithoutLinks.length
    );
    try {
      for (let installment of installmentsWithoutLinks) {
        const oldTransaction = await this.transactionRepository.findOne({
          id: installment.id,
        });
        await this.transactionRepository.update(
          { id: installment.id },
          installment
        );
        const newData = {
          transaction: installment,
        };

        const oldData = {
          transaction: oldTransaction,
        };

        await (
          await this.logger.payment(oldData, newData, this.request.user || {})
        ).save();
      }
    } catch (error) {
      usersLogger.error(
        "Error in saving payment links: " + JSON.stringify(error)
      );
    }
    return;
  }

  async uploadNetBankingResource(body: any) {
    try {
      const installment = await this.transactionRepository.findOne({
        id: body.id,
      });
      const transactionDetail = await this.transaDetailsRepository.findOne({
        transactionId: body.id,
      });
      installment.netbankRefLink = body.netbankRefLink;
      installment.paidDate = body.paidDate;
      installment.status = body.status;
      installment.paidAmount = body.paidAmount;
      transactionDetail.paymentMode = body.paymentMode;
      if (body.transactionId) {
        installment.transactionId = body.transactionId;
      }
      await this.transactionRepository.update(
        { id: installment.id },
        installment,
      );
      await this.transaDetailsRepository.update(
        { transactionId: installment.id },
        transactionDetail,
      );
      return {
        success: true,
        msg: "successfully updated link",
      };
    } catch (error) { }
  }

  async fetchAutoDebitDetails(request: any) {
    try {
        // pre validations
        usersLogger.debug("installment id: " + request.installmentId);
        if(isNullOrUndefined(request.installmentId)){
          usersLogger.info("Installment id is missing for fetching subscription details");
          return {
            status: "error",
            message: "Installment id is missing for fetching subscription details",
          };    
        }
        const installment = await this.transactionRepository.findOne({
          where: { id: request.installmentId, subscriptionType: SUBSCRIPTION_TYPE.AUTO_DEBIT },
        });
        if(isNullOrUndefined(installment)){
          usersLogger.info("Auto-Debit installment not found for given id: " + request.installmentId);
          return {
            status: "error",
            message: "Auto-Debit installment not found for given id: " + request.installmentId
          };    
        }

        const cashFreeResponse: any = await this.cashFreeUtils.fetchSubscriptionDetails(installment.subscriptionId);
        if(isNullOrUndefined(cashFreeResponse)){
          usersLogger.error("Error in fetching subscription details for id : " + request.installmentId);
          return {
            status: "error",
            message: null
          };    
        }
        else{
          // usersLogger.info('Fetch subscription record for id: ' + installment.subscriptionId + ' response: ' + JSON.stringify(cashFreeResponse));
          return {
            status: "success",
            message: cashFreeResponse.payments
          };      
        }
    }
    catch (error) {
        usersLogger.error('Error in fetching subscription details: ' + JSON.stringify(error));
        return {
          status: "error",
          message: "Error in fetching subscription details"
        };    
    }
  }

  async updateAutoDebitStatus(request: any) {
    try {
        // fetch payments for the given id
        let paymentResponse = await this.fetchAutoDebitDetails(request);
        if(paymentResponse.status == 'success'){
          if(!isNullOrUndefined(paymentResponse.message)){
            const currentMonth = moment().format("YYYY-MM");
            const installment = await this.transactionRepository.findOne({
              where: { id: request.installmentId, subscriptionType: SUBSCRIPTION_TYPE.AUTO_DEBIT },
            });    
            var payments : any = paymentResponse.message;
            for (const payment of payments) {
              usersLogger.debug('pay: '+ JSON.stringify(payment));
              if(payment['addedOn'].includes(currentMonth) && payment['status'] == CASHFREE_PAYMENT_STATUS.SUCCESS && payment['amount'] == installment.emiAmount){
                let data:any = {
                  status: PAYMENT_STATUS.PAID,
                  paidAmount: payment['amount'],
                  paidDate: payment['addedOn'],
                  updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                  lastCheckedAt: moment().format("YYYY-MM-DD HH:mm:ss")
                };

                usersLogger.info('data for update: '+ JSON.stringify(data));
                await this.installmentService.updateInstallment(installment.id, data);  
                break;
              }
            }
          }
          return {
            status: "success",
            message: "Updated auto debit status"
          };                
        }
        else{
          return paymentResponse;
        }
    }
    catch(error){
      usersLogger.error('Error in fetching subscription details: ' + error);
      return {
        status: "error",
        message: "Error in updating auto debit status"
      };    
    }
  }

}

export const LessThanDate = (date: Date) => LessThan(format(date, 'YYYY-MM-DD HH:mm:ss'))
export const MoreThanDate = (date: Date) => MoreThan(format(date, 'YYYY-MM-DD HH:mm:ss'))

