import { NextFunction, Request, Response } from "express";
import EmployeeService from "../services/EmployeeService";

export class EmployeeController {
    private employeeService = new EmployeeService();

    async getEmployees(request: Request, response: Response, next: NextFunction) {
        try {
            const employees = await this.employeeService.getEmployee(request);
            return response.status(201).json(employees);
        } catch (error) {
            return response.status(500).json({ error: error.message || "Internal Server Error" });
        }
    }

    async createEmployees(request: Request, response: Response, next: NextFunction) {
        try {
            const employeeData = request.body;
            const newEmployee = await this.employeeService.addEmployee(employeeData);
            return response.status(201).json(newEmployee);
        } catch (error) {
            return response.status(500).json({ error: error.message || "Internal Server Error" });
        }
    }

    async updateEmployees(request: Request, response: Response, next: NextFunction) {
        try {
            const id = +request.body.id;
            const employeeData = request.body;
            

            const updatedEmployee = await this.employeeService.updateEmployee({ id, employeeData });

            if (updatedEmployee.success) {
                return response.json(updatedEmployee);
            } else {
                return response.status(404).json({ error: updatedEmployee.error || "Employee not found" });
            }
        } catch (error) {
            return response.status(500).json({ error: error.message || "Internal Server Error" });
        }
    }
}
