import { getRepository, LessThan, MoreThan, Not, In, Transaction, TransactionRepository } from "typeorm";
import { User } from "../entity/User";
import { getManager } from "typeorm";
import axios from "axios";
import { Transactions } from "../entity/Transaction";
import { TransactionDetails } from "../entity/TransactionDetails";
import { PaymentModeDetails } from "../entity/PaymentModeDetails";
import { format } from "date-and-time";
import { randomFill } from "crypto";
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
    const t = await this.transactionRepository.find({studentId:parameters.studentId});
    console.log(t);
    for ( let transaction of t) {
      var view = new PaymentsView();
      view.id=transaction.id;   
      view.studentId=transaction.studentId;
      view.dueDate=transaction.dueDate;
      view.paidDate=transaction.paidDate
      view.emiAmount=transaction.emiAmount;
      view.paidAmount=transaction.paidAmount
      view.status=transaction.status;
      view.created_at=transaction.created_at;
      view.updated_at=transaction.updated_at;

      const td = await this.transaDetailsRepository.findOne({transactionId:transaction["transactionId"]});
      
      view.transaction_details_id = td.id;
      view.transactionId=td.transactionId;
      view.razorpayLink=td.razorpayLink;
      view.status=td.status;
      view.whatsAppLinkSent=td.whatsAppLinkSent
      view.modeOfPayment=td.modeOfPayment
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


}







