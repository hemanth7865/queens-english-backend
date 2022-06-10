import { getRepository } from "typeorm";
import { Transactions } from "../entity/Transaction";
import { Constants } from "./../helpers/Constants";

export class InstallmentService {
  private installmentStatus = Constants.AUTO_UPDATE_INSTALLMENT_STATUS;

  private query = getRepository(Transactions);

  async getPendingInstallments(params) {
    const where = { status: this.installmentStatus };
    if (params?.installment_id) {
      where["id"] = params.installment_id;
    }
    return await this.query.find({
      where,
      take: 10,
    });
  }

  async updateInstallment(id, data) {
    return await this.query.update(id, data);
  }
}
