import React, { useRef } from 'react';
import ProTable from "@ant-design/pro-table";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import { PageContainer } from '@ant-design/pro-layout';
import { FormattedMessage } from "umi";
import { getInstallmentHistory } from '@/services/ant-design-pro/api';
import moment from 'moment';

export type Props = {
  tmpData: any;
};


const InstallmentHistoryTable: React.FC<Props> = (props) => {

  const actionRef = useRef<ActionType>();

  const columns: ProColumns<API.RuleListItem>[] = [
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
          defaultMessage="Paid Date"
        />
      ),
      dataIndex: "paidDate",
      hideInSearch: true,
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.RuleListItem, API.PageParams>
        headerTitle={"Installment History"}
        actionRef={actionRef}
        rowKey="key"
        toolBarRender={() => []}
        request={
          async (params) => {
            // Getting all Installment History Details
            const data: any = await getInstallmentHistory({ ...params, studentId: props.tmpData });
            // Sorting them accordingly createdAt date
            data.data.sort(
              (a, b) => moment(a.createdAt).diff(moment(b.createdAt))
            );

            let realData: any[] = [];
            let paymentMode = "";
            let installmentType = "";
            let paidDate = '';

            // Going through all installment details
            data.data.forEach((d: any) => {
              paymentMode = d?.debug?.newRecord?.transactionDetails?.paymentMode
                ? d?.debug?.newRecord?.transactionDetails?.paymentMode
                : paymentMode;
              installmentType = d?.debug?.newRecord?.transaction?.installmentType
                ? d?.debug?.newRecord?.transaction?.installmentType
                : installmentType;
              paidDate = d?.debug?.newRecord?.transaction?.paidDate
                ? moment(d?.debug?.newRecord?.transaction?.paidDate).format('DD-MM-YYYY')
                : paidDate;
              if (d?.debug?.newRecord?.transaction?.status === "Installment Paid" && !realData.find(d => d.paidDate == paidDate && d.installmentType == installmentType && d.paymentMode == paymentMode)) {
                realData.push({ paymentMode, installmentType, paidDate });
              }
            });
            realData.sort((a, b) => moment(a.paidDate).diff(moment(b.paidDate)))
            return { data: realData };
          }}
        columns={columns}
        pagination={false}
        search={false}
      />
    </PageContainer>

  )
}

export default InstallmentHistoryTable;