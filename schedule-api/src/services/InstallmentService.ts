import { getRepository } from "typeorm";
import { Transactions } from "../entity/Transaction";
import { Constants } from "./../helpers/Constants";

export class InstallmentService {
  private installmentStatus = Constants.AUTO_UPDATE_INSTALLMENT_STATUS;

  private query = getRepository(Transactions);

  async getPendingInstallments() {
    return await this.query.find({
      where: { status: this.installmentStatus },
      take: 10,
    });
  }

  async updateInstallment(id, data) {
    return await this.query.update(id, data);
  }
}
