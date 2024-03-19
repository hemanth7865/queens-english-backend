// @ts-nocheck
import { EditTwoTone } from '@ant-design/icons';
import { Button, Drawer, Row } from 'antd';
import React, { useState, useRef, useMemo } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { getAllEmployee } from '@/services/ant-design-pro/api';

import EmployeeForm from './components/EmployeeForm';

const TableList: React.FC = () => {

  const [visibleEditDrawer, setVisibleEditDrawer] = useState<boolean>(false);
  const [visibleAddDrawer, setVisibleAddDrawer] = useState<boolean>(false);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState<API.RuleListItem>();
  const [edit,setEdit] = useState<boolean>(false)
  const actionRef = useRef<ActionType>();
  const intl = useIntl();

  

  const columns: ProColumns<API.RuleListItem>[] = useMemo(
    () => [
    // name
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.admin.name"
          defaultMessage="Name"
        />
      ),
      dataIndex: 'name',
      copyable: true,
      render: (_, entity) => `${entity?.firstname} ${entity?.lastname}`,
    },
    // mobile
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.admin.phone"
          defaultMessage="Mobile"
        />
      ),
      dataIndex: 'phone',
      render: (text) => {
        if (text && text.length >= 10) {
          const countryCode = text.slice(0, text.length - 10);
          const lastTenDigits = text.slice(-10);
          const formattedNumber = `${countryCode} ${lastTenDigits}`;
          return formattedNumber;
        }
        return text;
      },
    },
    // email
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.admin.email"
          defaultMessage="Email"
        />
      ),
      dataIndex: 'email',
      hideInSearch: true,
    },
    // role
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.admin.role"
          defaultMessage="Role"
        />
      ),
      dataIndex: "role",
      hideInForm: true,
      valueEnum: {
        'superadmin': {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.superadmin"
              defaultMessage="Superadmin"
            />
          ),
        },
        'admin': {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.admin"
              defaultMessage="Admin"
            />
          ),
        },
        'pmhead': {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.pmhead"
              defaultMessage="PM Head"
            />
          ),
        },
        'programmanager': {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.programmanager"
              defaultMessage="Program Manager"
            />
          ),
        },
        'sales': {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.sales"
              defaultMessage="Sales"
            />
          ),
        },
        'saleshead': {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.saleshead"
              defaultMessage="Saleshead"
            />
          ),
        },
        'finance': {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.finance"
              defaultMessage="Finance"
            />
          ),
        },
      },
    },
    // status
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.admin.status"
          defaultMessage="Status"
        />
      ),
      dataIndex: "status",
      hideInForm: true,
      valueEnum: {
        active: {
          text: (
            <FormattedMessage
              id="pages.searchTable.admin.active"
              defaultMessage="Active"
            />
          ),
          status: 'Success',
        },
        inactive: {
          text: (
            <FormattedMessage
              id="pages.searchTable.admin.inactive"
              defaultMessage="Inactive"
            />
          ),
          status: 'Error',
        },
      },
    },
    // Edit icon
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleedit"
          defaultMessage="Edit"
        />
      ),
      dataIndex: "edit",
      hideInSearch: true,
      render: (_, entity) => {
        return (
          <a
            onClick={() => {
              setSelectedEmployeeData(entity);
              setVisibleEditDrawer(true);
              setEdit(true)
            }}
          >
            <EditTwoTone />
          </a>
        );
      },
    },
  ],
    []
    );

  return (
    <PageContainer>
      <ProTable<API.RuleListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.titleEmployee',
          defaultMessage: 'Employee Management',
        })}
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        request={getAllEmployee}
        columns={columns}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={()=>{
              setVisibleAddDrawer(true)
              setEdit(false)
              setSelectedEmployeeData(null)
            }}
          >
            Add Employee
          </Button>,
          <Drawer
            title="Add Employee"
            placement="right"
            onClose={()=>setVisibleAddDrawer(false)}
            visible={visibleAddDrawer}
            width={500}
          >
            
            <EmployeeForm edit={edit} employeeData={null} visible={visibleAddDrawer}  setVisible={setVisibleAddDrawer} ADD="add"/>
          </Drawer>
        ]}
      />

      {/* Drawer for Edit employee */}
      <Drawer
        title="Edit Employee"
        placement="right"
        onClose={() => {
          setVisibleEditDrawer(false);
        }}
        visible={visibleEditDrawer}
        width={500}
        key={selectedEmployeeData?.id}
      >
       
        <EmployeeForm edit={edit} employeeData={selectedEmployeeData || null} visible={visibleEditDrawer}  setVisible={setVisibleEditDrawer} />
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
