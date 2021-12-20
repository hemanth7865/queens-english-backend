import { setegid } from "process";
import { getRepository, getConnection, Transaction } from "typeorm";
import { Attendance } from "../entity/Attendance";
import { Session } from "../entity/Session";

export class SessionService {
  private sessionRepository = getRepository(Session);
  private attendanceRepository = getRepository(Attendance);

  SessionService() {}

  async createSession(data: any) {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();

    var session = new Session();
    try {
      session.batchId = data.batchId;
      session.lessonId = data.lessonId;
      session.teacherId = data.teacherId;
      session.session_date = data.session_date;
      session.recording_url = data.recording_url;
      session.recorded = data.recorded;
      session.start_time = data.start_time;
      session.end_time = data.end_time;
      session.created_at = Math.floor(Date.now() / 1000);
      session.updated_at = Math.floor(Date.now() / 1000);
      await queryRunner.startTransaction();

      session = await queryRunner.manager.save(session);
      if (data.attendance) {
        for (const element of data.attendance) {
          let attendance = new Attendance();
          let { isPresent, studentId, start_time, end_time } = element;
          attendance.is_present = isPresent;
          attendance.studentId = studentId;
          attendance.start_time = start_time;
          attendance.end_time = end_time;
          attendance.sessionId = session.id;
          attendance.created_at = session.created_at;
          attendance.updated_at = session.created_at;
          await queryRunner.manager.save(attendance);
        }
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      if (error && error.code == "ER_DUP_ENTRY") {
        throw new Error("Existing Session for Batch and Lesson ");
      }
      throw new Error("Issue creating session for the batch and lesson");
    } finally {
      await queryRunner.release();
    }
    return await this.getSessionDetail(session.id);
  }

  async updateSession(id: number, data: any) {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();

    var session = new Session();
    var existingSession = await this.getSessionDetail(id);
    try {
      session.id = id;
      session.batchId = data.batchId;
      session.lessonId = data.lessonId;
      session.teacherId = data.teacherId;
      session.session_date = data.session_date;
      session.recording_url = data.recording_url;
      session.recorded = data.recorded;
      session.start_time = data.start_time;
      session.end_time = data.end_time;
      session.updated_at = Math.floor(Date.now() / 1000);
      await queryRunner.startTransaction();

      await queryRunner.manager.update(Session, session.id, session);
      if (data.attendances) {
        for (const element of data.attendances) {
          let attendance = new Attendance();
          let { id, is_present, studentId, start_time, end_time } = element;
          attendance.id = id;
          attendance.is_present = is_present;
          attendance.studentId = studentId;
          attendance.start_time = start_time;
          attendance.end_time = end_time;
          attendance.sessionId = session.id;
          attendance.created_at = existingSession.created_at;
          attendance.updated_at = session.updated_at;
          id == null
            ? await queryRunner.manager.save(attendance)
            : await queryRunner.manager.update(Attendance, attendance.id, attendance);
        }
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      if (error && error.code == "ER_DUP_ENTRY") {
        throw new Error("Existing Session for Batch and Lesson ");
      }
      throw new Error("Issue updating session for the batch and lesson");
    } finally {
      await queryRunner.release();
    }
    return await this.getSessionDetail(session.id);
  }

  async getBatchSessions(id: string) {
    return await this.sessionRepository.find({
      where: { batchId: id },
    });
  }

  async getBatchLessonSession(id: string, lessonId: string) {
    return await this.sessionRepository.findOne({
      where: { batchId: id, lessonId: lessonId },
      relations: ["attendances"],
    });
  }

  async getSessions() {
    return await this.sessionRepository.find();
  }
  async getSessionDetail(id: number) {
    return await this.sessionRepository.findOne(id, {
      relations: ["attendances"],
    });
  }
}
