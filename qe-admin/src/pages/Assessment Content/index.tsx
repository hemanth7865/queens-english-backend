import React, { useRef } from "react";
import { useIntl, FormattedMessage, Access, useAccess } from "umi";
import { PageContainer } from "@ant-design/pro-layout";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";
import { getAssessmentQuestions } from "@/services/ant-design-pro/api";
import { Button, Drawer, Tabs } from "antd";
import AssessmentContentForm from "./components/Form";

export type AssessmentContentFormType = {
  setNumber: string;
  assessmentId: string;
  assessmentQuestion: [
    {
      number: string;
      question: string;
      answer: string;
      type: string;
      imageUrl?: string;
    }
  ],
  id: string;
  name: string;
  lessonNumber: string;
  lessonId: string;
};

const { TabPane } = Tabs;

const AssessmentContentTable: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const intl = useIntl();
  const [visible, setVisible] = React.useState(false);
  const [data, setData] = React.useState<AssessmentContentFormType | undefined>();
  const [operation, setOperation] = React.useState<"create" | "update">("create");

  const columns: ProColumns<AssessmentContentFormType>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.assessmentContent.lessonNumber"
          defaultMessage="Lesson Number"
        />
      ),
      dataIndex: "lessonNumber",
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.assessmentContent.name"
          defaultMessage="Name"
        />
      ),
      dataIndex: "name",
      hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.assessmentContent.setNumber"
          defaultMessage="Set Number"
        />
      ),
      dataIndex: "setNumber",
      hideInSearch: true,
      sortDirections: ["ascend", "descend"],
      sorter: (a, b) => a.setNumber.localeCompare(b.setNumber),
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.assessmentContent.id"
          defaultMessage="ID"
        />
      ),
      dataIndex: "id",
      copyable: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.assessmentContent.assessmentId"
          defaultMessage="Assessment ID"
        />
      ),
      dataIndex: "assessmentId",
      copyable: true,
      hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.assessmentContent.lessonId"
          defaultMessage="Lesson ID"
        />
      ),
      dataIndex: "lessonId",
      copyable: true,
      hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.assessmentContent.edit"
          defaultMessage="Edit"
        />
      ),
      dataIndex: "option",
      valueType: "option",
      render: (_, record) => (
        <>
          <Access
            accessible={access.canSuperAdmin}
            fallback={<div> </div>}
          >
            <a
              onClick={() => {
                setVisible(true);
                setData(record);
                setOperation("update");
              }}
            >
              Edit
            </a>
          </Access>
        </>
      ),
    }
  ];

  return (
    <PageContainer>
      <>
        <ProTable<AssessmentContentFormType>
          headerTitle={intl.formatMessage({
            id: "pages.searchTable.titleAssessment",
            defaultMessage: "Assessment Content Management",
          })}
          actionRef={actionRef}
          rowKey="key"
          search={{
            labelWidth: 120,
          }}
          request={getAssessmentQuestions}
          columns={columns}
          toolBarRender={() => [
            <div>
              <Access
                accessible={access.canSuperAdmin}
                fallback={<div> </div>}
              >
                <Button type="primary" onClick={() => { setVisible(true); setOperation("create"); }}>
                  Add Assessment Questions
                </Button>
              </Access>
            </div>
          ]}
        />
        <Drawer open={visible} onClose={() => { setVisible(false); setData(undefined); }} destroyOnClose width={720} title="Add Assessment Content">
          <AssessmentContentForm assessmentData={data} operationType={operation} />
        </Drawer>
      </>
    </PageContainer>
  );
};

export default AssessmentContentTable;
