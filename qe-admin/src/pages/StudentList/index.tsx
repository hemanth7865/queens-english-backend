// @ts-nocheck
import { PlusOutlined, ClockCircleOutlined, EyeOutlined, EditTwoTone } from '@ant-design/icons';
import { NotificationInstance as RCNotificationInstance } from 'rc-notification/lib/Notification';
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
import { studentBatches, userBatchesView } from '@/services/ant-design-pro/api';
import AddUser from './components/AddUser';
import EditUser from './components/EditUser';
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
  const [tempDataEdit, setTempDataEdit] = useState({});

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

  const handleOneDisplay = async (id) => {
    try {
      let msg = await userBatchesView(id);
      if (msg.status === "ok") {
        console.log("API call successfull", msg);
      }
      setTempDataEdit(msg.data);
      console.log('view one', msg);
    } catch (error) {
      console.log("error", error);
    }
  }

  const openNotificationWithIcon = (type, msg = { status: 200, data: '' }, userType = 'Teacher') => {
    notification[type]({
      message: type === 'error' ? msg.data : 'Successfully Registered or Updated  ' + userType + ' !!!! ',
      description:
        '',
    });
    setTimeout(() => {
      window.location.reload()
    }, 1000);
  };


  const columns: ProColumns<API.RuleListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.firstName.nameLabel"
          defaultMessage="Name"
        />
      ),
      dataIndex: 'name',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titlemobile"
          defaultMessage="Mobile"
        />
      ),
      dataIndex: 'phoneNumber',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleemail"
          defaultMessage="Email"
        />
      ),
      dataIndex: 'email',
      hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleType"
          defaultMessage="User Type"
        />
      ),
      dataIndex: "type",
      hideInForm: true,
      valueEnum: {
        'teacher': {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.teacher"
              defaultMessage="Teacher"
            />
          ),
          status: "Teacher",
        },
        'student': {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.student"
              defaultMessage="Student"
            />
          ),
          status: "Student",
        },
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
              console.log('entity', entity)
              handleOneDisplay(entity.id)
              setVisibleEdit(true)
              setTempData(entity);
            }}>
            <EditTwoTone />
          </a>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.RuleListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.titleUser',
          defaultMessage: 'User Management',
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
            Add User
          </Button>,
          <Drawer
            title="Add User"
            placement="right"
            onClose={onClose}
            visible={visible}
            width={500}
          >
            <AddUser setVisible={setVisible} />
          </Drawer>
        ]}
      />

      {/* Drawer for Edit student */}
      <Drawer
        title="Edit User"
        placement="right"
        onClose={() => {
          setVisibleEdit(false)
        }}
        visible={visibleEdit}
        width={500}>
        <EditUser data={tempDataEdit} visible={visibleEdit} setVisible={setVisibleEdit} />
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
