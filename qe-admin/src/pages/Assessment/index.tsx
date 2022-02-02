// @ts-nocheck
import { PlusOutlined } from "@ant-design/icons";
import { Button, message, Input, Drawer } from "antd";
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
  getAllAssessments
} from "@/services/ant-design-pro/api";
import { EyeOutlined } from "@ant-design/icons";

const TableList: React.FC = () => {
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState("");

  const intl = useIntl();

  const columns: ProColumns<API.RuleListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleDate"
          defaultMessage="Date"
        />
      ),
      dataIndex: "date",
      valueType: "date",
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.ruleName.nameStudent"
          defaultMessage="Student Name"
        />
      ),
      dataIndex: "students",
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleTeacher"
          defaultMessage="Teacher Name"
        />
      ),
      dataIndex: "teacher",
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titlebatchNo"
          defaultMessage="Batch Number"
        />
      ),
      dataIndex: "batchId",
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleAssessmentStatus"
          defaultMessage="Assessment status"
        />
      ),
      dataIndex: "attendence",
      hideInSearch: true,
      valueEnum: {
        0: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.Absent"
              defaultMessage="Due"
            />
          ),
          status: "Absent",
        },
        1: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.Present"
              defaultMessage="Completed"
            />
          ),
          status: "Present",
        }
      }
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titlescoredMarks"
          defaultMessage="Scored Marks"
        />
      ),
      dataIndex: "scoredMarks",
      hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titletotalMarks"
          defaultMessage="Total Marks"
        />
      ),
      dataIndex: "totalMarks",
      hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titlemastry"
          defaultMessage="Mastery %"
        />
      ),
      dataIndex: "mastery",
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          `${parseFloat((entity.scoredMarks/entity.totalMarks)*100).toFixed(2)} %`
        );
      },
    },
    // {
    //   title: (
    //     <FormattedMessage
    //       id="pages.searchTable.titleView"
    //       defaultMessage="view"
    //     />
    //   ),
    //   dataIndex: "view",
    //   hideInSearch: true,
    //   render: (dom, entity) => {
    //     return (
    //       <a
    //         onClick={() => {
    //           console.log("entity", entity);
    //           setCurrentRow(entity);
    //           setShowDetail(true);
    //         }}
    //       >
    //         <EyeOutlined />
    //       </a>
    //     );
    //   },
    // },
  ];

  return (
    <PageContainer>
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
        request={getAllAssessments}
        columns={columns}
      />

      <Drawer
        width={600}
        visible={showDetail}
        title="VIEW"
        onClose={() => {
          setShowDetail(false);
        }}
        closable={false}
      >
        {Math.floor((currentRow.scoredMarks/currentRow.totalMarks)*100)}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
