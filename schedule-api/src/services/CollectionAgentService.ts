import { getManager, createQueryBuilder, getRepository } from "typeorm";
import { CollectionAgent } from "../entity/CollectionAgent";
const { logger } = require("../Logger.js");
import { generatePagiantionAndConditions } from "./../utils/helpers";
import { Transactions } from "./../entity/Transaction";
import { Student } from "./../entity/Student";

export class CollectionAgentService {
  public request: any = {};
  private installmentRepositroy = getRepository(Transactions);
  private studentRepository = getRepository(Student);

  async getAvailabileCollectionAgents() {
    var prmsData = await getManager().query(
      `SELECT SQL_NO_CACHE collection_agent.id, collection_agent.firstName, collection_agent.lastName, COUNT(student.id) as students FROM collection_agent LEFT JOIN student ON collection_agent.id = student.collection_agent_id AND student.status = 'active' group by collection_agent.id order by count(student.id) asc limit 1`
    );

    return prmsData;
  }

  async listCollectionAgents(
    parameters: { current?: string; pageSize?: string } = {}
  ): Promise<any> {
    try {
      const { current, limit, offsetRecords, condition } =
        generatePagiantionAndConditions(parameters);

      const query = await createQueryBuilder(
        CollectionAgent,
        "collection_agent"
      ).where(condition);

      const data: any = await query
        .offset(offsetRecords)
        .limit(limit)
        .getMany();
      const total = await query.getCount();

      for (const d in data) {
        data[d].installmentsCount = await createQueryBuilder(
          Transactions,
          "installment"
        )
          .where("installment.collection_agent = :id", { id: data[d].id })
          .getCount();
      }

      return {
        success: true,
        pageSize: limit,
        current,
        total,
        data,
        status: 200,
      };
    } catch (e) {
      logger.error(e);
      return { status: 400, message: e.message };
    }
  }

  async updateCollectionExpertsCSV(
    data: any,
    query: { test: boolean; clear: boolean } = { test: false, clear: false }
  ) {
    const primaryColumn = "installment_id";
    const subPrimaryColumn = "student_id";
    const agentName = "collection_agent_name";
    let result: any = {
      updated: 0,
      notFound: 0,
      errors: 0,
      notFoundCEs: [],
    };

    try {
      for (let d of data) {
        try {
          const primaryColumnExists = d[primaryColumn] || d[primaryColumn].length > 4;
          const subPrimaryColumnExists = d[subPrimaryColumn] || d[subPrimaryColumn].length > 4;
          if (!primaryColumnExists && !subPrimaryColumnExists) {
            continue;
          }

          let condition: {where: any} = {where: {}}

          if (primaryColumnExists) {
            condition = { where: { id: d[primaryColumn] } };
          } else {
            condition = { where: { studentId: d[subPrimaryColumn] } };
          }
          let installment = await this.installmentRepositroy.findOne(condition);

          if (!installment?.id) {
            result.notFound++;
            continue;
          }

          let ceQuery = `SELECT * from collection_agent where firstName='${d[agentName]}'`;

          let ce = await getManager().query(ceQuery);
          const CE = ce[0];

          if (CE?.id) {
            result.updated++;
            if (!query.test) {
              await this.installmentRepositroy.update(
                { id: installment.id },
                { collectionAgent: CE.id }
              );
            }
          } else {
            result.notFoundCEs.push({
              id: d[primaryColumn],
              subId: d[subPrimaryColumn],
            });
          }
        } catch (e) {
          console.log(e);
          result.errors++;
        }
      }
    } catch (e) {
      console.log(e, data);
    }

    return result;
  }
}
