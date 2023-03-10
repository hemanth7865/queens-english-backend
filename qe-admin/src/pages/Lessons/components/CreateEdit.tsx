import { SECTION_TYPES } from "@/components/Constants/constants";
import { getAllLessonScripts, createLessonScript, updateLessonScript } from "@/services/ant-design-pro/api";
import { updateImageSasBlob } from "@/services/ant-design-pro/helpers";
import { LoadingOutlined, MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Row, Select, Spin, notification } from "antd";
import React, { useState, useEffect } from "react";
import RichEditor from "./RichEditor";
// @ts-expect-error
import { v4 as uuid } from "uuid";

interface CreateEditProps {
    edit: any,
    lessons: any[],
    finishUpdateEdit: () => any
};

type Section = {
    type: string;
    description: string;
    key: string;
}

type Exercise = {
    heading: string;
    subHeading: string;
    key: string;
    sections: Section[]
}

const initialFormData = () => [
    {
        heading: "",
        subHeading: "",
        key: uuid(),
        sections: [
            {
                type: "description",
                description: "",
                key: uuid()
            }
        ]
    }
]

const CreateEdit: React.FC<CreateEditProps> = ({ finishUpdateEdit, lessons, edit }) => {
    const [options, setOptions] = useState<any[]>([])
    const [selectedLessonId, setSelectedLessonId] = useState<any>(edit.lessonId || null)
    const [alreadyExist, setAlreadyExist] = useState<boolean>(false);
    const [loading, setLoading] = useState(false)
    const [fromData, setFormData] = useState<Exercise[]>(initialFormData())
    const [update, setUpdate] = useState<number>(0);

    const [form] = Form.useForm();

    useEffect(() => {
        const lessonData = lessons.map((lesson) => {
            return { label: lesson.number, value: lesson.id + '__' + lesson.number }
        })
        setOptions(lessonData)
    }, [lessons])

    useEffect(() => {
        setFormData(initialFormData())
        if (edit) {
            const id = edit.lessonId + "__" + edit.number;
            if (id !== selectedLessonId) {
                setSelectedLessonId(id);
                return;
            }
        }
        // Check if lessonScript is already available
        (async () => {
            setLoading(true)
            if (selectedLessonId) {
                const [lessonId] = selectedLessonId.split("__");
                const data: any = await getAllLessonScripts({ id: lessonId, pageSize: 1 })
                if (data.data?.length !== 0) {
                    const existingLesson = data.data[0];
                    setFormData(existingLesson.lessonDetails);
                    setAlreadyExist(true)
                } else {
                    setAlreadyExist(false)
                }
            }
            setLoading(false)
        })()
    }, [selectedLessonId, edit])

    const onSubmit = async (e: any) => {
        setLoading(true);
        try {
            if (!selectedLessonId) {
                throw new Error("Please Select A Lesson");
            }

            const [lessonId, lessonNumber] = selectedLessonId.split("__");

            const lesson = lessons.find((lesson) => lesson.id === lessonId);

            if (!lesson) {
                throw new Error("Selected Lesson Not Found");
            }

            const data = {
                id: lessonId,
                lessonId,
                lessonDetails: fromData,
                number: lessonNumber
            }

            notification.success({ message: "Please Wait Update/Creating Lesson Script" });

            if (!edit) {
                const result: any = await createLessonScript({}, JSON.stringify(data));

                if (result.error) {
                    notification.error({ message: "Failed to create lesson", description: result.msg });
                } else {
                    notification.success({ message: "Success Creating Lesson Script" });
                    finishUpdateEdit();
                }
            } else {
                const result: any = await updateLessonScript({}, JSON.stringify(data));

                if (result.error) {
                    notification.error({ message: "Failed to update lesson", description: result.msg });
                } else {
                    notification.success({ message: "Success Updating Lesson Script" });
                    finishUpdateEdit();
                }
            }
        } catch (e: any) {
            notification.error({ message: "Failed to Update/Create Lesson Script", description: e.message });
        }
        setLoading(false);
    }

    const addExercise = () => {
        setFormData((data) => {
            data[data.length] = {
                heading: "",
                subHeading: "",
                key: uuid(),
                sections: []
            };

            return data;
        })

        setUpdate((u) => u + 1);
    }

    const removeExercise = (index: number) => {
        setFormData((data) => {
            data = data.filter((v, i) => i !== index);
            return data;
        })

        setUpdate((u) => u + 1);
    }

    const updateExerciseData = (index: number, column: string, d: any) => {
        setFormData((data) => {
            data[index][column] = d;
            return data;
        })
    }


    const addSection = (parentIndex: number) => {
        setFormData((data) => {
            const sections = data[parentIndex].sections;
            data[parentIndex].sections[sections.length] = {
                description: "",
                type: SECTION_TYPES.DESCRIPTION,
                key: uuid(),
            };

            return data;
        })

        setUpdate((u) => u + 1);
    }

    const removeSection = (parentIndex: number, index: number) => {
        setFormData((data) => {
            const sections = data[parentIndex].sections.filter((v: Section, i: number) => i !== index);
            data[parentIndex].sections = sections;
            return data;
        })

        setUpdate((u) => u + 1);
    }

    const updateSectionData = (parentIndex: number, index: number, column: string, d: any) => {
        setFormData((data) => {
            data[parentIndex].sections[index][column] = d;
            return data;
        })
    }

    return (
        <>
            <div>
                <Row>
                    <Col span={8}><h3>Select Lesson : </h3></Col>
                    <Col span={16}>
                        <Select
                            onChange={(item: any) => {
                                setSelectedLessonId(item)
                            }}
                            options={options}
                            value={selectedLessonId}
                            style={{
                                width: '100%'
                            }}
                            disabled={edit}
                        />
                    </Col>
                </Row>

                {selectedLessonId && loading &&
                    <Row style={{ height: 200, alignItems: 'center', background: "rgba(0, 0, 0, 0.02)", borderRadius: 10, marginTop: 20, justifyContent: 'center' }} >
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                    </Row>
                }

                {selectedLessonId && !loading &&
                    (
                        !edit && alreadyExist ? (
                            <Row style={{ height: 200, alignItems: 'center', background: "rgba(0, 0, 0, 0.02)", borderRadius: 10, marginTop: 20, justifyContent: 'center' }} >
                                <h3>Lesson script is already exist for selected lesson.</h3>
                            </Row>
                        ) : (
                            // Add fields to add headings and sections
                            <Form onFinish={(e) => onSubmit(e)} style={{ marginTop: 20 }} form={form} key={update}>
                                {
                                    fromData.map((exercise, index) => {
                                        return (
                                            <Row
                                                key={exercise.key}
                                                style={{ display: "flex", flexDirection: "column", marginTop: 10 }}
                                            >
                                                <Row style={{ justifyContent: 'space-between' }}>

                                                    <h3>{`Exercise ${index + 1}`}</h3>
                                                    <Form.Item
                                                        rules={[
                                                            { required: true, message: "Missing Heading" }
                                                        ]}
                                                    >
                                                        <Input defaultValue={exercise.heading} placeholder="Enter Heading" onChange={(e) => updateExerciseData(index, 'heading', e.target.value)} />
                                                    </Form.Item>

                                                    <Form.Item>
                                                        <Input defaultValue={exercise.subHeading} placeholder="Enter Sub Heading" onChange={(e) => updateExerciseData(index, 'subHeading', e.target.value)} />
                                                    </Form.Item>
                                                    <MinusCircleOutlined
                                                        onClick={() => {
                                                            removeExercise(index);
                                                        }}
                                                    />
                                                </Row>

                                                {
                                                    exercise.sections.map((section, sectionIndex) => {
                                                        return (
                                                            <div key={section.key} style={{ marginBottom: 10 }}>
                                                                <h4>{`Section ${sectionIndex + 1}`}</h4>
                                                                <Row gutter={10}>
                                                                    <Col flex={1}>
                                                                        <RichEditor key={section.key} sectionKey={section.key}
                                                                            onChange={(data: string) => updateSectionData(index, sectionIndex, 'description', data)}
                                                                            defaultValue={updateImageSasBlob(section.description)}></RichEditor>
                                                                    </Col>

                                                                    <Col>
                                                                        <MinusCircleOutlined
                                                                            onClick={() => {
                                                                                removeSection(index, sectionIndex);
                                                                            }}
                                                                        />
                                                                    </Col>
                                                                </Row>
                                                            </div>
                                                        )
                                                    })
                                                }

                                                <Form.Item>
                                                    <Button
                                                        type="dashed"
                                                        onClick={() => {
                                                            addSection(index);
                                                        }}
                                                    >
                                                        <PlusOutlined /> Add Section
                                                    </Button>
                                                </Form.Item>
                                            </Row>
                                        )
                                    })
                                }

                                {/* This is the Dynamic Exercise Adder */}
                                <Button
                                    type="dashed"
                                    onClick={() => {
                                        addExercise();
                                    }}
                                    block
                                >
                                    <PlusOutlined /> Add Exercise
                                </Button>
                                <Button type="primary" htmlType="submit">
                                    Submit
                                </Button>
                            </Form>
                        )
                    )
                }
            </div>
        </>
    );
};

export default CreateEdit;
