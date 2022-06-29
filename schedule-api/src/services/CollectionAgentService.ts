import { getManager, createQueryBuilder } from "typeorm";
import { CollectionAgent } from "../entity/CollectionAgent";
const { logger } = require("../Logger.js");

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
      const current = parameters.current ? parseInt(parameters.current) : 0;
      const limit = parameters.pageSize ? parseInt(parameters.pageSize) : 0;
      const offsetRecords = (current - 1) * limit;

      const whereCondition: string[] = [];
      whereCondition.push(" 1 = 1 ");
      for (let param in parameters) {
        if (parameters[param].length < 1) {
          continue;
        }

        if (["current", "pageSize"].includes(param)) {
          continue;
        }
        if ([].includes(param)) {
          // custom operators
        } else {
          whereCondition.push(`${param} LIKE '%${parameters[param]}%'`);
        }
      }

      const condition =
        whereCondition.length > 1
          ? whereCondition.join(" and ")
          : whereCondition.toString();

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
