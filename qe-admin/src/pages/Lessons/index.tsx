import {
    PlusOutlined,
    DeleteOutlined,
    EyeOutlined,
    EditOutlined,
} from "@ant-design/icons";
import {
    Button
} from "antd";
import React, { useRef, useEffect, useState } from "react";
import { useIntl, FormattedMessage } from "umi";
import { PageContainer } from "@ant-design/pro-layout";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";
import { Drawer } from 'antd';
import View from "./components/View";
import { getAllLessonScripts, deleteLessonScriptById, getAllLessons } from "@/services/ant-design-pro/api";
import { handleAPIResponse } from "@/services/ant-design-pro/helpers";
import "./Components/editor.css";


import "./index.css";
import CreateEdit from "./components/CreateEdit";

const Lessons: React.FC = () => {
    const intl = useIntl();
    const actionRef = useRef<ActionType>();
    const [view, setView] = useState(false);
    const [viewData, setViewData] = useState();
    const [create, setCreate] = useState<boolean>(false);
    const [edit, setEdit] = useState<any>(false);
    const [lessons, setLessons] = useState<any[]>([]);
    const [key, setKey] = useState(0);


    const fetchAllLessons = async () => {
        const data = await getAllLessons({})
        setLessons(data)
    }

    useEffect(() => {
        fetchAllLessons()
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
                        onClick={() => {
                            setViewData(entity)
                            setView(true)
                        }}
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
                        onClick={() => {
                            setEdit(entity);
                        }}
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

    const finishUpdateEdit = () => {
        actionRef.current?.reload();
        setCreate(false);
        setEdit(false);
    }

    return (
        <>
            <PageContainer>
                <ProTable<API.RuleListItem, API.PageParams>
                    headerTitle={intl.formatMessage({
                        id: 'pages.searchTable.titleLesson',
                        defaultMessage: 'Lesson Script Management 00',
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
                            onClick={() => {
                                setCreate(true)
                                setEdit(false);
                            }}
                        >
                            <PlusOutlined /> Create Lesson
                        </Button>,
                    ]}
                />
            </PageContainer>
            <Drawer
                visible={view}
                onClose={() => {
                    setView(false);
                    setViewData(undefined);
                }}
                width={600}
            >
                <View data={viewData} />
            </Drawer>
            <Drawer
                visible={create || edit}
                onClose={() => {
                    setView(false);
                    setViewData(undefined);
                    setCreate(false);
                    setEdit(false);
                    setKey(key + 1)
                }}
                width={800}
            >
                <h2>{create ? "Create Lesson Script" : "Edit Lesson Script"}</h2>
                <CreateEdit lessons={lessons} key={key} finishUpdateEdit={finishUpdateEdit} edit={edit} />
            </Drawer>
        </>
    );
};

export default Lessons;