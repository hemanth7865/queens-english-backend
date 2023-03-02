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
import { getAllLessonScripts, deleteLessonScriptById } from "@/services/ant-design-pro/api";
import { handleAPIResponse } from "@/services/ant-design-pro/helpers";

import "./index.css";

const Lessons: React.FC = () => {
    const intl = useIntl();
    const actionRef = useRef<ActionType>();



    useEffect(() => {

    }, []);

    const handleDelete = async (id: string, number: string) => {
        try {
            if (confirm(`Are you sure to delete lesson script ${number} ?`)) {
                const msg = await deleteLessonScriptById({ id });
                handleAPIResponse(msg, `Successfully deleted lesson Script ${number}`, "", false);
                actionRef.current?.reload();
            }
        } catch (error) {
            handleAPIResponse({ status: 400 }, "", `Failed to delete the lesson Script ${number}`, false);
        }
    }

    const columns: ProColumns<API.lessonScripts>[] = [
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
                    <a onClick={() => { handleDelete(entity.id!, entity.number!) }} >
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
                request={getAllLessonScripts}
                columns={columns}
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