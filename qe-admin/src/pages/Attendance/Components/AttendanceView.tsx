import React, { useState, useEffect } from "react";
import { Button, Form, Spin, message } from "antd";
import { getOneAttendance } from "@/services/ant-design-pro/api";
import { ReloadOutlined } from "@ant-design/icons";

export type ViewAttendanceProps = {
    attendanceData: {
        batchNumber: string;
        classProfileId: string;
        id: string;
        name: string;
        studentId: string;
        teacherId: string;
        teacherName: string;
    };
    setShowViewAttendance?: any;
    showViewAttendance?: any;
    actionRef?: any;
};

const ViewAttendance: React.FC<ViewAttendanceProps> = (props) => {

    const [isLoading, setIsLoading] = useState(false);
    const [details, setDetails] = useState<any>([]);

    const noDataFound = (studentId: string) => {
        message.error(`No Attendance Data Found for this Student, Student ID: ${studentId}`);
    };

    const getAttendanceDetails = async (studentId: string) => {
        setIsLoading(true);
        const response = await getOneAttendance({ studentId });
        setDetails(response?.data);
        setIsLoading(false);
        if (details.length === 0 || !response) {
            noDataFound(props?.attendanceData?.studentId);
        }
    };
    let classesPresent = details?.filter(function (currentElement: { studentAttended: string; }) {
        return currentElement.studentAttended === "Yes";
    });
    let classesAbsent = details?.filter(function (currentElement: { studentAttended: string; }) {
        return currentElement.studentAttended === "No";
    });
    let classesPartial = details?.filter(function (currentElement: { studentAttended: string; }) {
        return currentElement.studentAttended === "Partial";
    });
    let classesConnectionProblem = details?.filter(function (currentElement: { connectionProblem: boolean; }) {
        return currentElement.connectionProblem === true;
    });
    const [form] = Form.useForm();

    useEffect(() => {
        if (props?.attendanceData?.studentId) {
            getAttendanceDetails(props?.attendanceData?.studentId);
        }
    }, [props?.attendanceData]);

    return (
        <>
            <Spin spinning={isLoading}>
                <Form
                    name="attendanceView"
                    form={form}
                    labelCol={{
                        span: 8,
                    }}
                    wrapperCol={{
                        span: 16,
                    }}
                    autoComplete="off"
                >
                    <div>
                        <h1>View Attendance</h1>
                    </div>
                    <Form.Item label="Student Name" name="name">
                        {props?.attendanceData?.name}
                    </Form.Item>
                    <Form.Item label="Batch Number" name="Batch Number">
                        {props?.attendanceData?.batchNumber}
                    </Form.Item>
                    <Form.Item label="Teacher Name" name="teacherName">
                        {props?.attendanceData?.teacherName}
                    </Form.Item>
                    <Form.Item label="Total Classes" name="totalClasses">
                        {details?.length}
                    </Form.Item>
                    <Form.Item label="Classes Present" name="classesPresent">
                        {classesPresent?.length}
                    </Form.Item>
                    <Form.Item label="Classes Absent" name="classesAbsent">
                        {classesAbsent?.length}
                    </Form.Item>
                    <Form.Item label="Classes Partially Present" name="classesPartiallyPresent">
                        {classesPartial?.length}
                    </Form.Item>
                    <Form.Item label="Internet Issues Occurred" name="classesPartiallyPresent">
                        {classesConnectionProblem?.length}
                    </Form.Item>
                    <Button
                        onClick={() => getAttendanceDetails(props?.attendanceData?.studentId)}
                        shape="round"
                        block
                        style={{ color: "white", backgroundColor: "DodgerBlue" }}
                    >
                        <ReloadOutlined />Refresh
                    </Button>
                </Form>
            </Spin>
        </>
    );
};

export default ViewAttendance;
