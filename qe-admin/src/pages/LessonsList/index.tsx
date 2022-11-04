import { EditTwoTone, EyeTwoTone } from '@ant-design/icons';
import { Drawer, Spin, Select, DatePicker, message } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { getAllLessons } from '@/services/ant-design-pro/api';
import View from "./Components/View";

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */

const TableList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [tempData, setTempData] = useState<any>(null);

  const [showView, setShowView] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const intl = useIntl();

  const columns: ProColumns<API.RuleListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.lessonNumber"
          defaultMessage="Lesson Number"
        />
      ),
      dataIndex: "number",
      fixed: "left",
      width: 250,
      copyable: true,
      hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.lessonId"
          defaultMessage="ID"
        />
      ),
      dataIndex: "id",
      width: 140,
      copyable: true,
      hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleOperations"
          defaultMessage="Operations"
        />
      ),
      dataIndex: "operations",
      hideInSearch: true,
      fixed: "right",
      width: 100,
      render: (dom, entity: any) => {
        return (
          <div>
            <a
              onClick={() => {
                setTempData(entity);
                setShowView(true);
              }}
              style={{ marginLeft: 10 }}
            >
              <EyeTwoTone title="View" />
            </a>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageContainer>
        <Spin spinning={isLoading}>
          <ProTable<API.RuleListItem, API.PageParams>
            headerTitle={intl.formatMessage({
              id: "pages.searchTable.titleAttendanceManagement",
              defaultMessage: "Attendance Management",
            })}
            actionRef={actionRef}
            rowKey="key"
            search={{
              labelWidth: 120,
            }}
            request={async (params) => {
              return { data: await getAllLessons({}) }
            }}
            columns={columns}
            scroll={{
              x: 750,
            }}
          />
        </Spin>
      </PageContainer>
      <Drawer
        visible={showView}
        onClose={() => {
          setShowView(false);
          setTempData(null);
        }}
        width={600}
      >
        <View
          data={tempData}
        />
      </Drawer>
    </>
  );
};

export default TableList;
