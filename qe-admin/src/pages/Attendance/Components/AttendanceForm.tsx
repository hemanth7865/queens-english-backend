import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, DatePicker, Checkbox, Spin } from "antd";
import moment from "moment";
import { handleAPIResponse } from "@/services/ant-design-pro/helpers";
import { updateAssessment } from '@/services/ant-design-pro/api';

export type EditAttendanceProps = {
  attendanceData: {
    batchNumber: string;
    classProfileId: string;
    connectionProblem: boolean;
    dateAttended: string;
    id: string;
    lessonId: string;
    lessonNumber: string;
    name: string;
    studentAttended: string;
    studentId: string;
    teacherId: string;
    teacherName: string;
    _attachments: string;
    _etag: string;
    _rid: string;
    _self: string;
    _ts: number;
  };
  setShowEditAttendance?: any;
  showEditAttendance?: any;
  actionRef?: any;
};

const EditAttendance: React.FC<EditAttendanceProps> = (props) => {
  const dateFormat = "DD-MM-YYYY";
  const [attendedDate, setAttendedDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  const defaultValues = () => {
    form.setFieldsValue({
      batchNumber: props?.attendanceData?.batchNumber,
      teacherName: props?.attendanceData?.teacherName,
      classProfileId: props?.attendanceData?.classProfileId,
      connectionProblem: props?.attendanceData?.connectionProblem,
      dateAttended: moment(props?.attendanceData?.dateAttended, dateFormat),
      id: props?.attendanceData?.id,
      lessonId: props?.attendanceData?.lessonId,
      lessonNumber: props?.attendanceData?.lessonNumber,
      name: props?.attendanceData?.name,
      studentAttended: props?.attendanceData?.studentAttended,
      studentId: props?.attendanceData?.studentId,
      teacherId: props?.attendanceData?.teacherId,
    });
  };
  useEffect(() => {
    defaultValues();
  }, [
    props?.attendanceData?.name,
    props?.attendanceData?.studentAttended,
    props?.attendanceData?.dateAttended,
    props?.attendanceData?.batchNumber,
    props?.attendanceData?.lessonNumber,
    props?.attendanceData?.lessonId,
    props?.attendanceData?.classProfileId,
    props?.attendanceData?.connectionProblem,
    props?.attendanceData?.teacherName,
  ]);

  const onChange = (date: any, dateString: any) => {
    setAttendedDate(dateString)
  };

  useEffect(() => {
    setAttendedDate('')
  }, [props.showEditAttendance === false])

  const saveAttendanceRecord = async (data: any) => {
    try {
      const msg = await updateAssessment(
        props?.attendanceData?.classProfileId,
        {
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      if (msg.status === "ok") {
        console.log("API call sucessfull", msg);
      }
      console.log(msg);
      handleAPIResponse(msg, "Attendance Updated Successfully", "Failed To Update Attendance", false);
    } catch (error) {
      console.log("Error", error);
      handleAPIResponse({ status: 400 }, " ", "Failed To Update Attendance", false);
    }
  }

  const onFinish = async (values: any) => {
    console.log("Received values of form: ", values);
    setIsLoading(true);
    const dataForm = {
      id: props?.attendanceData?.id,
      classProfileId: props?.attendanceData?.classProfileId,
      studentId: props?.attendanceData?.studentId,
      batchNumber: props?.attendanceData?.batchNumber,
      teacherName: props?.attendanceData?.teacherName,
      name: props?.attendanceData?.name,
      studentAttended: values.studentAttended,
      connectionProblem: values.connectionProblem,
      dateAttended: attendedDate ? attendedDate : props?.attendanceData?.dateAttended
    }
    console.log('data', dataForm);
    await saveAttendanceRecord(dataForm);
    props.setShowEditAttendance(false);
    setIsLoading(false);
    props.actionRef.current.reload();
  };


  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
      <Spin spinning={isLoading}>
        <Form
          name="attendanceEdit"
          form={form}
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          autoComplete="off"
          scrollToFirstError
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <div>
            <h1>Edit Attendance</h1>
          </div>
          <Form.Item label="Student Name" name="name">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Batch Number" name="batchNumber">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Teacher Name" name="teacherName">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Attendance" name="studentAttended">
            <Select>
              <Select.Option value="Yes">Yes</Select.Option>
              <Select.Option value="No">No</Select.Option>
              <Select.Option value="Partial">Partial</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Internet Issues ?"
            valuePropName="checked"
            name="connectionProblem"
          >
            <Checkbox />
          </Form.Item>
          <Form.Item label="Date Attended" name="dateAttended">
            <DatePicker format={dateFormat} onChange={onChange} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              shape="round"
              block
              style={{ color: "white", backgroundColor: "DodgerBlue" }}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </>
  );
};

export default EditAttendance;
