import { Not, getRepository, getManager } from "typeorm";
import { Student } from "../../entity/Student";
import { Classes } from "../../entity/Classes";
import { BatchStudent } from "../../entity/BatchStudent";
import { BatchService } from "./../../services/BatchService";
import { User } from "../../entity/User";
import { Status } from "../../helpers/Constants";
const { logger } = require("../../Logger.js");

export async function deactivateStudents(ids: string[]): Promise<any> {
  let result = {
    total: 0,
    success: 0,
    failed: 0,
  };

  const studentRepository = getRepository(Student);
  const userRepository = getRepository(User);
  const batchStudentRepository = getRepository(BatchStudent);

  result.total = ids.length;

  for (const id of ids) {
    try {
      /**
       * Get Student and batches assigned to that student
       */
      const student = await studentRepository.findOne({ id });

      if (!student) {
        throw new Error(`Student: ${id}, Not Found.`);
      }

      const batches: Classes[] = await getManager().query(
        `SELECT classes.* from batch_students INNER JOIN classes on classes.id = batch_students.batchId WHERE batch_students.studentId = '${student.id}'`
      );

      const batchService = new BatchService();

      for (let batch of batches) {
        await new Promise((resolve, result) => setTimeout(resolve, 100));

        const newBatch: any = batch;
        /**
         * Get other students assigned to that batch
         */
        const students = await batchStudentRepository.find({
          batchId: batch.id,
          studentId: Not(student.id),
        });

        newBatch.students = [];

        for (let s of students) {
          newBatch.students.push({ value: s.studentId });
        }

        newBatch.edit = true;

        await batchService.createBatch(newBatch);
      }

      if (batches.length > 0) {
        const confirmBatchesDeletion: Classes[] = await getManager().query(
          `SELECT classes.* from batch_students INNER JOIN classes on classes.id = batch_students.batchId WHERE batch_students.studentId = '${student.id}'`
        );

        if (confirmBatchesDeletion.length > 0) {
          throw new Error(
            `Skip Student ${id} Deactivation, Failed To Remove From Assigned Batches`
          );
        }
      }

      userRepository.update({ id }, { status: Status.INACTIVE });
      studentRepository.update({ id }, { status: Status.INACTIVE });

      result.success += 1;
    } catch (e) {
      logger.error("Faled to deactivate student: " + e.message);
      result.failed += 1;
      console.log(e);
    }
  }

  return result;
}
