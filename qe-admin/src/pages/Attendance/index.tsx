import { EditTwoTone } from '@ant-design/icons';
import { Drawer, Spin, Select, DatePicker } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { getAllAttendance } from '@/services/ant-design-pro/api';
import EditAttendance from "./Components/AttendanceForm";
import moment from "moment";

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */

const TableList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [tempData, setTempData] = useState<any>(null);

  const [showEditAttendance, setShowEditAttendance] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const intl = useIntl();

  const { RangePicker } = DatePicker;

  const columns: ProColumns<API.RuleListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleStudentID"
          defaultMessage="Student ID"
        />
      ),
      dataIndex: "studentId",
      fixed: "left",
      width: 250,
      copyable: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleStudentName"
          defaultMessage="Student Name"
        />
      ),
      dataIndex: "name",
      width: 140,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleBatchNumber"
          defaultMessage="Batch Number"
        />
      ),
      dataIndex: "batchNumber",
      width: 140,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleTeacherName"
          defaultMessage="Teacher Name"
        />
      ),
      dataIndex: "teacherName",
      width: 140,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleStudentAttended"
          defaultMessage="Student Attended"
        />
      ),
      dataIndex: "studentAttended",
      width: 140,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleDateAttended"
          defaultMessage="Date Attended"
        />
      ),
      dataIndex: "dateAttended",
      width: 140,
      renderFormItem: (value) => {
        return <RangePicker format="DD-MM-YYYY" />;
      },
      search: {
        transform: (value: any) => {
          const startDate = moment(value[0]).format('YYYY-MM-DD');
          const endDate = moment(value[1]).format('YYYY-MM-DD');
          return { startDate: startDate, endDate: endDate };
        },
      },
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleedit"
          defaultMessage="Operations"
        />
      ),
      dataIndex: "edit",
      hideInSearch: true,
      fixed: "right",
      width: 100,
      render: (dom, entity: any) => {
        return (
          <div>
            <a
              onClick={() => {
                setTempData(entity);
                setShowEditAttendance(true);
              }}
              style={{ marginLeft: 10 }}
            >
              <EditTwoTone title="Edit" />
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
              id: "pages.searchTable.titleUser",
              defaultMessage: "Attendance Management",
            })}
            actionRef={actionRef}
            rowKey="key"
            search={{
              labelWidth: 120,
            }}
            request={getAllAttendance}
            columns={columns}
            scroll={{
              x: 750,
            }}
          />
        </Spin>
      </PageContainer>
      <Drawer
        visible={showEditAttendance}
        onClose={() => {
          setShowEditAttendance(false);
          setTempData(null);
        }}
        width={600}
      >
        <EditAttendance
          attendanceData={tempData}
          setShowEditAttendance={setShowEditAttendance}
          showEditAttendance={showEditAttendance}
          actionRef={actionRef}
        />
      </Drawer>
    </>
  );
};

export default TableList;
