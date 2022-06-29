import { Button, Drawer, Spin, Modal } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { getAllCollectionAgents } from '@/services/ant-design-pro/api';
import Upload from './Components/Upload';
import { columns as columnsMethod } from "./columns";

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const TableList: React.FC = () => {
    const actionRef = useRef<ActionType>();
    const [upload, setUpload] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState(false);


    const intl = useIntl();

    const columns = columnsMethod();

    return (
        <PageContainer>
            <Spin spinning={isLoading}>
                <ProTable<API.RuleListItem, API.PageParams>
                    headerTitle={intl.formatMessage({
                        id: 'pages.searchTable.titleUser',
                        defaultMessage: 'Zoom Licenses Management',
                    })}
                    actionRef={actionRef}
                    rowKey="key"
                    search={{
                        labelWidth: 120,
                    }}
                    request={getAllCollectionAgents}
                    columns={columns}
                    toolBarRender={() => [
                        <Button type="primary" key="primary" onClick={() => setUpload(true)}>
                            Bulk Assignment
                        </Button>,
                    ]
                    }
                />
            </Spin>

            <Modal
                width={700}
                visible={upload}
                title={`Upload File`}
                onCancel={() => {
                    setUpload(false);
                }}
                footer={null}
                centered
            >
                <Upload isLoading={isLoading} setIsLoading={setIsLoading} />
            </Modal>

        </PageContainer>
    );
};

export default TableList;
