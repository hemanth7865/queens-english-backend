import { EyeOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { rule, listSchool } from '@/services/ant-design-pro/api';

const TableList: React.FC = () => {
    const intl = useIntl();
    const actionRef = useRef<ActionType>();

    const [currentRow, setCurrentRow] = useState<API.RuleListItem>();

    const columns: ProColumns<API.RuleListItem>[] = [
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.schoolName"
                    defaultMessage="School Name"
                />
            ),
            dataIndex: "schoolName",
            valueType: "textarea",
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.id"
                    defaultMessage="School ID"
                />
            ),
            dataIndex: "id",
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.createdAt"
                    defaultMessage="Created At"
                />
            ),
            dataIndex: "createdAt",
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.batchesNumber"
                    defaultMessage="No. Of Batches"
                />
            ),
            dataIndex: "batchesNumber",
            hideInSearch: true,
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.status"
                    defaultMessage="Status"
                />
            ),
            dataIndex: "status",
            hideInForm: true,
            valueEnum: {
                0: {
                    text: (
                        <FormattedMessage
                            id="pages.searchTable.nameStatus.active"
                            defaultMessage="Active"
                        />
                    ),
                },
                1: {
                    text: (
                        <FormattedMessage
                            id="pages.searchTable.nameStatus.inactive"
                            defaultMessage="Inactive"
                        />
                    ),
                },
            },
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.updateForm.view"
                    defaultMessage="View"
                />
            ),
            dataIndex: "view",
            hideInSearch: true,
            render: (dom, entity) => {
                return (
                    <a
                    //onClick={() => { }}
                    >
                        <EyeOutlined />
                    </a>
                );
            },
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.updateForm.edit"
                    defaultMessage="Edit"
                />
            ),
            dataIndex: "edit",
            hideInSearch: true,
            render: (dom, entity) => {
                return (
                    <a
                    //onClick={() => { }}
                    >
                        <EditOutlined />
                    </a>
                );
            },
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.updateForm.delete"
                    defaultMessage="Delete"
                />
            ),
            dataIndex: "delete",
            hideInSearch: true,
            render: (dom, entity) => {
                return (
                    <a
                    //onClick={() => { }}
                    >
                        <DeleteOutlined />
                    </a>
                );
            },
        },
    ];

    return (
        <PageContainer>
            <ProTable<API.RuleListItem, API.PageParams>
                headerTitle={intl.formatMessage({
                    id: 'pages.searchTable.titleSchool',
                    defaultMessage: 'School Management',
                })}
                actionRef={actionRef}
                rowKey="key"
                search={{
                    labelWidth: 120,
                }}
                request={rule}
                columns={columns}
                toolBarRender={() => [
                    <Button
                        type="primary"
                        key="primary"
                    >
                        <PlusOutlined /> Add School
                    </Button>,
                ]}
            />

        </PageContainer>
    );
};

export default TableList;
