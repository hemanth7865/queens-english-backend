import { Button, Drawer, Spin, Modal } from 'antd';
import React, { useState, useRef } from 'react';
import { FormattedMessage, useIntl } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { getCSVUploads } from '@/services/ant-design-pro/api';
import { columns as columnsMethod } from "./columns";
import { EyeOutlined } from '@ant-design/icons';
import ViewDetails from './Components/ViewDetails';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const CSVAuditList: React.FC = () => {
    const actionRef = useRef<ActionType>();
    const intl = useIntl();
    const [view, setView] = useState<boolean>(false);
    const [viewData, setViewData] = useState<any>({});

    const columns = columnsMethod();
    columns.push({
        title: (
            <FormattedMessage
                id="pages.searchTable.school.view"
                defaultMessage="View"
            />
        ),
        dataIndex: "view",
        hideInSearch: true,
        render: (dom, entity) => {
            return (
                <a
                    onClick={() => {
                        setViewData(entity)
                        setView(true)
                    }}
                >
                    <EyeOutlined />
                </a>
            );
        },
    });

    return (
        <>
            <PageContainer>
                <Spin spinning={false}>
                    <ProTable<API.RuleListItem, API.PageParams>
                        headerTitle={intl.formatMessage({
                            id: 'pages.searchTable.titleUser',
                            defaultMessage: 'Buk Upload File Audit List',
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
            <Drawer
                visible={view}
                onClose={() => {
                    setView(false);
                    setViewData(undefined);
                }}
                width={600}
            >
                <ViewDetails data={viewData} />
            </Drawer>
        </>
    );
};

export default CSVAuditList;
