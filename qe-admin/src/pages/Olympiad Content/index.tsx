import { getOlympiadQuestions } from "@/services/ant-design-pro/api";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-layout";
import type { ActionType, ProColumns } from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";
import { Button, Drawer } from "antd";
import React, { useRef } from "react";
import { Access, FormattedMessage, useAccess, useIntl } from "umi";
import OlympiadContentForm from "./components/Form";
import { GRADES, LEVELS, OlympiadContentFormType } from "./OlympiadUtils";

const OlympiadContentTable: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const intl = useIntl();
  const [visible, setVisible] = React.useState(false);
  const [data, setData] = React.useState<OlympiadContentFormType | undefined>();
  const [operation, setOperation] = React.useState<"create" | "update">("create");

  const createStatusMap = (levels: string[]): Record<string, {
    text: React.ReactNode;
    status: string;
  }> => {
    return levels.reduce((acc, level) => {
      const levelKey = `${level}`;
      const textId = `pages.searchTable.nameStatus.${levelKey}`;
      return {
        ...acc,
        [level]: {
          text: (<FormattedMessage id={textId} defaultMessage={levelKey} />),
          status: levelKey,
        },
      };
    }, {});
  };

  const columns: ProColumns<OlympiadContentFormType>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.olympiadContent.lessonNumber"
          defaultMessage="Level"
        />
      ),
      dataIndex: "level",
      valueEnum: createStatusMap(LEVELS)
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.olympiadContent.name"
          defaultMessage="Grade"
        />
      ),
      dataIndex: "grade",
      valueEnum: createStatusMap(GRADES)
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.olympiadContent.id"
          defaultMessage="ID"
        />
      ),
      dataIndex: "id",
      copyable: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.olympiadContent.edit"
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
            <EditOutlined title="Edit Olympiad Questions" onClick={() => {
              setVisible(true);
              setData(record);
              setOperation("update");
            }}
              style={{ marginRight: 16, color: "dodgerblue" }} />
            <DeleteOutlined title="Delete Olympiad Questions" disabled />
          </Access>
        </>
      ),
    }
  ];

  return (
    <PageContainer>
      <>
        <ProTable<OlympiadContentFormType>
          headerTitle={intl.formatMessage({
            id: "pages.searchTable.titleOlympiad",
            defaultMessage: "Olympiad Content Management",
          })}
          actionRef={actionRef}
          rowKey="key"
          search={{
            labelWidth: 120,
          }}
          request={getOlympiadQuestions}
          columns={columns}
          toolBarRender={() => [
            <div>
              <Access
                accessible={access.canSuperAdmin}
                fallback={<div> </div>}
              >
                <Button type="primary" onClick={() => { setVisible(true); setOperation("create"); }}>
                  + Add Olympiad Question
                </Button>
              </Access>
            </div>
          ]}
        />
        <Drawer open={visible} onClose={() => { setVisible(false); setData(undefined); }} destroyOnClose width={1300} title={`${operation === "update" ? "Edit" : "Add"} Olympiad Content`}>
          <OlympiadContentForm olympiadData={data} operationType={operation} actionRef={actionRef} handleDrawerVisiblity={(visibility: boolean | ((prevState: boolean) => boolean)) => setVisible(visibility)} />
        </Drawer>
      </>
    </PageContainer>
  );
};

export default OlympiadContentTable;
