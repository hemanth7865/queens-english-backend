import React, { useEffect, useRef } from "react";
import { useIntl, FormattedMessage, Access, useAccess } from "umi";
import { PageContainer } from "@ant-design/pro-layout";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";
import { getAssessments } from "@/services/ant-design-pro/api";
import { Button, Drawer } from "antd";
import AssessmentContentForm from "./components/Form";
import { EditOutlined } from "@ant-design/icons";

const AssessmentContentTable: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const intl = useIntl();
  const [visible, setVisible] = React.useState(false);
  const [data, setData] = React.useState<API.AssessmentItem | undefined>();
  const [operation, setOperation] = React.useState<"create" | "update">("create");


  const columns: ProColumns<API.AssessmentItem>[] = [

    {
      title: (
        <FormattedMessage
          id="pages.searchTable.assessmentContent.name"
          defaultMessage="Name"
        />
      ),
      dataIndex: "displayName",
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
          id="pages.searchTable.assessmentContent.active"
          defaultMessage="Status"
        />
      ),
      dataIndex: "active",
      valueType: "select",
      valueEnum: {
        true: {
          text: (
            <span style={{ color: "green" }}>
              <FormattedMessage
                id="pages.searchTable.assessmentContent.active.true"
                defaultMessage="Active"
              />
            </span>
          ),
        },
        false: {
          text: (
            <span style={{ color: "red" }}>
              <FormattedMessage
                id="pages.searchTable.assessmentContent.active.false"
                defaultMessage="Inactive"
              />
            </span>
          ),
        },
      },
    },

    {
      title: (
        <FormattedMessage
          id="pages.searchTable.assessmentContent.date"
          defaultMessage="Date"
        />
      ),
      dataIndex: "date",
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
          </Access>
        </>
      ),
    }
  ];

  return (
    <PageContainer>
      <>
        <ProTable<API.AssessmentItem>
          headerTitle={intl.formatMessage({
            id: "pages.searchTable.titleAssessment",
            defaultMessage: "Assessment Content Management",
          })}
          actionRef={actionRef}
          rowKey="key"
          search={{
            labelWidth: 120,
          }}
          request={() => getAssessments({ isFreeSpeech: true })}
          columns={columns}
          toolBarRender={() => [
            <div>
              <Access
                accessible={access.canSuperAdmin}
                fallback={<div> </div>}
              >
                <Button type="primary" onClick={() => { setVisible(true); setOperation("create"); }}>
                  + Add Assessment
                </Button>
              </Access>
            </div>
          ]}
        />
        <Drawer open={visible} onClose={() => { setVisible(false); setData(undefined); }} destroyOnClose width={1300} title="Add Assessment Content">
          <AssessmentContentForm
            assessmentData={data}
            operationType={operation}
            actionRef={actionRef}
            handleDrawerVisiblity={(
              visibility: boolean | ((prevState: boolean) => boolean)
            ) => setVisible(visibility)}
          />
        </Drawer>
      </>
    </PageContainer>
  );
};

export default AssessmentContentTable;
