import { SECTION_TYPES } from "@/components/Constants/constants";
import { getAllLessonScripts, createLessonScript, updateLessonScript } from "@/services/ant-design-pro/api";
import { updateImageSasBlob } from "@/services/ant-design-pro/helpers";
import { LoadingOutlined, MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Row, Select, Spin, notification, Tabs, Divider } from "antd";
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

const { TabPane } = Tabs;

function initialFormData() {
    const initialData: Exercise[] = [
        {
            heading: "",
            subHeading: "",
            key: uuid(),
            sections: [
                {
                    type: SECTION_TYPES.DESCRIPTION,
                    description: "",
                    key: uuid()
                }
            ]
        }
    ]
    return initialData
}

const CreateEdit: React.FC<CreateEditProps> = ({ finishUpdateEdit, lessons, edit }) => {
    const [options, setOptions] = useState<any[]>([])
    const [selectedLessonId, setSelectedLessonId] = useState<any>(edit.lessonId || null)
    const [alreadyExist, setAlreadyExist] = useState<boolean>(false);
    const [loading, setLoading] = useState(false)
    const [fromData, setFormData] = useState<Exercise[]>([])
    const [update, setUpdate] = useState<number>(0);

    const [form] = Form.useForm();

    useEffect(() => {
        const lessonData = lessons.map((lesson) => {
            return { label: lesson.number, value: lesson.id + '__' + lesson.number }
        })
        setOptions(lessonData)
    }, [lessons])

    useEffect(() => {
        if (edit) {
            const id = edit.lessonId + "__" + edit.number;
            if (id !== selectedLessonId) {
                setSelectedLessonId(id);
                return;
            }
        } else {
            setFormData(initialFormData())
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

    const onSubmit = async () => {
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
                number: lessonNumber,
                createdAt: edit?.createdAt ? edit.createdAt : "",
                updatedAt: edit?.updatedAt ? edit.updatedAt : ""
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
            <Tabs defaultActiveKey="1" onTabClick={() => { setUpdate((u) => u + 1) }}>
                <TabPane tab={edit ? "Edit" : "Create"} key="1">
                    <div>
                        <h2>{edit ? "Edit Lesson Script" : "Create Lesson Script"}</h2>
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
                                    disabled={!!edit}
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
                                    <Form onFinish={onSubmit} style={{ marginTop: 20 }} form={form} key={update}>
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
                                    </Form>
                                )
                            )
                        }
                    </div>
                </TabPane>
                <TabPane tab={"Preview"} key="2">
                    <Col style={{
                        width: "65%",
                        margin: "5px auto",
                        padding: 15,
                        borderRadius: 5,
                        boxShadow: "0px 10px 50px -30px rgba(0,0,0,0.2)",
                        border: "1px solid #efefef"
                    }} >
                        {fromData.map((exercise, index) => {
                            return (
                                <Col>
                                    <Row>
                                        <Col
                                            span={8}
                                            style={{
                                                fontSize: 22
                                            }}
                                        ><i style={{ fontSize: 32 }}>E</i>xercise {index + 1}</Col>
                                        <Col
                                            span={16}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'flex-end',
                                                alignItems: 'end'
                                            }}
                                        >
                                            <Row
                                                style={{
                                                    fontSize: 18,
                                                    color: "#8C2132",
                                                    fontWeight: "bold",
                                                    textAlign: 'right'
                                                }}
                                            >{exercise.heading?.toUpperCase()}</Row>
                                            {exercise?.subHeading && exercise.subHeading.trim() !== "" && <Row
                                                style={{ fontSize: 14, textAlign: 'right' }}
                                            >{exercise.subHeading}</Row>}
                                        </Col>
                                    </Row>
                                    <div style={{ margin: "8px 0", borderRadius: 3, height: 5, width: "100%", backgroundColor: "#186E98" }} />
                                    {exercise?.sections?.map((section) => {
                                        return <Row>
                                            {section.type === SECTION_TYPES.DESCRIPTION && section.description && <div id="ViewLessonScriptData" dangerouslySetInnerHTML={{ __html: updateImageSasBlob(section.description) }} />}
                                        </Row>
                                    })}
                                    <Divider />
                                </Col>
                            )
                        })}
                    </Col>
                </TabPane>
            </Tabs>
            <Button type="primary" disabled={!selectedLessonId || loading || (!edit && alreadyExist)} onClick={() => form.submit()}>
                Submit
            </Button>
        </>
    );
};

export default CreateEdit;
