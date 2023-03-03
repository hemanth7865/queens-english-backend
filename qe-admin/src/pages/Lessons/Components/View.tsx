import { SECTION_TYPES } from "@/components/Constants/constants";
import { Card, Col, Image, List, Row, Spin, Table, TableColumnsType } from "antd";
import React, { useState, useEffect } from "react";

interface ViewProps {
    data: any
};

interface DataType {
    key: React.Key;
    heading: string;
    name: string;
    subHeading: string;
    sections: any[];
}

const View: React.FC<ViewProps> = ({ data }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [lessonScriptData, setLessonScriptData] = useState<API.lessonScripts>();
    const [lessonDetails, setLessonDetails] = useState<API.LessonScriptExercise[]>();

    useEffect(() => {
        setIsLoading(true)
        setLessonScriptData(data)
        setIsLoading(false)
    }, [data])

    useEffect(() => {
        let newLessonDetails = lessonScriptData?.lessonDetails
        newLessonDetails = newLessonDetails?.map((lesson: any, index: number) => {
            return {
                key: index.toString(),
                name: `Exercise ${index + 1}`,
                sectionsLength: lesson?.sections?.length,
                ...lesson
            }
        })
        setLessonDetails(newLessonDetails)
    }, [lessonScriptData])

    const expandedRowRender = (record: any) => {
        const getUrl = (assetPath: string, blobUrl: string = BLOB_URL, blobSas: string = BLOB_SAS) => {
            if (blobUrl.endsWith("/")) {
                blobUrl = blobUrl.slice(0, -1);
            }
            if (assetPath.startsWith("/")) {
                assetPath = assetPath.slice(1);
            }
            return `${blobUrl}/${assetPath}${blobSas}`;
        }
        return <List
            dataSource={record.sections}
            itemLayout="vertical"
            size="default"
            pagination={false}
            header={
                <>
                    <Row>
                        <Col span={12}> <b>Heading</b> <h3>{record.heading}</h3> </Col>
                        <Col span={12}> <b>SubHeading</b> <h4>{record.subHeading}</h4> </Col>
                    </Row>
                </>
            }
            renderItem={(item: API.LessonScriptExerciseSection, index) => {
                return <Card title={`Section ${index + 1}`} style={{ marginTop: 20, borderRadius: 15 }}>
                    <Row>
                        {item.type === SECTION_TYPES.IMAGE && item.image && <Image width={200} src={getUrl(item.image)} />}
                        {item.type === SECTION_TYPES.DESCRIPTION && item.description && <div dangerouslySetInnerHTML={{ __html: item.description }} />}
                    </Row>
                </Card>
            }
            }
        />
    };

    const columns: TableColumnsType<DataType> = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Heading', dataIndex: 'heading', key: 'heading' },
        { title: 'Sections', dataIndex: 'sectionsLength', key: 'sectionsLength' },
    ];


    return (
        <>
            <div>
                <Spin spinning={isLoading} >
                    <h3>Lesson Script - {lessonScriptData?.number}</h3>
                    <Table
                        columns={columns}
                        expandable={{
                            expandedRowRender: (record) => {
                                return expandedRowRender(record)
                            }
                        }}
                        dataSource={lessonDetails}
                        size='middle'
                        pagination={false}
                    />
                </Spin>
            </div>
        </>
    );
};

export default View;
