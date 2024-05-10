import {
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  Button,

  Drawer,

  Spin,
} from "antd";
import React, { useState, useRef } from "react";
import { useIntl, FormattedMessage, useAccess, Access } from "umi";
import { PageContainer } from "@ant-design/pro-layout";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";
import UploadStudentsBulkWithoutRMN from "../StudentList/components/UploadStudentsBulkWithoutRMN";


import {
  studentsBatches,

} from "@/services/ant-design-pro/api";


import "./index.css";

import Tabsedit from "@/components/Formedit/tabs";
import HistoryTable from "@/components/HistoryTab/tableView";
import ReBatch from "@/components/Student/rebatch";
import ExportStudentList from "./components/ExportStudentList";
import UserForm from "../StudentList/components/UserForm";


const StudentsBatchList: React.FC = () => {
  //Role Based Access
  const access = useAccess();
  const url = new URL(window.location.href);

  //props for drawer
  const [tmpData, setTmpData] = useState<any>();
  const [studentManageredit, setstudentManageredit] = useState<boolean>(false);
  const [studentManageradd, setstudentManageradd] = useState<boolean>(false);
  const [visibleEdit, setVisibleEdit] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [visibleHistoryTab, setVisibleHistoryTab] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedStudentData, setSelectedStudentData] = useState<any>();
  const [reassignModal, setReassignModal] = useState<boolean>(false);
  const [exportProps, setExportProps] = useState<{
    total: number;
    [key: string]: any;
  }>();

  const showReassignBatchModal = () => {
    setReassignModal(true);
  };

  //add drawer
  const showDrawer = () => {
    setVisible(true);
    setstudentManageradd(true);
    setstudentManageredit(false);
  };
  const onClose = () => {
    setReassignModal(false);
    setVisible(false);
    seteditvisible(false);
  };

  //edit drawer
  const showDrawerEdit = () => {
    setVisibleEdit(true);
    setstudentManageredit(true);
    setstudentManageradd(false);
  };
  const onCloseEdit = () => {
    setVisibleEdit(false);
    setVisibleHistoryTab(false);
  };

  //props for columns
  const intl = useIntl();
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<API.RuleListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.firstName.nameLabel"
          defaultMessage="Name"
        />
      ),
      dataIndex: "name",
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.schoolName"
          defaultMessage="School Name"
        />
      ),
      dataIndex: "schoolName",
      hideInTable: url.toString().indexOf("/school/") < 0,
      // hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titlemobile"
          defaultMessage="Primary Mobile No"
        />
      ),
      dataIndex: "phoneNumber",
      copyable: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleemail"
          defaultMessage="Email"
        />
      ),
      dataIndex: "email",
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleprm"
          defaultMessage="PRM Name"
        />
      ),
      dataIndex: "prm",
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleStudentID"
          defaultMessage="ID"
        />
      ),
      dataIndex: "id",
      hideInTable: url.toString().indexOf("/school/") >= 0,
      copyable: true,
      hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleLeadID"
          defaultMessage="Student ID"
        />
      ),
      dataIndex: "studentID",
      copyable: true,
      // hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titlebatchcode"
          defaultMessage="Batch Code"
        />
      ),
      dataIndex: "batchCode",
      //hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleage"
          defaultMessage="Age"
        />
      ),
      hideInTable: url.toString().indexOf("/school/") >= 0,
      dataIndex: "age",
      hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titlestatus"
          defaultMessage="Status"
        />
      ),
      dataIndex: "status",
      hideInForm: true,
      valueEnum: {
        enrolled: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.enrolled"
              defaultMessage="Enrolled"
            />
          ),
          status: "enrolled",
        },
        startclasslater: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.startclasslater"
              defaultMessage="Start Class Later"
            />
          ),
          status: "startclasslater",
        },
        batching: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.batching"
              defaultMessage="Batching"
            />
          ),
          status: "batching",
        },
        onboarding: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.onboarding"
              defaultMessage="Onboarding"
            />
          ),
          status: "onboarding",
        },
        onboardingIssue: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.onboardingIssue"
              defaultMessage="Onboarding Issue"
            />
          ),
          status: "onboardingIssue",
        },
        active: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.active"
              defaultMessage="Active"
            />
          ),
          status: "Active",
        },
        inactive: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.inactive"
              defaultMessage="InActive"
            />
          ),
          status: "InActive",
        },
        Error: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.error"
              defaultMessage="Error"
            />
          ),
          status: "Error",
        },
      },
    },

    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.titleedit"
          defaultMessage="Edit"
        />
      ),
      dataIndex: "edit",
      hideInSearch: true,

      render: (dom: any, entity: any) => {
        return (
          <a
            onClick={() => {
              setTmpData(entity);
              showDrawerEdit();
              setVisibleEdit(true);
              seteditvisible(true);
              setstudentManageredit(true);
            }}
          >
            <EditOutlined />
          </a>
        );
      },
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.titlePaymentHistory"
          defaultMessage="History"
        />
      ),
      dataIndex: "paymentHistory",
      hideInSearch: true,
      render: (dom: any, entity: { id: any }) => {
        return (
          <a
            onClick={() => {
              setTmpData(entity.id);
              setVisibleEdit(true);
              setVisibleHistoryTab(true);
            }}
          >
            <EyeOutlined />
          </a>
        );
      },
    },
  ];


  return (
    <PageContainer>
      <ProTable<API.RuleListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: "pages.searchTable.titleTeacher",
          defaultMessage: "Student Management",
        })}
        actionRef={actionRef}
        search={{
          labelWidth: 120,
        }}
        request={async (params) => {
          try {
            const res = await studentsBatches({
              ...params,
              offlineUser: url.toString().indexOf("/school/") >= 0 ? 1 : 0,
            });
            setExportProps({
              ...params,
              total: res.total,
              offlineUser: url.toString().indexOf("/school/") >= 0 ? 1 : 0,
            });
            return res;
          } catch (error) {
            return error;
          }
        }}
        columns={columns}
        toolBarRender={() => [
          <div>
            <Access
              accessible={
                access.canSuperAdmin ||
                access.canProgramManager ||
                access.canPMHead
              }
              fallback={<div> </div>}
            >
              <ExportStudentList {...exportProps} />

              {url.toString().indexOf("/school/") >= 0 && (
                <>
                  <Button
                    type="primary"
                    key="primary"
                    style={{ marginRight: "5px" }}
                    disabled={selectedRowKeys.length === 0}
                    onClick={showReassignBatchModal}
                    onChange={() => setstudentManageradd(true)}
                  >
                    Re-Batch Student
                  </Button>
                  <UploadStudentsBulkWithoutRMN />,
                </>
              )}

              <Button
                type="primary"
                key="primary"
                onClick={showDrawer}
                onChange={() => setstudentManageradd(true)}
              >
                Add Student
              </Button>
            </Access>
          </div>,
          <>
            <Drawer
              title="Add Student"
              placement="right"
              onClose={onClose}
              open={visible}
              width={1100}
              destroyOnClose
            >
              {url.toString().indexOf("/school/") >= 0 ? (
                <UserForm
                  userData={{
                    offlineUser: "1",
                    type: "student"
                  }}
                  visible={visible}
                  disabled={{
                    offlineUser: true,
                    type: true,
                  }}
                />
              ) : (
                <Tabsedit
                  tmpData={tmpData}
                  studentManageradd={studentManageradd}
                />
              )}
            </Drawer>

            <Drawer
              title="Re-Batch Student"
              placement="right"
              onClose={onClose}
              open={reassignModal}
              width={1100}
              destroyOnClose
            >
              <ReBatch
                selectedStudentData={selectedStudentData}
                reassignModal={reassignModal}
              />
            </Drawer>
          </>,
        ]}
        rowKey={(record: any) => record?.id ?? Math.random()}
        pagination={{ position: ["topRight", "bottomRight"] }}
        //the checkbox
        rowSelection={{
          getCheckboxProps: () => {
            if (url.toString().indexOf("/school/") < 0) {
              return { disabled: true };
            }
          },
          preserveSelectedRowKeys: true,
          onChange: (selectedRows, record) => {
            setSelectedRowKeys(selectedRows);
            setSelectedStudentData(record);
          },
        }}
      />

      <Spin>
        <Drawer
          title={!visibleHistoryTab ? "Edit Student" : "History"}
          placement="right"
          onClose={onCloseEdit}
          open={visibleEdit}
          width={1200}
          destroyOnClose
        >
          {!visibleHistoryTab ? (
            <Tabsedit
              tmpData={tmpData}
              studentManageredit={studentManageredit}
            />
          ) : (
            <HistoryTable tmpData={tmpData} />
          )}
        </Drawer>
      </Spin>
    </PageContainer>
  );
};

export default StudentsBatchList;
