import { getManager, createQueryBuilder } from "typeorm";
import { CollectionAgent } from "../entity/CollectionAgent";
const { logger } = require("../Logger.js");
import { generatePagiantionAndConditions } from "./../utils/helpers";

export class CollectionAgentService {
  public request: any = {};

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
        data[d].studentsCount = await createQueryBuilder("student", "student")
          .where("student.collection_agent_id = :id", { id: data[d].id })
          .andWhere("student.status = 'active'")
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
}
