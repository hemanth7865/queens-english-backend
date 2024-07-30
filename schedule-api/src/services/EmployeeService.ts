import { getRepository } from "typeorm";
import { Admin } from "../entity/Admin";
import { User } from "../entity/User";
import { TeacherService } from "./TeacherService";
import { AzureProxyController } from "../controller/AzureProxyController";

class EmployeeService {
  private usersRepository = getRepository(User);

  private employeeRepository = getRepository(Admin);
  private TeacherService = new TeacherService();

  //   private studentAndTeacherRepository = getRepository(User);
  async getEmployee(request: any) {
    try {
      const {
        name,
        phone,
        role,
        status,
        current = 1,
        pageSize = 10,
      } = request.query;

      const queryBuilder =
        this.employeeRepository.createQueryBuilder("employee");

      if (name) {
        const nameWords = name.trim().split(" ");
        queryBuilder.andWhere(
          "(employee.firstname LIKE :name OR employee.lastname LIKE :name)",
          { name: `%${nameWords[0]}%` }
        );
      }

      if (phone) {
        const last10Digits = phone.slice(-10);
        queryBuilder.andWhere(
          "SUBSTRING(employee.phone, -10) = :last10Digits",
          { last10Digits }
        );
      }

      if (role) {
        queryBuilder.andWhere("employee.role = :role", { role });
      }

      if (status) {
        queryBuilder.andWhere("employee.status = :status", { status });
      }

      const skip = (current - 1) * pageSize;
      const take = pageSize;

      queryBuilder.offset(skip).limit(take);

      const allEmployee = await queryBuilder.getMany();

      const totalCount = await queryBuilder.getCount();

      return {
        success: true,
        data: allEmployee,
        current: current,
        pageSize: pageSize,
        total: totalCount,
      };
    } catch (error) {
      throw new Error("Failed to fetch employees");
    }
  }

  async addEmployee(request: any) {
    try {
      const existingEmployee = await this.employeeRepository.findOne({
        where: { email: request.email },
      });
      if (existingEmployee) {
        return {
          success: false,
          error: "Employee with the same email already exists",
        };
      }

      let newEmployee = new Admin();
      newEmployee.firstname = request.firstname;
      newEmployee.lastname = request.lastname;
      newEmployee.code = request.code;
      newEmployee.email = request.email;
      newEmployee.phone = request.phone;
      newEmployee.password = "123456";
      newEmployee.created_at = new Date();
      newEmployee.updated_at = new Date();
      newEmployee.role = request.role;
      newEmployee.status = request.status;
      newEmployee = await this.employeeRepository.save(newEmployee);

      // trigger genrating Free speaking assessment credentials for all pms whoe don't have
      await AzureProxyController.request("api/user/generateFSACredentials", {
        method: "post",
      });

      return {
        success: true,
        data: newEmployee,
      };
    } catch (error) {
      throw new Error("Failed to add employee");
    }
  }

  async updateEmployee(request: any) {
    try {
      let employee = await this.employeeRepository.findOne({
        where: { id: request.id },
      });
      if (!employee) {
        return {
          success: false,
          error: "Employee not found",
        };
      }
      const originalStatus = employee.status;
      employee.firstname = request.employeeData.firstname;
      employee.lastname = request.employeeData.lastname;
      employee.code = request.employeeData.code;
      employee.email = request.employeeData.email;
      employee.phone = request.employeeData.phone;
      employee.password = request.employeeData.password;
      employee.updated_at = new Date();
      employee.role = request.employeeData.role;
      employee.status = request.employeeData.status;

      const updatedEmployee = await this.employeeRepository.save(employee);

      if (
        originalStatus !== request.employeeData.status &&
        request.employeeData.status === "inactive"
      ) {
        console.log("entered in if condition");
        // ############################### Tacher account deactivate ###########################################
        const users = await this.usersRepository.find({
          where: { email: request.employeeData.email },
        });

        for (const user of users) {
          try {
            const teacherResp = await this.TeacherService.leadFullDetails(
              {},
              +user.id
            );
            if (teacherResp && teacherResp.success && teacherResp.data) {
              const teacher = teacherResp.data;
              console.log("teacher ", teacher);
              const teacherBody: any = {
                ...teacher,
                status: 0,
              };

              console.log("teacherbody ", teacherBody);
              const resp: any = await this.TeacherService.saveTeacher(
                teacherBody
              );
              if (resp?.status === 400 || resp?.status === 501 || resp?.error) {
                console.log("response ==>> ", resp);
              }
            } else {
              console.log(
                "Teacher not found or failed to get teacher details."
              );
            }
          } catch (error) {
            console.error("Error deactivating teacher:", error);
          }
        }
      }
      return {
        success: true,
        data: updatedEmployee,
      };
    } catch (error) {
      throw new Error("Failed to update employee");
    }
  }
}

export default EmployeeService;
