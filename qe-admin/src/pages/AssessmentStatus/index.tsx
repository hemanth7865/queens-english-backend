// @ts-nocheck
import { PlusOutlined, EditTwoTone, EyeOutlined, EditOutlined } from "@ant-design/icons";
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
  Alert,
  Table,
  Space,
  Rate,
} from "antd";
import React, { useState, useRef, useEffect } from "react";
import { useIntl, FormattedMessage } from "umi";
import { PageContainer, FooterToolbar } from "@ant-design/pro-layout";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";
import { ModalForm, ProFormText, ProFormTextArea } from "@ant-design/pro-form";
import type { ProDescriptionsItemProps } from "@ant-design/pro-descriptions";
import ProDescriptions from "@ant-design/pro-descriptions";
import type { FormValueType } from "./components/UpdateForm";
import UpdateForm from "./components/UpdateForm";
import AssessmentForm from "./components/Form";
import {
  rule,
  listBatch,
  dueAssessment,
  detailsAssessment,
  listTeacherAndStudent,
} from "@/services/ant-design-pro/api";
import DebounceSelect from "@/components/DebounceSelect";

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */

const TableList: React.FC = () => {
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [showAdd, setShowAdd] = useState<boolean>(false);

  const [tempData, setTempData] = useState("");
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [tempDataView, setTempDataView] = useState("");

  const [storeBatchId, setStoreBatchId] = useState("");
  const [batchData, setBatchData] = useState("");

  const [batchCode, setBatchCode] = useState("");
  const [batchDetails, setBatchDetails] = useState("");
  const [lessonValue, setLessonValue] = useState("");
  const [batchLesson, setBatchLesson] = useState("");

  const [assessmentDetails, setAssessmentDetails] = useState("");
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [assessmentData, setAssessmentData] = useState("");
  const [selectStatus, setSelectStatus] = useState("")
  const [teacherName, setTeacherName] = useState([]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const format = "HH:mm";
  const [form] = Form.useForm();

  const columns = [
    // {
    //   title: "Time Strap",
    // },
    // {
    //   title: "Assessment Type",
    // },
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
      title: "Individual Score",
      dataIndex: "scores",
      render: (scores) => scores?scores.map((score) => score.score).join("  "):'',
      key: "scores"
    },
    {
      title: "Total Score",
      key: "totalScore",
      dataIndex: "totalScore",
    },
    {
      title: "Individual Mastery",
      render: (value)=>{
        const totalValue = value.scores?value.scores.length:'NA'
        //console.log('tv', totalValue)
        //console.log('value', value.scores?value.scores.length:'')
        const totalMarks = `${parseFloat((value.totalScore/totalValue)*100).toFixed(2)} %`
        if(totalMarks == 'NaN %'){
          return `0 %`
        }else{
          return totalMarks
        }
      }
    },
    {
      title: "Vocal Score",
      render: (value)=>{
        //console.log('vv', value.vocabScore)
        return <Rate allowHalf disabled defaultValue={value.vocabScore} style = {{color: "black", fontSize: 10}}/>
      }
    },
    {
      title: "Pronounciation Score",
      render: (value)=>{
        return <Rate allowHalf disabled defaultValue={value.pronunciationScore} style = {{color: "black", fontSize: 10}}/>
      }
    },
    {
      title: "Confidence Score",
      render: (value)=>{
        return <Rate allowHalf disabled defaultValue={value.confidenceScore} style = {{color: "black", fontSize: 10}}/>
      }
    },
    // {
    //   title: "View",
    //   key: "view",
    //   render: (text, record) => (
    //     <Space size="middle">
    //       <a
    //         onClick={() => {
    //           //{console.log("text->", text, "record->", record)}
    //           setShowDetail(true);
    //           handleShowDetails(text.id);
    //         }}
    //       >
    //         <EyeOutlined />
    //       </a>
    //     </Space>
    //   ),
    // },
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

  const fetchAllAssessment = async ()=> {
    try {
      let msg = await dueAssessment('', '', '', {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (msg.status === "ok") {
        console.log("API call sucessfull", msg);
      }
      setAssessmentDetails(msg.data);
      console.log('view one',msg.data);
      
    } catch (error) {
      console.log("error", error);
    }
  }

  useEffect(async (params: any) => {
    console.log("first reload")
    fetchAllAssessment()
  }, []);

  const handleShowDetails = async (id) => {
    try {
      let msg = await detailsAssessment(id);
      if (msg.status === "ok") {
        console.log("API call sucessfull", msg);
      }
      setAssessmentData(msg);
      console.log('view one assessment data',msg);
    } catch (error) {
      console.log("error", error);
    }
  };
  

  const fetchBatchList = async (username) => {
    //console.log("fetching batch", username);
    return listBatch({
      current: 1,
      pageSize: 5,
      batchId: username,
    }).then((body) => {
      console.log('body', body)
      return body.data.map((user) => ({
        label: `${user.batchId}`,
        value: user.id,
      }));
    });
  }

 const fetchUserList = async (username) => {
    console.log("fetching teacher user", username);
    return listTeacherAndStudent({
      type: 'teacher',
      current: 1,
      pageSize: 5,
      keyword: username
    })
      .then((body) =>
        body.data.map((user) => ({
          label: `${user.name}`,
          value: user.id,
        }))
      );
  }

  const handleDebounceSelect = async (newValue) => {
    setBatchCode(newValue);
  };

  console.log('batchCOde', batchCode, teacherName)

  const onFinish = async (value) => {
    console.log('status', value)
    try {
      let msg = await dueAssessment(  batchCode.key ? batchCode.key: '', selectStatus, teacherName.key ? teacherName.key:'', {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (msg.status === "ok") {
        console.log("API call sucessfull", msg);
      }
      setAssessmentDetails(msg.data);
      console.log('view one status',msg.data);
    } catch (error) {
      console.log("error", error);
    }
  }

  const handleReset = async()=>{
    form.resetFields();
    fetchAllAssessment()
  }

  return (
    <PageContainer>
      <div>
        {assessmentDetails ? (
          <div>
          <div style = {{padding: 20, background: "white", marginBottom: 10, alignContent: 'center'}}>
            <Row>
              <Col span = {14}>
                <Form name="basic" onFinish={onFinish} form={form}>
                <Row gutter={16}>
                  <Col span={2}>
                    <p style = {{paddingTop: 5}}>Search  : </p>
                  </Col>
                  <Col span={6}>
                    <Form.Item name="status" >
                    <Select
                      placeholder="Choose status"
                      onChange={(value) => {
                        setSelectStatus(value);
                      }}
                    >
                      <Option value="DUE">DUE</Option>
                      <Option value="COMPLETED">COMPLETED</Option>
                    </Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item name="batchId">
                      <DebounceSelect
                        showSearch
                        value={batchCode}
                        placeholder="Select Batch"
                        fetchOptions={fetchBatchList}
                        options={
                          currentRow?.id
                            ? [
                                {
                                  value: currentRow.id,
                                  label: "batch",
                                  key: currentRow.id,
                                },
                              ]
                            : []
                        }
                        onChange={handleDebounceSelect}
                        style={{
                          width: "100%",
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item name="teacherId">
                    <DebounceSelect
                          showSearch
                          value={teacherName}
                          placeholder="Select teacher"
                          fetchOptions={fetchUserList}
                          options = { currentRow?.id ? [{value:currentRow.id,label:'teacher',key:currentRow.id}]:[]}
                          onChange={(newValue) => {
                            setTeacherName(newValue);
                            console.log("teacher name", newValue);
                          }}
                          style={{
                            width: "100%",
                          }}
                        />
                    </Form.Item>
                  </Col>
                  <Col span = {2}>
                  <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit">
                      Query
                    </Button>
                  </Form.Item>
                  </Col>
                  <Col span = {2}>
                  <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                  <Button
                    onClick={handleReset}
                  >
                    Reset
                </Button>
                </Form.Item>
                </Col>
                </Row>
              </Form>
            </Col>
        </Row>
        </div>
          <div>
            <Table columns={columns} dataSource={assessmentDetails} />
          </div>
          </div>
        ) : (
          ''
        )}
        <Drawer
        width={600}
        visible={showDetail}
        onClose={() => {
          setShowDetail(false);
          setAssessmentData(undefined);
          setFormVisible(false);
        }}
        closable={false}
      >
        <h2 style={{ textAlign: "center", color: "blue" }}>
          Assessment Details
        </h2>
        {formVisible ? (
          <>
            <AssessmentForm assessmentData={assessmentData} />
          </>
        ) : assessmentData ? (
          <Row style={{ fontWeight: 500 }} gutter={(40, 60)}>
            <Col span={10}>
              <p>Student Name</p>
            </Col>
            <Col span={14}>
              <p>{assessmentData.studentName}</p>
            </Col>
            <Col span={10}>
              <p>Total Score</p>
            </Col>
            <Col span={14}>
              <p>{assessmentData.totalScore}</p>
            </Col>
            <Col span={24}></Col>
            <Col span={24}>
              {assessmentData.scores.length ? (
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
                      dataSource={assessmentData.scores}
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
      </div>
    </PageContainer>
  );
};

export default TableList;
