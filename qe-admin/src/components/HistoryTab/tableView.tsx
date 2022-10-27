import React, { useRef, useState } from 'react';
import ProTable from "@ant-design/pro-table";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import { PageContainer } from '@ant-design/pro-layout';
import { FormattedMessage } from "umi";
import { getPaymentHistory } from '@/services/ant-design-pro/api';
import { EyeOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import PaymentDataDetials from './dataDisplay';
import moment from 'moment';

export type Props = {
  tmpData: any;
};


const HistoryTable: React.FC<Props> = (props) => {

  const actionRef = useRef<ActionType>();
  const [dataDisplay, setDataDisplay] = useState(false);
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  console.log('prop', props, props.tmpData);

  const columns: ProColumns<API.RuleListItem>[] = [
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
      valueType: "date"
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
          id="pages.searchTable.titleEvent"
          defaultMessage="Event"
        />
      ),
      dataIndex: "event",
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
  ];

  return (
    <PageContainer>
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
        columns={columns}
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
        }}
        footer={null}
        centered
      >
        <PaymentDataDetials data={currentRow} />
      </Modal>
    </PageContainer>

  )
}

export default HistoryTable;

