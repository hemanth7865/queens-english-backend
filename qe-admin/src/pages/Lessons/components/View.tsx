import { SECTION_TYPES } from "@/components/Constants/constants";
import { Card, Col, Divider, Image, List, Row, Spin, Table, TableColumnsType } from "antd";
import React, { useState, useEffect } from "react";
import { getImageURL, updateImageSasBlob } from "@/services/ant-design-pro/helpers";
import { getAllLessonScripts } from "@/services/ant-design-pro/api";

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


    const fetchLessonData = async () => {
        setIsLoading(true)
        if (data && data.id) {
            const [lessonId] = data.id.split("__");
            const response: any = await getAllLessonScripts({ id: lessonId, pageSize: 1 })
            if (response.data?.length !== 0) {
                const existingLesson = response.data[0];
                setLessonScriptData(existingLesson)
            }
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchLessonData();
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
                    {record.image && (
                        <>
                            <Divider />
                            <Row justify={"center"}>
                                <Image
                                    width={150}
                                    height={150}
                                    src={getImageURL(record.image)}
                                    alt="exercise-image"
                                    style={{ objectFit: 'contain' }}
                                />
                            </Row>
                        </>
                    )}
                </>
            }
            renderItem={(item: API.LessonScriptExerciseSection, index) => {
                return <Card title={`Section ${index + 1}`} style={{ marginTop: 20, borderRadius: 15 }}>
                    <Row>
                        {item.type === SECTION_TYPES.DESCRIPTION && item.description && <div id="ViewLessonScriptData" dangerouslySetInnerHTML={{ __html: updateImageSasBlob(item.description) }} />}
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
