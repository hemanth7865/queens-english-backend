// @ts-nocheck
import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  message,
  Input,
  Drawer,
  Table,
  Form,
  Row,
  Col,
  Space,
  Spin,
  Alert,
} from "antd";
import React, { useState, useRef } from "react";
import { useIntl, FormattedMessage } from "umi";
import { PageContainer, FooterToolbar } from "@ant-design/pro-layout";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";
import { ModalForm, ProFormText, ProFormTextArea } from "@ant-design/pro-form";
import type { ProDescriptionsItemProps } from "@ant-design/pro-descriptions";
import ProDescriptions from "@ant-design/pro-descriptions";
import type { FormValueType } from "./components/UpdateForm";
import UpdateForm from "./components/UpdateForm";
import {
  rule,
  addRule,
  updateRule,
  removeRule,
  dueAssessment,
  getAllAssessments,
  detailsAssessment,
} from "@/services/ant-design-pro/api";
import { EyeOutlined, EditOutlined } from "@ant-design/icons";
import AssessmentForm from "./FormComponent/Form";
const { Column, ColumnGroup } = Table;

const TableList: React.FC = () => {
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState("");
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    teacherId: "",
    classProfileId: "",
    lessonStartId: "",
  });
  const [assessmentDue, setAssessmentDue] = useState("");
  const [assessmentDetails, setAssessmentDetails] = useState("");

  const intl = useIntl();

 
  const handleShowDetails = async (id) => {
    try {
      let msg = await detailsAssessment(id);
      if (msg.status === "ok") {
        console.log("API call sucessfull", msg);
      }
      setAssessmentDetails(msg);
      //console.log('view one',msg);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleInputChange = (event: { target: { name: any; value: any } }) => {
    setFormData((value) => ({
      ...value,
      [event.target.name]: event.target.value,
    }));
  };

  const onFinish = async (value) => {
    console.log("form is submitted", value);
    try {
      // 登录
      // console.log("data", dataForm);
      const msg = await dueAssessment(
        value.teacherId,
        value.classProfileId,
        value.lessonStartId
      );
      if (msg.status === "ok") {
        console.log("API call sucessfull", msg);
      }
      setAssessmentDue(msg);
      console.log(msg);
    } catch (error) {
      console.log("addRule error", error);
    }
  };

  //console.log("state assessment", assessmentDue);
  //console.log("assessment details", assessmentDetails);

  const columns = [
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Current Lesson",
      dataIndex: "currentLessonNumber",
      key: "currentLessonNumber",
    },
    {
      title: "Total Score",
      key: "totalScore",
      dataIndex: "totalScore",
    },
    {
      title: "View",
      key: "view",
      render: (text, record) => (
        <Space size="middle">
          <a
            onClick={() => {
              //{console.log("text->", text, "record->", record)}
              setShowDetail(true);
              handleShowDetails(text.id);
            }}
          >
            <EyeOutlined />
          </a>
        </Space>
      ),
    },
    {
      title: "Edit",
      key: "edit",
      render: (text, record) => (
        <Space size="middle">
          <a
            onClick={() => {
              //{console.log("text->", text, "record->", record)}
              setShowDetail(true);
              handleShowDetails(text.id);
              setFormVisible(true);
            }}
          >
            <EditOutlined />
          </a>
        </Space>
      ),
    },
  ];

  const columnScore = [
    {
      title: "Question",
      dataIndex: "question",
      key: "question",
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
    },
  ];

  return (
    <PageContainer>
      <div>
        <div>
          <h4>Assessment Management</h4>
          <Form name="basic" onFinish={onFinish}>
            <Row gutter={16}>
              {/* <Col span={4}>
                <p>Please Select a Batch and Lesson : </p>
              </Col> */}
              <Col span={6}>
                <Form.Item name="teacherId" label="teacherId">
                  <Input name="teacherId" onChange={handleInputChange} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="classProfileId" label="classProfileId">
                  <Input name="classProfileId" onChange={handleInputChange} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="lessonStartId" label="lessonStartId">
                  <Input name="lessonStartId" onChange={handleInputChange} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
        {assessmentDue ? (
          <Table columns={columns} dataSource={assessmentDue} />
        ) : (
          ""
        )}
      </div>
      <Drawer
        width={600}
        visible={showDetail}
        onClose={() => {
          setShowDetail(false);
          setAssessmentDetails(undefined);
          setFormVisible(false);
        }}
        closable={false}
      >
        <h2 style={{ textAlign: "center", color: "blue" }}>
          Assessment Details
        </h2>
        {formVisible ? (
          <>
            <AssessmentForm assessmentDetails={assessmentDetails} />
          </>
        ) : assessmentDetails ? (
          <Row style={{ fontWeight: 500 }} gutter={(40, 60)}>
            <Col span={10}>
              <p>Student Name</p>
            </Col>
            <Col span={14}>
              <p>{assessmentDetails.studentName}</p>
            </Col>
            <Col span={10}>
              <p>Total Score</p>
            </Col>
            <Col span={14}>
              <p>{assessmentDetails.totalScore}</p>
            </Col>
            <Col span={24}></Col>
            <Col span={24}>
              {assessmentDetails.scores.length ? (
                <Row>
                  <Col
                    span={24}
                    style={{ textAlign: "center", fontWeight: 900 }}
                  >
                    <p>Scores</p>
                  </Col>
                  <Col span={24}>
                    <Table
                      columns={columnScore}
                      dataSource={assessmentDetails.scores}
                    />
                  </Col>
                </Row>
              ) : (
                <Row>
                  <Col span={3}>
                    <p>Score</p>
                  </Col>
                  <Col span={4}></Col>
                  <Col span={16}>
                    <p>NA</p>
                  </Col>
                </Row>
              )}
            </Col>
          </Row>
        ) : (
          ""
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
