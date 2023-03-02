import {
    PlusOutlined,
    DeleteOutlined,
    EyeOutlined,
    EditOutlined,
} from "@ant-design/icons";
import {
    Button
} from "antd";
import React, { useRef, useEffect } from "react";
import { useIntl, FormattedMessage } from "umi";
import { PageContainer } from "@ant-design/pro-layout";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";
import { getAllLessonScripts } from "@/services/ant-design-pro/api"

import "./index.css";

const Lessons: React.FC = () => {
    const intl = useIntl();
    const actionRef = useRef<ActionType>();



    useEffect(() => {

    }, []);

    const columns: ProColumns<API.SchoolItem>[] = [
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.lesson.lessonName"
                    defaultMessage="Lesson Number"
                />
            ),
            dataIndex: "number"
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.lesson.createdAt"
                    defaultMessage="Created At"
                />
            ),
            dataIndex: "createdAt",
            hideInSearch: true
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.lesson.modifiedAt"
                    defaultMessage="Modified At"
                />
            ),
            dataIndex: "modifiedAt",
            hideInSearch: true
        },
        {
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
                    >
                        <EyeOutlined />
                    </a>
                );
            },
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.school.edit"
                    defaultMessage="Edit"
                />
            ),
            dataIndex: "edit",
            hideInSearch: true,
            render: (dom, entity) => {
                return (
                    <a
                    >
                        <EditOutlined />
                    </a>
                );
            },
        },
        {
            title: (
                <FormattedMessage
                    id="pages.searchTable.school.delete"
                    defaultMessage="Delete"
                />
            ),
            dataIndex: "delete",
            hideInSearch: true,
            render: (dom, entity) => {
                return (
                    <a
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
                    id: 'pages.searchTable.titleLesson',
                    defaultMessage: 'Lesson Management',
                })}
                actionRef={actionRef}
                rowKey="key"
                search={{
                    labelWidth: 120,
                }}
                columns={columns}
                request={getAllLessonScripts}
                toolBarRender={() => [
                    <Button
                        type="primary"
                        key="primary"
                    >
                        <PlusOutlined /> Create Lesson
                    </Button>,
                ]}
            />
        </PageContainer>
    );
};

export default Lessons;