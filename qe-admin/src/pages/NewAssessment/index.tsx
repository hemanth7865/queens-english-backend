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
  Rate,
} from "antd";
import React, { useState, useRef } from "react";
import { useIntl, FormattedMessage } from "umi";
import { PageContainer, FooterToolbar } from "@ant-design/pro-layout";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";
import { ModalForm, ProFormText, ProFormTextArea } from "@ant-design/pro-form";
import type { ProDescriptionsItemProps } from "@ant-design/pro-descriptions";
import ProDescriptions from "@ant-design/pro-descriptions";
import {
  rule,
  addRule,
  updateRule,
  removeRule,
  getAllAssessments,
  detailsAssessment,
  allAssessment
} from "@/services/ant-design-pro/api";
import { EyeOutlined, EditOutlined } from "@ant-design/icons";
import AssessmentForm from "./components/Form";
import moment from 'moment';
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


  const columns: ProColumns<API.RuleListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleDate"
          defaultMessage="Date"
        />
      ),
      dataIndex: "createdTime",
      valueType: "date",
      hideInSearch: true,
      sorter: (a, b) => moment(a.createdTime).unix() - moment(b.createdTime).unix()
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titlebatchNumber"
          defaultMessage="Batch Number"
        />
      ),
      dataIndex: "batchNumber",
      sorter: (a, b) => a.batchNumber ? a.batchNumber.localeCompare(b.batchNumber) : ''
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleTeacher"
          defaultMessage="Teacher Name"
        />
      ),
      dataIndex: "teacherName",
      sorter: (a, b) => a.teacherName ? a.teacherName.localeCompare(b.teacherName) : ''

    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.ruleName.nameStudent"
          defaultMessage="Student Name"
        />
      ),
      dataIndex: "studentName",
      sorter: (a, b) => a.studentName ? a.studentName.localeCompare(b.studentName) : ''
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titlelessonNumber"
          defaultMessage="Current Lesson"
        />
      ),
      dataIndex: "currentLessonNumber",
      hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleAssessmentStatus"
          defaultMessage="Assessment status"
        />
      ),
      dataIndex: "status",
      valueEnum: {
        "DUE": {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.DUE" defaultMessage="DUE" />
          ),
          status: 'DUE',
        },
        "COMPLETED": {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.COMPLETED" defaultMessage="COMPLETED" />
          ),
          status: 'COMPLETED',
        }
      }
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleScores"
          defaultMessage="scores"
        />
      ),
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <p>{entity.scores ? entity.scores.map((score) => score.score).join("  ") : ''}</p>
        );
      },
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titletotalMarks"
          defaultMessage="Total Score"
        />
      ),
      dataIndex: "totalScore",
      hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleMastry"
          defaultMessage="Individual Mastery"
        />
      ),
      hideInSearch: true,
      render: (value) => {
        const totalValue = value.scores ? value.scores.length : 'NA'
        //console.log('tv', totalValue)
        //console.log('value', value.scores?value.scores.length:'')
        const totalMarks = `${parseFloat((value.totalScore / totalValue) * 100).toFixed(2)} %`
        if (totalMarks == 'NaN %') {
          return `0 %`
        } else {
          return totalMarks
        }
      }
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleVocalScore"
          defaultMessage="Vocab Score"
        />
      ),
      hideInSearch: true,
      dataIndex: "vocabScore"
      // render: (value)=>{
      //     //console.log('vv', value.vocabScore)
      //     return <Rate allowHalf disabled defaultValue={value.vocabScore} style = {{color: "black", fontSize: 10}}/>
      //   }
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titlepScore"
          defaultMessage="Pronounciation Score"
        />
      ),
      hideInSearch: true,
      dataIndex: "pronunciationScore"
      // render: (value)=>{
      //     return <Rate allowHalf disabled defaultValue={value.pronunciationScore} style = {{color: "black", fontSize: 10}}/>
      //   }
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleCScore"
          defaultMessage="Confidence Score"
        />
      ),
      hideInSearch: true,
      dataIndex: "confidenceScore"
      // render: (value)=>{
      //     return <Rate allowHalf disabled defaultValue={value.confidenceScore} style = {{color: "black", fontSize: 10}}/>
      //   }
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleFSScore"
          defaultMessage="Free Speech Score"
        />
      ),
      hideInSearch: true,
      dataIndex: "freeSpeechScore"
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleComment"
          defaultMessage="Comments"
        />
      ),
      dataIndex: "comment",
      hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleView"
          defaultMessage="Edit"
        />
      ),
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              console.log(entity)
              setShowDetail(true);
              handleShowDetails(entity.id);
              setFormVisible(true);
            }}
          >
            <EditOutlined />
          </a>
        );
      },
    },
  ];

  const handleShowDetails = async (id) => {
    try {
      let msg = await detailsAssessment(id);
      if (msg.status === "ok") {
        console.log("API call sucessfull", msg);
      }
      setAssessmentDetails(msg);
      console.log('view one', msg);
    } catch (error) {
      console.log("error", error);
    }
  };

  console.log('asse', assessmentDetails)

  return (
    <PageContainer>
      <>
        <ProTable<API.RuleListItem, API.PageParams>
          headerTitle={intl.formatMessage({
            id: "pages.searchTable.titleAssessment",
            defaultMessage: "Assessment Management",
          })}
          actionRef={actionRef}
          rowKey="key"
          search={{
            labelWidth: 120,
          }}
          request={allAssessment}
          columns={columns}
        />
      </>

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
        <AssessmentForm assessmentData={assessmentDetails} />
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
