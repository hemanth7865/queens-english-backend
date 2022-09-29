import { Not, getRepository, getManager } from "typeorm";
import { Student } from "../../entity/Student";
import { Payment } from "../../entity/Payment";
import { User } from "../../entity/User";
import { Status } from "../../helpers/Constants";
import { validations } from "../../helpers/validations";
const { logger } = require("../../Logger.js");

export async function validateStudentStatus(): Promise<any> {
    const userRepository = getRepository(User);
    const studentRepository = getRepository(Student);
    const paymentRepository = getRepository(Payment);

    let ids = [];
    let total_updated = 0;
    let total_records = 0;

    //get the users with status error
    const errorStatus = await userRepository.find({
        where: { status: Status.ERROR },
    })

    for (const userDetails of errorStatus) {
        try {
            const user = new User();
            const student = new Student();
            const studentDetails = await studentRepository.findOne({ id: userDetails.id });
            const paymentDetails = await paymentRepository.findOne({ id: userDetails.id })

            user.firstName = userDetails.firstName;
            user.phoneNumber = userDetails.phoneNumber;
            user.whatsapp = userDetails.whatsapp;
            user.dob = userDetails.dob;
            user.alternativeMobile = userDetails.alternativeMobile;
            user.customerEmail = userDetails.customerEmail;
            user.address = userDetails.address;

            student.id = studentDetails.id;
            student.course = studentDetails.course;
            student.courseFrequency = studentDetails.courseFrequency;
            student.timings = studentDetails.timings;
            student.startDate = studentDetails.startDate;

            const validateStudent = await (new validations()).validateStudent('LSQValidate', student, user, paymentDetails);


            if (validateStudent.status === Status.ENROLLED_CAPS) {
                ids.push(userDetails.id);
                userRepository.update({ id: userDetails.id }, { status: Status.ENROLLED });
                studentRepository.update({ id: userDetails.id }, { status: Status.ENROLLED });
            }

            total_updated = ids.length;
            total_records = errorStatus.length;

        } catch (e) {
            logger.error("Faled to valiate student: " + e.message);
            console.log(e);
        }
    }
    return { ids_updated: ids, total_updated: total_updated, total_records: total_records };
}
