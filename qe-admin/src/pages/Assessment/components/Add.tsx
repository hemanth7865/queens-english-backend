// @ts-nocheck
import React, { useState, useEffect } from "react";
import { DownOutlined, FieldTimeOutlined } from "@ant-design/icons";
import {
  Button,
  message,
  Input,
  Drawer,
  Form,
  DatePicker,
  Row,
  Col,
  Card,
  Descriptions,
  Checkbox,
  TimePicker,
  Select,
  RangePicker,
  Radio,
} from "antd";
import moment from "moment";
import { LESSONS } from "../../../../config/lessons";
import {
  addSessionAttendence,
  editSessionAttendence,
} from "@/services/ant-design-pro/api";

export type AddProps = {
  data: {};
  lessonData: "";
  dataLesson: {};
};

const Add: React.FC<AddProps> = (props) => {
  const format = "HH:mm";
  // console.log(
  //   "data batch details props",
  //   props.lessonData,
  //   props.data,
  //   props.dataLesson,
  //   props.dataLesson.start_time
  // );
  const {
    startingLessonId,
    endingLessonId,
    teacherId,
    classStartDate,
    batchNumber,
    id,
  } = props.data ? props.data.classes : "";

  //console.log("fields =>", props.dataLesson);

  const [timeValue, setTimeValue] = useState("");
  const [formData, setFormData] = useState({ recordedLink: "", teacher: "" });
  const [checkBoxValue, setCheckBoxValue] = useState([{}]);
  const [dateValue, setDateValue] = useState(moment());
  const [selectReported, setSelectReported] = useState("");
  const [studentDetails, setStudentDetails] = useState([]);

  function userExists(name) {
    return studentDetails.some(function (el) {
      return el.studentId === name;
    });
  }

  const handleInnerInputChange = (event) => {
    setFormData((value) => ({
      ...value,
      [event.target.name]: event.target.value,
    }));
  };

  const handleCheckBox = (e, id, studentid) => {
    console.log("checked = ", e.target.value, id, studentid);

    if (studentid) {
      if (userExists(id)) {
        setStudentDetails([
          { is_present: e.target.value, studentId: id, id: studentid },
        ]);
      } else {
        setStudentDetails([
          ...studentDetails,
          { is_present: e.target.value, studentId: id, id: studentid },
        ]);
      }
    } else {
      if (userExists(id)) {
        setStudentDetails([{ is_present: e.target.value, studentId: id }]);
      } else {
        setStudentDetails([
          ...studentDetails,
          { is_present: e.target.value, studentId: id },
        ]);
      }
    }
  };

  console.log("studentdetails array", studentDetails);

  const handleInnerForm = async (value) => {
    //console.log('inner form', value)
    let dataForm;
    if (props.dataLesson) {
      dataForm = {
        batchId: props.dataLesson.batchId,
        recording_url: formData.recordedLink
          ? formData.recordedLink
          : props.dataLesson.recording_url,
        teacherId: formData.teacher
          ? formData.teacher
          : props.dataLesson.teacherId,
        start_time: timeValue ? timeValue[0] : props.dataLesson.start_time,
        end_time: timeValue ? timeValue[1] : props.dataLesson.end_time,
        session_date: dateValue.length
          ? dateValue
          : props.dataLesson.session_date,
        recorded: selectReported ? selectReported : props.dataLesson.recorded,
        lessonId: props.lessonData
          ? props.lessonData
          : props.dataLesson.lessonId,
        attendances:
          studentDetails.length != 0
            ? studentDetails
            : props.dataLesson.attendances,
      };
      try {
        console.log("data", dataForm);
        const msg = await editSessionAttendence(props.dataLesson.id, {
          body: JSON.stringify(dataForm),
        });
        if (msg.status === "ok") {
          console.log("API call sucessfull", msg);
        }
        message.success("session edited successfully");
        console.log("edited session", msg);
      } catch (error) {
        console.log("addRule error", error);
        message.error("session edited failed");
      }
      setStudentDetails([]);
      //window.location.reload();
    } else {
      dataForm = {
        batchId: id,
        recording_url: formData.recordedLink,
        teacherId: formData.teacher ? formData.teacher : teacherId,
        start_time: timeValue[0],
        end_time: timeValue[1],
        session_date: dateValue.length ? dateValue : classStartDate,
        recorded: selectReported ? selectReported : true,
        lessonId: props.lessonData ? props.lessonData : startingLessonId,
        attendance: studentDetails,
      };
      try {
        console.log("data", JSON.stringify(dataForm));
        const msg = await addSessionAttendence({
          body: JSON.stringify(dataForm),
        });
        if (msg.status === "ok") {
          console.log("API call sucessfull", msg);
        }
        message.success("session added successfully");
        console.log("added session", msg);
      } catch (error) {
        console.log("addRule error", error);
        message.error("session add failed");
      }
      setStudentDetails([]);
      //window.location.reload();
    }
    //console.log('dataform inner', dataForm)
  };

  //console.log('date', dateValue.length, classStartDate)

  const [form] = Form.useForm();
  const defaultValues = () => {
    form.setFieldsValue({
      startLesson: startingLessonId,
      teacher: props.data.classes.teacher
        ? `${props.data.classes.teacher.firstName} ${props.data.classes.teacher.lastName}`
        : teacherId,
      date: moment(classStartDate, "YYYY/MM/DD"),
      recordingLink: "",
      time: "",
    });
  };
  const lessonDefaultValues = () => {
    form.setFieldsValue({
      teacher: props.data.classes.teacher
        ? `${props.data.classes.teacher.firstName} ${props.data.classes.teacher.lastName}`
        : teacherId,
      date: moment(props.dataLesson.session_date, "YYYY/MM/DD"),
      recordingLink: props.dataLesson.recording_url,
      reported: props.dataLesson.recorded,
      time: [
        moment(props.dataLesson.start_time, "HH:mm"),
        moment(props.dataLesson.end_time, "HH:mm"),
      ],
    });
  };
  if (props.dataLesson) {
    useEffect(() => {
      lessonDefaultValues();
    }, [
      props.dataLesson.teacherId,
      props.dataLesson.session_date,
      props.dataLesson.recording_url,
      props.dataLesson.recorded,
      props.dataLesson.start_time,
    ]);
  } else {
    useEffect(() => {
      defaultValues();
    }, [
      startingLessonId,
      props.data.classes.teacher
        ? `${props.data.classes.teacher.firstName} ${props.data.classes.teacher.lastName}`
        : teacherId,
      classStartDate,
      "",
      "",
    ]);
  }

  return (
    <div>
      <Form form={form} name="basic" onFinish={handleInnerForm}>
        <Card>
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item name="date" label="Date">
                <DatePicker
                  format="YYYY/MM/DD"
                  onChange={(date, dateString) => {
                    setDateValue(dateString);
                  }}
                  value={dateValue}
                />
              </Form.Item>
            </Col>
            <Col span={14}>
              <Form.Item label="Recording Link" name="recordingLink">
                <Input
                  name="recordedLink"
                  onChange={handleInnerInputChange}
                  placeholder="Enter Meeting Link"
                />
              </Form.Item>
            </Col>

            <Col span={14}>
              <Form.Item label="Time" name="time">
                <TimePicker.RangePicker
                  format={format}
                  onChange={(time, timeString) => {
                    setTimeValue(timeString);
                  }}
                  suffixIcon={<FieldTimeOutlined />}
                  minuteStep={30}
                  value={timeValue}
                />
              </Form.Item>
            </Col>
            <Col span={14}>
              <Form.Item label="Teacher" name="teacher">
                <Input name="teacher" onChange={handleInnerInputChange} />
              </Form.Item>
            </Col>
            <Col span={14}>
              <Form.Item
                label="Reported"
                name="reported"
                //initialValue="Yes"
              >
                <Select
                  onChange={(value) => {
                    setSelectReported(value);
                  }}
                >
                  <Option value={true}>Yes</Option>
                  <Option value={false}>No</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>
        <Card title="Student Attendence">
          <Form.Item name="attendance">
            {props.dataLesson
              ? props.dataLesson.attendances.map((student) => {
                  //console.log('if stat', student)
                  return (
                    <Row key={student.id}>
                      <Col span={8}>
                        <p>
                          {student.student
                            ? student.student
                            : student.studentId}{" "}
                        </p>
                      </Col>
                      <Col span={8}>
                        <Radio.Group
                          onChange={(value) => {
                            handleCheckBox(
                              value,
                              student.studentId,
                              student.id
                            );
                          }}
                          defaultValue={student.is_present}
                        >
                          <Radio value={1}>Present</Radio>
                          <Radio value={0}>Absent</Radio>
                          <Radio value={2}>Partially Present</Radio>
                        </Radio.Group>
                      </Col>
                    </Row>
                  );
                })
              : props.data.students.map((student) => {
                  //console.log('else stat', student)
                  return (
                    <Row key={student.id}>
                      <Col span={8}>
                        <p>{student.student ? student.student : student.id} </p>
                      </Col>
                      <Col span={8}>
                        <Radio.Group
                          onChange={(value) => {
                            handleCheckBox(value, student.id);
                          }}
                        >
                          <Radio value={1}>Present</Radio>
                          <Radio value={0}>Absent</Radio>
                          <Radio value={2}>Partially Present</Radio>
                        </Radio.Group>
                      </Col>
                    </Row>
                  );
                })}
          </Form.Item>
        </Card>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form>
    </div>
  );
};

export default Add;
