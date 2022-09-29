import { EditTwoTone, WhatsAppOutlined, LinkOutlined, MoneyCollectTwoTone, PlusSquareTwoTone, ReloadOutlined, EyeOutlined, InfoCircleTwoTone, SyncOutlined } from '@ant-design/icons';
import { Button, Drawer, Modal, Popover, Typography, Spin, Select, DatePicker, message } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { getAllAttendance } from '@/services/ant-design-pro/api';
import EditAttendance from "./components/index";

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const { Option } = Select;

const TableList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();

  const [visible, setVisible] = useState<boolean>(false);
  const [visibleEdit, setVisibleEdit] = useState<boolean>(false);
  const [visibleAdd, setVisibleAdd] = useState<boolean>(false);
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
      width: 160,
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
        <EditAttendance attendanceData={tempData} />
      </Drawer>
    </>
  );
};

export default TableList;
