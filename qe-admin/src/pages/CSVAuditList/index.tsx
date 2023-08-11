import { Button, Drawer, Spin, Modal } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { getCSVUploads } from '@/services/ant-design-pro/api';
import { columns as columnsMethod } from "./columns";

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const CSVAuditList: React.FC = () => {
    const actionRef = useRef<ActionType>();
    const intl = useIntl();

    const columns = columnsMethod();

    return (
        <PageContainer>
            <Spin spinning={false}>
                <ProTable<API.RuleListItem, API.PageParams>
                    headerTitle={intl.formatMessage({
                        id: 'pages.searchTable.titleUser',
                        defaultMessage: 'Collection Agents',
                    })}
                    actionRef={actionRef}
                    rowKey="key"
                    search={{
                        labelWidth: 120,
                    }}
                    request={getCSVUploads}
                    columns={columns}
                />
            </Spin>
        </PageContainer>
    );
};

export default CSVAuditList;
