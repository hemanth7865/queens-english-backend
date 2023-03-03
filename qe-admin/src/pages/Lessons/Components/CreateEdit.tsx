import { SECTION_TYPES } from "@/components/Constants/constants";
import { getAllLessonScripts } from "@/services/ant-design-pro/api";
import { LoadingOutlined } from "@ant-design/icons";
import { Card, Col, Image, List, Row, Select, Spin, Table, TableColumnsType } from "antd";
import React, { useState, useEffect } from "react";

interface CreateEditProps {
    create: boolean
    lessons: any[]
};

const CreateEdit: React.FC<CreateEditProps> = ({ create, lessons }) => {
    const [options, setOptions] = useState<any[]>([])
    const [selectedLessonId, setSelectedLessonId] = useState<any>()
    const [alreadyExist, setAlreadyExist] = useState<boolean>(false);
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const lessonData = lessons.map((lesson) => {
            return { label: lesson.number, value: lesson.id + '-' + lesson.number }
        })
        setOptions(lessonData)
    }, [lessons])

    useEffect(() => {
        // Check if lessonScript is already available
        (async () => {
            setLoading(true)
            if (selectedLessonId) {
                const data = await getAllLessonScripts({ id: selectedLessonId, pageSize: 1 })
                if (data.data?.length !== 0) {
                    setAlreadyExist(true)
                } else {
                    setAlreadyExist(false)
                }
            }
            setLoading(false)
        })()
    }, [selectedLessonId])

    return (
        <>
            <div>
                <Row>
                    <Col span={8}><h3>Select Lesson : </h3></Col>
                    <Col span={16}>
                        <Select
                            onChange={(item) => {
                                setSelectedLessonId(item)
                            }}
                            options={options}
                            style={{
                                width: '100%'
                            }}
                        />
                    </Col>
                </Row>

                {loading &&
                    <Row style={{ height: 200, alignItems: 'center', background: "rgba(0, 0, 0, 0.02)", borderRadius: 10, marginTop: 20, justifyContent: 'center' }} >
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                    </Row>
                }
                {!loading && alreadyExist &&
                    <Row style={{ height: 200, alignItems: 'center', background: "rgba(0, 0, 0, 0.02)", borderRadius: 10, marginTop: 20, justifyContent: 'center' }} >
                        <h3>Lesson script is already exist for selected lesson.</h3>
                    </Row>
                }

                {!loading && !alreadyExist &&
                    // Add fields to add headings and sections
                    <>

                    </>
                }
            </div>
        </>
    );
};

export default CreateEdit;
