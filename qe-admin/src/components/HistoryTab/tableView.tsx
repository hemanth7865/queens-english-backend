import React, { useRef, useState } from 'react';
import ProTable from "@ant-design/pro-table";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import { PageContainer } from '@ant-design/pro-layout';
import { FormattedMessage } from "umi";
import { getInstallmentHistory, getPaymentHistory } from '@/services/ant-design-pro/api';
import { EyeOutlined } from '@ant-design/icons';
import { Modal, Tabs } from 'antd';
import PaymentDataDetials from './dataDisplay';
import UpdatedRecordData from './updatedData';
import moment from 'moment';
const { TabPane } = Tabs;

export type Props = {
  tmpData: any;
};


const HistoryTable: React.FC<Props> = (props) => {

  const actionRef = useRef<ActionType>();
  const [dataDisplay, setDataDisplay] = useState(false);
  const [updatedDataDisplay, setUpdatedDataDisplay] = useState(false);
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();

  const PaymentColumns: ProColumns<API.RuleListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.id"
          defaultMessage="Id"
        />
      ),
      dataIndex: "id",
      hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleCreatedAt"
          defaultMessage="Created Date"
        />
      ),
      dataIndex: "createdAt",
      valueType: "date",
      hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleCreatedTimings"
          defaultMessage="Created Time"
        />
      ),
      dataIndex: "UpdatedAt",
      hideInSearch: true,
      render: (dom, entity: any) => {
        return (
          <div>{(moment(entity.createdAt)).format("hh:mm:ss")}</div>
        )
      }
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleTitle"
          defaultMessage="Title"
        />
      ),
      dataIndex: "title",
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.user"
          defaultMessage="User"
        />
      ),
      dataIndex: "debug",
      hideInSearch: true,
      render: (dom, entity: any) => {
        return (
          <div>{entity.debug.user.email}</div>
        )
      }
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleDebug"
          defaultMessage="old Record"
        />
      ),
      dataIndex: "debug",
      hideInSearch: true,
      render: (dom, entity: any) => {
        return (
          <a
            onClick={() => {
              setDataDisplay(true);
              setCurrentRow(entity.debug.oldRecord);
            }}
            style={{ marginLeft: 10 }}>
            <EyeOutlined title='View details' />
          </a>
        )
      }
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleDebug"
          defaultMessage="New Record"
        />
      ),
      dataIndex: "debug",
      hideInSearch: true,
      render: (dom, entity: any) => {
        return (
          <a
            onClick={() => {
              setDataDisplay(true);
              setCurrentRow(entity.debug.newRecord);
            }}
            style={{ marginLeft: 10 }}>
            <EyeOutlined title='View details' />
          </a>
        )
      }
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleUpdatedData"
          defaultMessage="Updated Data"
        />
      ),
      dataIndex: "debug",
      hideInSearch: true,
      render: (dom, entity: any) => {
        return (
          <a
            onClick={() => {
              setDataDisplay(true);
              setCurrentRow(entity.debug.updatedData);
              setUpdatedDataDisplay(true);
            }}
            style={{ marginLeft: 10 }}>
            <EyeOutlined title='View details' />
          </a>
        )
      }
    },
  ];

  const InstallmentColumns: ProColumns<API.RuleListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.installmentNumber"
          defaultMessage="Installment Number"
        />
      ),
      dataIndex: "InstallmentNo",
      hideInSearch: true,
      render: (dom, entity: any, index) => {
        return (
          <div>Installment {index + 1}</div>
        )
      }
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.paymentMode"
          defaultMessage="Payment Mode"
        />
      ),
      dataIndex: "paymentMode",
      hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.installmentType"
          defaultMessage="Installment Type"
        />
      ),
      dataIndex: "installmentType",
      hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.paidDate"
          defaultMessage="Paid Date (YYYY-MM-DD)"
        />
      ),
      dataIndex: "paidDate",
      hideInSearch: true,
    },
  ];

  return (
    <PageContainer>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Payment History" key="1">
          <ProTable<API.RuleListItem, API.PageParams>
            headerTitle={"Payment History"}
            actionRef={actionRef}
            rowKey="key"
            search={{
              labelWidth: 120,
            }}
            toolBarRender={() => []}
            request={
              async (params) => {
                const data: any = await getPaymentHistory({ ...params, studentId: props.tmpData });
                const mappedData = {
                  data: data.data,
                  current: data.pagination.page,
                  total: data.pagination.total,
                  pageSize: data.pagination.perpage
                }
                return mappedData;
              }}
            columns={PaymentColumns}
            pagination={{
              defaultPageSize: 5,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "30"],
            }}
          />

          <Modal
            width={700}
            visible={dataDisplay}
            title={`Data Display`}
            onCancel={() => {
              setDataDisplay(false);
              setUpdatedDataDisplay(false);
            }}
            footer={null}
            centered
          >
            {
              !updatedDataDisplay ?
                <PaymentDataDetials data={currentRow} /> :
                <UpdatedRecordData data={currentRow} />
            }
          </Modal>
        </TabPane>
        <TabPane tab="Installment History" key="2">
          <ProTable<API.RuleListItem, API.PageParams>
            headerTitle={"Installment History"}
            actionRef={actionRef}
            rowKey="key"
            toolBarRender={() => []}
            request={
              async (params) => {
                // Getting all Installment History Details
                const { data }: any = await getInstallmentHistory({ ...params, studentId: props.tmpData });

                let installmentData: any[] = [];
                let paymentMode = "";
                let installmentType = "";
                let subscriptionType = "";
                let paidDate = '';

                // Going through all installment details
                data.forEach((d: any) => {
                  let transaction = d?.debug?.newRecord?.transaction
                  let transactionDetails = d?.debug?.newRecord?.transactionDetails
                  paymentMode = transactionDetails?.paymentMode || paymentMode;
                  installmentType = transaction?.installmentType || installmentType;
                  subscriptionType = transaction?.subscriptionType || subscriptionType;
                  paidDate = transaction?.paidDate
                    ? moment(transaction?.paidDate).format('YYYY-MM-DD')
                    : paidDate;

                  if (
                    transaction?.status === "Installment Paid" &&
                    !installmentData.find(d => d.paidDate == paidDate && d.installmentType == installmentType && d.paymentMode == paymentMode)
                  ) {
                    installmentType = !installmentType ? subscriptionType : installmentType.trim().length <= 0 ? subscriptionType : installmentType
                    installmentData.push({ paymentMode, installmentType, paidDate });
                  }
                });
                installmentData.sort((a, b) => moment(a.paidDate).diff(moment(b.paidDate)))
                return { data: installmentData };
              }}
            columns={InstallmentColumns}
            pagination={false}
            search={false}
          />
        </TabPane>
      </Tabs>
    </PageContainer>

  )
}

export default HistoryTable;

