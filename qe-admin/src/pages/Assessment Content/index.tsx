import React, { useRef } from "react";
import { useIntl, FormattedMessage, Access, useAccess } from "umi";
import { PageContainer } from "@ant-design/pro-layout";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";
import { getAssessmentQuestions } from "@/services/ant-design-pro/api";
import { Button, Drawer } from "antd";
import AssessmentContentForm from "./components/Form";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

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
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.assessmentContent.setNumber"
          defaultMessage="Set Number"
        />
      ),
      dataIndex: "setNumber",
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
      hideInTable: true,
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
      hideInTable: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.assessmentContent.edit"
          defaultMessage="Actions"
        />
      ),
      dataIndex: "actions",
      valueType: "option",
      render: (_, record) => (
        <>
          <Access
            accessible={access.canSuperAdmin}
            fallback={<div> </div>}
          >
            <EditOutlined title="Edit Assessment Questions" onClick={() => {
                setVisible(true);
                setData(record);
                setOperation("update");
              }}
              style={{ marginRight: 16, color: "dodgerblue" }} />
            <DeleteOutlined title="Delete Assessment Questions" disabled />
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
                  + Add Assessment Set
                </Button>
              </Access>
            </div>
          ]}
        />
        <Drawer open={visible} onClose={() => { setVisible(false); setData(undefined); }} destroyOnClose width={1300} title="Add Assessment Content">
          <AssessmentContentForm assessmentData={data} operationType={operation} actionRef={actionRef} handleDrawerVisiblity={(visibility: boolean | ((prevState: boolean) => boolean)) => setVisible(visibility)} />
        </Drawer>
      </>
    </PageContainer>
  );
};

export default AssessmentContentTable;
