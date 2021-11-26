// @ts-nocheck
import { PlusOutlined, ClockCircleOutlined, EyeOutlined, EditTwoTone  } from '@ant-design/icons';
import { Button, message, Input, Drawer, Tooltip } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';
import {studentBatches } from '@/services/ant-design-pro/api';
import AddStudent from './components/AddStudent';
import EditStudent from './components/EditStudent';
import ViewStudent from './components/ViewStudent';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */

const TableList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [currentRowEdit, setCurrentRowEdit] = useState();

  const [visible, setVisible] = useState<boolean>(false);
  const [visibleEdit, setVisibleEdit] = useState<boolean>(false);
  const [tempData, setTempData] = useState();

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const onCloseEdit = () => {
    setVisibleEdit(false);
  };

  const columns: ProColumns<API.RuleListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.name.nameLabel"
          defaultMessage="Name"
        />
      ),
      dataIndex: 'name',
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleId" defaultMessage="ID" />,
      dataIndex: 'id',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titlebatchCode"
          defaultMessage="Batch Code"
        />
      ),
      dataIndex: 'batchCode',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titlestartDate"
          defaultMessage="Start Date"
        />
      ),
      dataIndex: 'startDate',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleendDate"
          defaultMessage="End Date"
        />
      ),
      dataIndex: 'endDate',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titlemobile"
          defaultMessage="Mobile"
        />
      ),
      dataIndex: 'mobile',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleclassType"
          defaultMessage="Class Type"
        />
      ),
      dataIndex: 'classType',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleclassAttended"
          defaultMessage="Class Attended"
        />
      ),
      dataIndex: 'classAttended',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleStatus"
          defaultMessage="Status"
        />
      ),
      dataIndex: "status",
      hideInForm: true,
      valueEnum: {
        0: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.active"
              defaultMessage="Active"
            />
          ),
          status: "active",
        },
        1: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.leave"
              defaultMessage="Leave"
            />
          ),
          status: "Leave",
        },
        2: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.onhold"
              defaultMessage="On Hold"
            />
          ),
          status: "On Hold",
        },
      },
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleSlots"
          defaultMessage="Time Slots"
        />
      ),
      dataIndex: "slots",
      render: (dom, entity) => {
        return (
          <a>
            <ClockCircleOutlined />
          </a>
        );
      },
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleview"
          defaultMessage="View"
        />
      ),
      dataIndex: "view",
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <a
          onClick={() => {
            setCurrentRow(entity);
            setShowDetail(true);
          }}>
            <EyeOutlined />
          </a>
        );
      },
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleedit"
          defaultMessage="Edit"
        />
      ),
      dataIndex: "edit",
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <a
          onClick={() => {
            setVisibleEdit(true);
            setTempData(entity);
          }}>
            <EditTwoTone />
          </a>
        );
      },
    }

  ];

  return (
    <PageContainer>
      <ProTable<API.RuleListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.title',
          defaultMessage: 'Enquiry form',
        })}
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        request={studentBatches}
        columns={columns}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={showDrawer}
          >
           Add Student
          </Button>,
          <Drawer
            title="Add Teacher"
            placement="right"
            onClose={onClose}
            visible={visible}
            width={500}
          >
            <AddStudent />
          </Drawer>
        ]}
      />

      {/* Drawer for view student */}
      <Drawer
        width={600}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {console.log('current row', currentRow)}
        <ViewStudent details = {currentRow}/>
      </Drawer>
      
      {/* Drawer for Edit student */}
     <Drawer 
      title="Edit Teacher"
      placement="right"
      onClose={onCloseEdit}
      visible={visibleEdit}
      width={500}>
      {console.log('current row edit', tempData)}
      <EditStudent data = {tempData}/>
     </Drawer>
    </PageContainer>
  );
};

export default TableList;
