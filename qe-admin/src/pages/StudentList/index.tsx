import { EditTwoTone } from '@ant-design/icons';
import { Button, notification, Drawer, Row } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';

import { studentBatches, userBatchesView } from '@/services/ant-design-pro/api';
import DeactiveStudentsInBulk from './components/DeactiveStudentsInBulk';
import UserForm from './components/UserForm';

const TableList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [visible, setVisible] = useState<boolean>(false);
  const [visibleEdit, setVisibleEdit] = useState<boolean>(false);
  const [tempDataEdit, setTempDataEdit] = useState<undefined | any>(undefined);


  const intl = useIntl();

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const handleOneDisplay = async (id: any) => {
    try {
      let msg = await userBatchesView(id);
      setTempDataEdit(msg?.data);
      setVisibleEdit(true);
      console.log('view one', msg);
    } catch (error) {
      console.log("error", error);
    }
  }




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
          id="pages.searchTable.schoolName"
          defaultMessage="School Name"
        />
      ),
      dataIndex: "schoolName",
      render: (dom, entity: any) => {
        return <Row justify={'space-between'}>
          <span>{entity?.school?.schoolName}</span>
        </Row>
      }
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
      render: (_, entity: any) => {
        return (
          <a
            onClick={async () => {
              await handleOneDisplay(entity?.id)

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
          <DeactiveStudentsInBulk />,
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
            open={visible}
            width={500}
          >
            <UserForm userData={tempDataEdit} visible={visible}
              isEdit={false}
            />
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
        open={visibleEdit}
        width={500}>
        <UserForm userData={tempDataEdit} visible={visibleEdit}
          isEdit={true}
        />
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
