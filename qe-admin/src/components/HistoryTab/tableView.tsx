import React, { useRef } from 'react';
import ProTable from "@ant-design/pro-table";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import { PageContainer } from '@ant-design/pro-layout';
import { FormattedMessage } from "umi";
import { rule } from '@/services/ant-design-pro/api';

type list = {
  label: string | number;
  value: string | number;
};

export type Props = {
  value: list[];
  defaultValue: list[];
  options: list[];
  onChange: (data: list[]) => void;

};

const cascaderOptions = [
  {
    field: 'front end',
    value: 'fe',
  },
  {
    field: 'back end',
    value: 'be',
  },
];

const HistoryTable: React.FC<Props> = (props) => {

  const actionRef = useRef<ActionType>();

  const columns: ProColumns<API.RuleListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.createdBy"
          defaultMessage="Created By"
        />
      ),
      dataIndex: "createdBy",
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleCreatedAt"
          defaultMessage="Created At"
        />
      ),
      dataIndex: "createdAt",
      valueType: "date"
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleUpdatedData"
          defaultMessage="Updated Data"
        />
      ),
      fieldProps: {
        options: cascaderOptions,
        fieldNames: {
          children: 'language',
          label: 'field',
        },
        showSearch: true,
        filterTreeNode: true,
        multiple: true,
        treeNodeFilterProp: 'field',
      },
      dataIndex: "UpdatedData",
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleOldData"
          defaultMessage="Old Data"
        />
      ),
      dataIndex: "OldData",
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
        request={rule}
        columns={columns}
        pagination={{
          defaultPageSize: 5,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "30"],
        }}
      />
    </PageContainer>

  )
}

export default HistoryTable;

