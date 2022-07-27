import { getConnection, getManager, getRepository, LessThan, Like, MoreThan, Not, IsNull as typeormIsNull, In } from "typeorm";
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
import {
  CASHFREE_PAYMENT_STATUS,
  PAYMENT_MODE,
  PAYMENT_STATUS,
  SUBSCRIPTION_TYPE,
  RAZORPAY_PAYMENT_STATUS,
  ERROR_CODES,
  SUCCESS_CODES,
} from "../helpers/Constants";
import { RazorPayUtils } from "../utils/payment/RazorPayUtils";
import { InstallmentService } from "./InstallmentService";
import { fail } from "assert";
import LoggerService from "./LoggerService";
import { format } from "date-and-time";
const moment = require("moment");
import {
  getPaymentById as getRazorpayPaymentById,
  getInstallmentPaymentById as getRazorpayInstallmentPaymentById,
  Payment as RazorpayPayment,
} from "../services/RazorpayService";
import { CashFreeUtils } from "../utils/payment/CashFreeUtils";

export class PaymentService {
  private transactionRepository = getRepository(Transactions);
  private transaDetailsRepository = getRepository(TransactionDetails);
  private paymentModeDetails = getRepository(PaymentModeDetails);
  private collectionAgent = getRepository(CollectionAgent);
  private studentRepository = getRepository(Student);
  private paymentRepository = getRepository(Payment);
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
              `transactions.subscription_id = '${parameters[param]}'`
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
              `tDetails.paymentMode = '${parameters[param]}'`
            );
            break;
          case "transaction_details_id":
            whereCondition.push(
              `tDetails.transaction_details_id = '${parameters[param]}'`
            );
            break;
          case "subscriptionType":
            whereCondition.push(
              `transactions.subscription_type = '${parameters[param]}'`
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
        view.subscriptionType = record.transactions_subscription_type;
        view.discount = record.transactions_early_bird;
        view.expireBy = record.transactions_expire_by;

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
        transaction.discount = data.discount;
        transaction.expireBy = data.expireBy;
        //subscription id for auto debit
        transaction.subscriptionId = data.subscriptionId;
        transaction.subscriptionType = data.subscriptionType;

        if (!data.id) {
          const dueDateFormatYear = moment(data.dueDate).format("YYYY");
          const dueDateFormatMonth = moment(data.dueDate).format("MM");
          var validateDueDate = await getManager()
            .createQueryBuilder(Transactions, "installments")
            .where(
              ` installments.studentId= :id and (MONTH(installments.due_date) = ${dueDateFormatMonth}  and YEAR(installments.due_date) = ${dueDateFormatYear})`,
              { id: data.studentId }
            )
            .getCount();
          if (validateDueDate >= 1) {
            return {
              status: "error",
              message: "Duplicate entry for choosen student",
            };
          }
        }

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
    usersLogger.info("due month: " + dueMonth + " limit: " + limit);
    var installmentsWithoutLinks = await getRepository(Transactions)
      .createQueryBuilder("transactions")
      .where(
        "((transactions.paymentLink is null or transactions.paymentLink = '') and (transactions.transactionId is null or transactions.transactionId = '')) and transactions.dueDate like :dueMonth and transactions.status = :status",
        { dueMonth: dueMonth, status: PAYMENT_STATUS.PENDING }
      )
      .limit(limit)
      .getMany();
    usersLogger.info(
      "installments without links: " + installmentsWithoutLinks.length
    );

    await this.createPaymentLinkForSpecificInstallments(
      installmentsWithoutLinks
    );
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
      var fromDate = moment(request.fromDate, "YYYY-MM-DD")
        .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
        .toDate();
      usersLogger.info("from date: " + fromDate);
      where["dueDate"] = MoreThanDate(fromDate);
    }
    if (request?.toDate) {
      var toDate = moment(request.toDate, "YYYY-MM-DD")
        .set({ hour: 23, minute: 59, second: 59, millisecond: 0 })
        .toDate();
      usersLogger.info("to date: " + toDate);
      where["dueDate"] = LessThanDate(toDate);
    }
    var now = moment().toDate();
    usersLogger.info("now: " + now);
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
        const paymentLinkDetails: RazorpayPayment =
          await getRazorpayPaymentById(installment.transactionId);
        usersLogger.info(
          "Fetch payment link id: " +
            installment.transactionId +
            " response: " +
            JSON.stringify(paymentLinkDetails)
        );
        if (paymentLinkDetails.status === "expired") {
          usersLogger.info("expired payment id: " + installment.id);
          let data: any = {
            // status: EXPIRED,
            transactionId: null,
            paymentLink: null,
            lastCheckedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
            updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
          };
          await this.installmentService.updateInstallment(installment.id, data);
          result.expired++;
        }
      } catch (error) {
        usersLogger.error(
          "Error in fetching payment record: " + JSON.stringify(error)
        );
        result.error++;
      }
    }
    usersLogger.info(
      "Result of expiry installments processing: " + JSON.stringify(result)
    );
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
        const transactionDetail = await this.transaDetailsRepository.findOne({
          transactionId: installment.id,
        });
        if (transactionDetail.paymentMode != PAYMENT_MODE.RAZORPAY) {
          transactionDetail.paymentMode = PAYMENT_MODE.RAZORPAY;
          await this.transaDetailsRepository.update(
            { transactionId: installment.id },
            transactionDetail
          );
        }
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
        installment
      );
      await this.transaDetailsRepository.update(
        { transactionId: installment.id },
        transactionDetail
      );
      return {
        success: true,
        msg: "successfully updated link",
      };
    } catch (error) {}
  }

  async fetchAutoDebitDetails(request: any) {
    try {
      // pre validations
      usersLogger.debug("installment id: " + request.installmentId);
      if (isNullOrUndefined(request.installmentId)) {
        usersLogger.info(
          "Installment id is missing for fetching subscription details"
        );
        return {
          status: "error",
          message:
            "Installment id is missing for fetching subscription details",
        };
      }
      const installment = await this.transactionRepository.findOne({
        where: {
          id: request.installmentId,
          subscriptionType: SUBSCRIPTION_TYPE.AUTO_DEBIT,
        },
      });
      if (isNullOrUndefined(installment)) {
        usersLogger.info(
          "Auto-Debit installment not found for given id: " +
            request.installmentId
        );
        return {
          status: "error",
          message:
            "Auto-Debit installment not found for given id: " +
            request.installmentId,
        };
      }

      const cashFreeResponse: any =
        await this.cashFreeUtils.fetchSubscriptionDetails(
          installment.subscriptionId
        );
      if (isNullOrUndefined(cashFreeResponse)) {
        usersLogger.error(
          "Error in fetching subscription details for id : " +
            request.installmentId
        );
        return {
          status: "error",
          message: null,
        };
      } else {
        // usersLogger.info('Fetch subscription record for id: ' + installment.subscriptionId + ' response: ' + JSON.stringify(cashFreeResponse));
        return {
          status: "success",
          message: cashFreeResponse.payments,
        };
      }
    } catch (error) {
      usersLogger.error(
        "Error in fetching subscription details: " + JSON.stringify(error)
      );
      return {
        status: "error",
        message: "Error in fetching subscription details",
      };
    }
  }

  async fetchAutoDebitInstallments(params: any) {
    try {
      var limit = 100;
      const where = {};
      if (params?.installmentId) {
        where["id"] = params.installmentId;
      } else {
        where["subscriptionType"] = Like(SUBSCRIPTION_TYPE.AUTO_DEBIT);
        where["status"] != PAYMENT_STATUS.PAID;
      }

      if (params?.limit) {
        limit = params.limit;
      }

      if (params?.lastCheckedMinutesDifference) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - params.lastCheckedMinutesDifference);
        now.setSeconds(0);
        usersLogger.debug("Date for last checked: " + now);
        where["lastCheckedAt"] = LessThanDate(now);
      }

      if (params?.dueMonth) {
        where["dueDate"] = Like(params.dueMonth + "%");
      }
      usersLogger.info("where: " + JSON.stringify(where));

      return await this.transactionRepository.find({
        where,
        take: limit,
      });
    } catch (error) {
      usersLogger.error(
        "Error in fetching subscription details: " + JSON.stringify(error)
      );
      return [];
    }
  }

  async updateAutoDebitStatus(request: any) {
    try {
      const result = {
        error: 0,
        paid: 0,
        failed: 0,
      };
      // fetch auto debit payments
      let autoDebitInstallments = await this.fetchAutoDebitInstallments(
        request
      );
      for (let installment of autoDebitInstallments) {
        const cashFreeResponse: any =
          await this.cashFreeUtils.fetchSubscriptionDetails(
            installment.subscriptionId
          );
        if (isNullOrUndefined(cashFreeResponse)) {
          usersLogger.error(
            "Error in fetching subscription details for id : " +
              request.installmentId
          );
          result.error++;
        } else {
          if (!isNullOrUndefined(cashFreeResponse.payments)) {
            const dueMonth = moment(installment.dueDate).format("YYYY-MM");
            var payments: any = cashFreeResponse.payments;
            for (const payment of payments) {
              usersLogger.debug("pay: " + JSON.stringify(payment));
              if (
                payment["addedOn"].includes(dueMonth) &&
                payment["status"] == CASHFREE_PAYMENT_STATUS.SUCCESS &&
                payment["amount"] == installment.emiAmount
              ) {
                let data: any = {
                  status: PAYMENT_STATUS.PAID,
                  paidAmount: payment["amount"],
                  paidDate: payment["addedOn"],
                  updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                  lastCheckedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
                };

                usersLogger.info("data for update: " + JSON.stringify(data));
                await this.installmentService.updateInstallment(
                  installment.id,
                  data
                );
                result.paid++;
                break;
              } else if (
                payment["addedOn"].includes(dueMonth) &&
                payment["status"] == CASHFREE_PAYMENT_STATUS.FAILED
              ) {
                let data: any = {
                  status: PAYMENT_STATUS.FAILED,
                  updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                  lastCheckedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
                };
                usersLogger.info("data for update: " + JSON.stringify(data));
                await this.installmentService.updateInstallment(
                  installment.id,
                  data
                );
                result.failed++;
                break;
              }
            }
          }
        }
      }
      return {
        status: "success",
        message: result,
      };
    } catch (error) {
      usersLogger.error("Error in fetching subscription details: " + error);
      return {
        status: "error",
        message: "Error in updating auto debit status",
      };
    }
  }

  async updatePayment(data: any, message?: string, code?: string) {
    let result = null
    try {
      result = await this.paymentRepository.save(data);
      await(
        await this.logger.customPayment(
          data.id,
          "SUCCESS: " + (message || "Update User Payment"),
          code || SUCCESS_CODES.SUCCESS_UPDATED_PAYMENT,
          {
            requestData: data,
          },
          this.request?.user,
          data.id
        )
      ).save();
      return result;
    } catch (e) {
      console.log(e);
      await(
        await this.logger.customPayment(
          data.id,
          "ERROR: " + (message || "Update User Payment"),
          code.replace("SUCCESS", "ERROR") || ERROR_CODES.ERROR_UPDATED_PAYMENT,
          {
            requestData: data,
          },
          this.request?.user,
          data.studentId
        )
      ).save();
    }

    return result
  }

  async fetchNotVerifiedDownPayments(params: any) {
    const where: any = {
      is_down_payment_verified: Not(1),
      paymentMode: In([
        PAYMENT_MODE.DOWNPAYMENT_RAZORPAY,
        PAYMENT_MODE.DOWNPAYMENT_CASHFREE,
      ]),
      paymentid: Not(typeormIsNull()),
      downpayment: MoreThan(0),
    };

    if (params.id) {
      where.id = params.id;
    }

    let result = await this.paymentRepository.find({
      where,
    });
    return result;
  }

  async verifyDownPayment(request: any) {
    try {
      const result: any = {
        error: 0,
        paid: 0,
      };

      // fetch dwon payment payments
      const downPayments = await this.fetchNotVerifiedDownPayments(request);
      for (const downPayment of downPayments) {
        /**
         * force mark payment as payed
         */
        if (request.force) {
          let data: any = {
            is_down_payment_verified: 1,
            is_down_payment_auto_verified: !request.force,
            id: downPayment.id,
          };
          const updatedPayment = await this.updatePayment(
            data,
            "Verified razorpay down payment",
            SUCCESS_CODES.SUCCESS_DOWN_PAYMENT_VERIFICATION
          );
          if (!updatedPayment) {
            throw new Error("Error in updating payment");
          }
          usersLogger.info(
            "update down payment to paid: " + JSON.stringify(data)
          );
          result.paid++;
          continue
        }

        /**
         * wait 100 millisecond between each attempt
         */
        await new Promise((resolve) => setTimeout(resolve, 100));

        /**
         * handle razorpay payments
         */
        if (downPayment.paymentMode === PAYMENT_MODE.DOWNPAYMENT_RAZORPAY) {
          let paymentId = downPayment.paymentid;
          if (!paymentId.split("_")[1]) {
            paymentId = `pay_${paymentId}`;
          }

          let paymentDetails;

          try {
            paymentDetails = await getRazorpayInstallmentPaymentById(
              paymentId
            );

            if (
              paymentDetails.status === RAZORPAY_PAYMENT_STATUS.SUCCESS &&
              paymentDetails.amount / 100 == downPayment.downpayment
            ) {
              let data: any = {
                is_down_payment_verified: 1,
                is_down_payment_auto_verified: !request.force,
                id: downPayment.id,
              };
              const updatedPayment = await this.updatePayment(
                data,
                "Verified razorpay down payment",
                SUCCESS_CODES.SUCCESS_DOWN_PAYMENT_VERIFICATION
              );
              if (!updatedPayment) {
                throw new Error("Error in updating payment");
              }
              usersLogger.info(
                "update down payment to paid: " + JSON.stringify(data)
              );
              result.paid++;
            }
          } catch (e) {
            console.log(e);
            await(
              await this.logger.customPayment(
                downPayment.id,
                "Failed To Update Down Payment Status",
                ERROR_CODES.ERROR_DOWN_PAYMENT_VERIFICATION,
                {
                  requestData: request,
                  error: e,
                  message: e.message,
                  razorpayPaymentDetails: paymentDetails,
                },
                this.request?.user,
                downPayment.id
              )
            ).save();
            usersLogger.error("Error in updating down payments: " + e);
            result.error++;
            continue;
          }

          continue;
        }
        
        /**
         * handle cashfree payments
         */
        if (downPayment.paymentMode === PAYMENT_MODE.DOWNPAYMENT_CASHFREE) {
          let paymentDetails;
          try {
            paymentDetails = await this.cashFreeUtils.fetchSubscriptionDetails(
              downPayment.paymentid
            );
            
            const checkPaymentDetails = paymentDetails?.payments ? paymentDetails?.payments[0] : null;

            if (!checkPaymentDetails) {
              throw new Error(`Payment Not Found: ${downPayment.paymentid}`);
            }

            let updatedPayment = false;

            for (const downPaymentDetails of paymentDetails) {
              if (
                downPaymentDetails.status === CASHFREE_PAYMENT_STATUS.SUCCESS &&
                downPaymentDetails.amount == downPayment.downpayment
              ) {
                let data: any = {
                  is_down_payment_verified: 1,
                  is_down_payment_auto_verified: !request.force,
                  id: downPayment.id,
                };

                updatedPayment = await this.updatePayment(
                  data,
                  "Verified cashfree down payment",
                  SUCCESS_CODES.SUCCESS_DOWN_PAYMENT_VERIFICATION
                );

                usersLogger.info(
                  "update down payment to paid: " +
                    JSON.stringify(data)
                );
                result.paid++;
              }
            }

            if (!updatedPayment) {
              throw new Error("Error in updating payment");
            }
          } catch (e) {
            console.log(e);
            await(
              await this.logger.customPayment(
                downPayment.id,
                "Failed To Update Down Payment Status",
                ERROR_CODES.ERROR_DOWN_PAYMENT_VERIFICATION,
                {
                  requestData: request,
                  error: e,
                  message: e.message,
                  cashfreePayments: paymentDetails,
                  downPayment,
                },
                this.request?.user,
                downPayment.id
              )
            ).save();
            usersLogger.error("Error in updating down payments: " + e);
            result.error++;
            continue;
          }

          continue;
        }
      }
      return {
        status: "success",
        message: result,
      };
    } catch (error) {
      console.log(error);
      await(
        await this.logger.customPayment(
          "UNKNOWN",
          "Failed To Update Down Payment Status",
          ERROR_CODES.ERROR_DOWN_PAYMENT_VERIFICATION,
          { requestData: request, error, message: error.message },
          this.request?.user
        )
      ).save();
      usersLogger.error("Error in fetching down payments: " + error);
      return {
        status: "error",
        message: "Error in updating down payment status",
      };
    }
  }
}

export const LessThanDate = (date: Date) => LessThan(format(date, 'YYYY-MM-DD HH:mm:ss'))
export const MoreThanDate = (date: Date) => MoreThan(format(date, 'YYYY-MM-DD HH:mm:ss'))

