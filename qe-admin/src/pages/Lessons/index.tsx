import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  EditOutlined,
  MinusCircleOutlined
} from "@ant-design/icons";
import {
  Button,
  message,
  Input,
  Drawer,
  Form,
  Col,
  Row,
  Select,
  DatePicker,
  Checkbox,
  TimePicker,
  Tooltip,
  notification,
  Space,
  Spin,
  Tabs
} from "antd";
import React, { useState, useRef, useEffect } from "react";
import { useIntl, FormattedMessage } from "umi";

import { PageContainer } from "@ant-design/pro-layout";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";

import {
  teacherBatches,
  addTeacherSchedule,
  teacherBatchesView,
  teacherRemove,
} from "@/services/ant-design-pro/api";

import {
  handleAPIResponse
} from "@/services/ant-design-pro/helpers";

import "./index.css";
import moment from "moment";
import { parse, format } from "date-fns";
import PhoneNumberCountrySelect from "@/components/PhoneNumberCountrySelect";
import ViewDrawer from '../School/components/Drawers/viewDrawer';

const Lessons: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();

  const [isLoading, setIsLoading] = useState(false)

  
  useEffect(() => {
    
  }, []);

  const columns: ProColumns<API.SchoolItem>[] = [
    {
        title: (
            <FormattedMessage
                id="pages.searchTable.lesson.lessonName"
                defaultMessage="Lesson Name"
            />
        ),
        dataIndex: "lessonName",
        copyable: true,
    },
    {
        title: (
            <FormattedMessage
                id="pages.searchTable.lesson.createdAt"
                defaultMessage="Created At"
            />
        ),
        dataIndex: "createdAt",
        copyable: true,
    },
    {
        title: (
            <FormattedMessage
                id="pages.searchTable.lesson.modifiedAt"
                defaultMessage="Modified At"
            />
        ),
        dataIndex: "modifiedAt",
        copyable: true,
    },
    {
        title: (
            <FormattedMessage
                id="pages.searchTable.school.view"
                defaultMessage="View"
            />
        ),
        dataIndex: "view",
        hideInSearch: true,
        render: (dom, entity) => {
            return (
                <a
                >
                    <EyeOutlined />
                </a>
            );
        },
    },
    {
        title: (
            <FormattedMessage
                id="pages.searchTable.school.edit"
                defaultMessage="Edit"
            />
        ),
        dataIndex: "edit",
        hideInSearch: true,
        render: (dom, entity) => {
            return (
                <a
                >
                    <EditOutlined />
                </a>
            );
        },
    },
    {
      title: (
          <FormattedMessage
              id="pages.searchTable.school.delete"
              defaultMessage="Delete"
          />
      ),
      dataIndex: "delete",
      hideInSearch: true,
      render: (dom, entity) => {
          return (
              <a
              >
                  <DeleteOutlined />
              </a>
          );
      },
    },
];

  return (
    <PageContainer>
      <ProTable<API.RuleListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.titleLesson',
          defaultMessage: 'Lesson Management',
      })}
      actionRef={actionRef}
      rowKey="key"
      search={{
          labelWidth: 120,
      }}
      columns={columns}
      toolBarRender={() => [
          <Button
              type="primary"
              key="primary"
          >
              <PlusOutlined /> Create Lesson
          </Button>,
      ]}
      />
    </PageContainer>
  );
};

export default Lessons;