import { getRepository, LessThan, MoreThan, Not, In, Transaction, getConnection, TransactionRepository, getManager } from "typeorm";
import { Transactions } from "../entity/Transaction";
import { TransactionDetails } from "../entity/TransactionDetails";
import { PaymentModeDetails } from "../entity/PaymentModeDetails";
import { PaymentsView } from "../model/PaymentView";
const { usersLogger } = require("../Logger.js");
const date = require('date-and-time');


export class PaymentService {

  private transactionRepository = getRepository(Transactions);
  private transaDetailsRepository = getRepository(TransactionDetails);
  private paymentModeDetails = getRepository(PaymentModeDetails);


  /**
   * Student Payment Service 
   */

  async studentPaymentDetails(parameters: any){
    var paymentView: PaymentsView[] = [];
    var transactions : Transactions[] = []
    let response = {}
    usersLogger.info('Student Service payment Details ::Start');
    let t ;
    if (parameters.studentId){
    t = await this.transactionRepository.find({studentId:parameters.studentId});
    } else {
      t = await getManager()
          .createQueryBuilder(Transactions, "transactions").offset(parameters.current).limit(parameters.pageSize).getMany();
    }
    for ( let transaction of t) {
      var view = new PaymentsView();
      view.id=transaction.id;
      view.studentId=transaction.studentId;
      view.dueDate=transaction.dueDate;
      view.paidDate=transaction.paidDate;
      view.emiAmount=transaction.emiAmount;
      view.paidAmount=transaction.paidAmount;
      view.status=transaction.status;
      view.created_at=transaction.created_at;
      view.updated_at=transaction.updated_at;

      const td = await this.transaDetailsRepository.findOne({transactionId:transaction["transactionId"]});
      
      view.transaction_details_id = td.id;
      view.transactionId=td.transactionId;
      view.razorpayLink=td.razorpayLink;
      view.status=td.status;
      view.whatsAppLinkSent=td.whatsAppLinkSent
      view.modeOfPayment=td.modeOfPayment;
      view.callDisposition=td.callDisposition;
      view.feedBackCall=td.feedBackCall;
      view.paymentMode=td.paymentMode;
      view.created_at=td.created_at;
      view.updated_at=td.updated_at;

     paymentView.push(view);
    }
  
    usersLogger.info('Fetching student payment details::End');

    return {
      success:true,
      data:paymentView,
      status:200
    }
  }

  async paymentDetails(requestData:any) {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    usersLogger.info('Save payment Details::Start');
    usersLogger.info(`Request data ${JSON.stringify(data)}`);
  
    let response = [];
try{

  for (var data of requestData)
  var transaction = new Transactions();
    if (data.id) {
       transaction.id = data.id;
       transaction.updated_at=new Date();
    } else {
      transaction.created_at=new Date();
      transaction.updated_at=new Date();
    }
       transaction.studentId=data.studentId
       transaction.dueDate=data.dueDate;
       transaction.paidDate=data.paidDate;
       transaction.emiAmount=data.emiAmount;
       transaction.paidAmount=data.paidAmount;
       transaction.status=data.status;
     
       var transactions = await this.transactionRepository.save(transaction);

       var transactiondetail = new TransactionDetails();
       if (data.transaction_details_id) {
        transactiondetail.id = data.transaction_details_id
        transactiondetail.updated_at=new Date();
       } else {
        transactiondetail.transactionId =  transactions.id;
        transactiondetail.created_at=new Date();
        transactiondetail.updated_at=new Date();
       }
      
       transactiondetail.razorpayLink=data.razorpayLink;
       transactiondetail.status=data.status;
       transactiondetail.whatsAppLinkSent=data.whatsAppLinkSent;
       transactiondetail.modeOfPayment=data.modeOfPayment;
       transactiondetail.callDisposition=data.callDisposition;
       transactiondetail.feedBackCall=data.feedBackCall;
       transactiondetail.paymentMode=data.paymentMode;
      
      
      let tdeails = await this.transaDetailsRepository.save(transactiondetail);
      response.push({...transactions ,...tdeails});
       await queryRunner.commitTransaction();
     } catch (error) {
       await queryRunner.rollbackTransaction();
       console.log(error);
       return {
         status:"error",
         message:"Unable to create payment data"
       }
    }
    console.log('Successfully updated payment details....');
    return {
      status:"success",
      data: response
    };
}


}