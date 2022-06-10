import { getManager } from "typeorm";

export class CollectionAgentService {
  async getAvailabileCollectionAgents() {
    var prmsData = await getManager().query(
      `SELECT SQL_NO_CACHE collection_agent.id, collection_agent.firstName, collection_agent.lastName, COUNT(student.id) as students FROM collection_agent LEFT JOIN student ON collection_agent.id = student.collection_agent_id AND student.status = 'active' group by collection_agent.id order by count(student.id) asc limit 1`
    );

    return prmsData;
  }
}
