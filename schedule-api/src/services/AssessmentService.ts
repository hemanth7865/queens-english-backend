import { getConnection, getRepository, LessThanOrEqual } from "typeorm";
import { StudentAssessment } from "../entity/StudentAssessment";

export class AssessmentService {
  private assessmentRepository = getRepository(StudentAssessment);

  AssessmentService() { }

  async getBatchAssessments(id: string, request) {
    var { overdue, dayOffset } = request.query;
    var condition = {};
    if (overdue == "1") {
      condition = {
        where: { due_date: LessThanOrEqual(this.addDays(parseInt(dayOffset))) },
      };
    } else {
      condition = {
        where: { batch_id: id },
      };
    }
    return await this.assessmentRepository.find(condition);
  }

  async getAssessments(request) {
    var { overdue, dayOffset } = request.query;
    var condition = {};
    if (overdue == "1") {
      condition = {
        where: { due_date: LessThanOrEqual(this.addDays(parseInt(dayOffset))) },
      };
    }
    return await this.assessmentRepository.find(condition);
  }

  async updateAssessment(id: number, data: any) {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();

    var assessment = new StudentAssessment();
    try {
      assessment.id = id;
      assessment.assessment_id = data.assessment_id;
      assessment.batch_id = data.batch_id;
      assessment.teacher_id = data.teacher_id;
      assessment.due_date = data.due_date;
      assessment.assessment_date = data.assessment_date;
      assessment.score = data.score;

      assessment.updated_at = Math.floor(Date.now() / 1000);
      await queryRunner.manager.update(
        StudentAssessment,
        assessment.id,
        assessment
      );
    } catch (error) {
      console.error(error);
      throw new Error("Issue updating assessment for the batch and lesson");
    } finally {
      await queryRunner.release();
    }
    return { success: true };
  }

  addDays(days: number) {
    var result = new Date();
    result.setDate(result.getDate() + days);
    return result;
  }

  async getAssessmentDetail(id: number) {
    return await this.assessmentRepository.findOne(id, {
      relations: ["assessment", "teacher"],
    });
  }
}
