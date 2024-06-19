import { getRepository } from "typeorm";
import { Notes } from "../entity/Notes";
import { v4 as uuidV4 } from "uuid";
import { Events } from "../entity/Events";
import { logger } from "./../Logger.js";
import { OperationTypes } from "../types";
import { getEventCodeAndObserVation } from "../helpers";

export class NoteService {
  private notesRepository = getRepository(Notes);
  private eventsRepository = getRepository(Events);

  NoteService() {}

  async createNote(data: {
    schoolId: string;
    eventId?: string;
    note: string;
    message: string;
    userId: string | number;
    operation: OperationTypes;
  }) {
    try {
      const note = new Notes();
      note.id = uuidV4();
      if (!data.eventId) {
        const system_Generated_Event = await this.eventsRepository.findOne({
          where: { eventName: "System Generated" },
        });
        note.eventId = system_Generated_Event.id;
      } else {
        note.eventId = data.eventId;
      }
      const codeAndOperation = getEventCodeAndObserVation(data.operation);
      note.eventCode = codeAndOperation.code;
      note.operation = codeAndOperation.operation;
      note.schoolId = data.schoolId;
      note.note = data.note;
      note.createdAt = new Date();
      note.userId = String(data.userId);
      note.message = data.message;
      const res = await this.notesRepository.save(note);
      return res;
    } catch (error) {
      logger.error(`Create Note ERROR : ${JSON.stringify(error)}`);
      throw new Error(error.message || "Something went wrong.");
    }
  }
}
