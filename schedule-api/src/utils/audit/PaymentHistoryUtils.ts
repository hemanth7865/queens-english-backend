import { Payment } from "../../entity/Payment";
var jsonDiff = require('json-diff');

const paymentAudit = async (
  oldRecord: Payment,
  newRecord: Payment,
  user: any
): Promise<object> => {
  //let excludeKeyList = ["is_down_payment_auto_verified","is_down_payment_verified","forceRazorpayMoveSAV"];
  let title = "Updated ";
  let updatedData = jsonDiff.diff(oldRecord,newRecord);
  // excludeKeyList.forEach(excludeKey=> {
  //   delete updatedData[excludeKey];
  // });
  for(var key in updatedData){
    title = title + key + ", "; 
  }
  return {
    debug: { oldRecord, newRecord, updatedData, user },
    title: title,
    event: "PAYMENT_UPDATE"
  };
};

export default paymentAudit;
