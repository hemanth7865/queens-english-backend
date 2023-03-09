import { SECTION_TYPES } from "@/components/Constants/constants";
import { getAllLessonScripts } from "@/services/ant-design-pro/api";
import { LoadingOutlined, MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Row, Select, Space, Spin } from "antd";
import TextArea from "antd/lib/input/TextArea";
import React, { useState, useEffect } from "react";
import RichEditor from "./RichEditor";

interface CreateEditProps {
    create: boolean
    lessons: any[]
};

const CreateEdit: React.FC<CreateEditProps> = ({ create, lessons }) => {
    const [options, setOptions] = useState<any[]>([])
    const [selectedLessonId, setSelectedLessonId] = useState<any>()
    const [alreadyExist, setAlreadyExist] = useState<boolean>(false);
    const [loading, setLoading] = useState(false)

    const [form] = Form.useForm();

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

    const SectionForm = (props) => {
        return (
            <>
                <Form.List name={[props.fieldKey, "sections"]}>
                    {(sections, { add, remove }) => {
                        return (
                            <div>
                                {sections.map((section, index2) => (
                                    <Space
                                        key={section.key}
                                        style={{ display: "flex", flexDirection: "column", marginBottom: 8 }}
                                        align="start"
                                        id="spaceContainer"
                                    >
                                        {/* <Form.Item
                                            // name={"aar"}
                                            {...section}
                                            name={[section.name, "type"]}
                                            fieldKey={[section.fieldKey, "type"]}
                                            key={index2}
                                            // noStyle
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Type Missing"
                                                }
                                            ]}
                                        >
                                            <Select placeholder="Please select a Type">
                                                {
                                                    Object
                                                        .keys(SECTION_TYPES)
                                                        .map(key => (
                                                            <Option value={SECTION_TYPES[key]}>{key}</Option>
                                                        ))
                                                }
                                            </Select>
                                        </Form.Item> */}

                                        <Form.Item
                                            // name={"aar"}
                                            {...section}
                                            name={[section.name, "description"]}
                                            fieldKey={[section.fieldKey, "description"]}
                                            key={index2}
                                            noStyle
                                            style={{ width: "100%" }}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Description Missing"
                                                }
                                            ]}
                                        >
                                            {/* <TextArea rows={4} placeholder="Enter Description" /> */}
                                            <RichEditor key={section.key} section={section}></RichEditor>
                                        </Form.Item>



                                        <MinusCircleOutlined
                                            onClick={() => {
                                                remove(section.name);
                                            }}
                                        />
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button
                                        type="dashed"
                                        onClick={() => {
                                            add();
                                        }}
                                    >
                                        <PlusOutlined /> Add Section
                                    </Button>
                                </Form.Item>
                            </div>
                        );
                    }}
                </Form.List>
            </>
        );
    };

    const onSubmit = (e: any) => {
        console.log('DATA ---->>', e)
    }

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
                    <Form onFinish={(e) => onSubmit(e)} style={{ marginTop: 20 }}>
                        {/* This is the Dynamic Exercise Adder */}
                        <Form.List name="exercises">
                            {(fields, { add, remove }) => {
                                return (
                                    <div>
                                        {fields.map((field, index) => {
                                            return (
                                                <Row
                                                    key={field.key}
                                                    style={{ display: "flex", flexDirection: "column", marginTop: 10 }}
                                                >
                                                    <Row style={{ justifyContent: 'space-between' }}>

                                                        <h3>{`Exercise ${index + 1}`}</h3>
                                                        <Form.Item
                                                            {...field}
                                                            name={[field.name, "heading"]}
                                                            fieldKey={[field.fieldKey, "heading"]}
                                                            rules={[
                                                                { required: true, message: "Missing Heading" }
                                                            ]}
                                                        >
                                                            <Input placeholder="Enter Heading" />
                                                        </Form.Item>

                                                        <Form.Item
                                                            {...field}
                                                            name={[field.name, "subHeading"]}
                                                            fieldKey={[field.fieldKey, "subHeading"]}
                                                            initialValue={''}
                                                        >
                                                            <Input placeholder="Enter Sub Heading" />
                                                        </Form.Item>
                                                        <MinusCircleOutlined
                                                            onClick={() => {
                                                                remove(field.name);
                                                                console.log('Removed -->>', field);
                                                            }}
                                                        />
                                                    </Row>

                                                    {/* This is the Dynamic Section Adder */}
                                                    <Form.Item>
                                                        <SectionForm fieldKey={field.name} />
                                                    </Form.Item>
                                                </Row>
                                            )
                                        })}

                                        <Button
                                            type="dashed"
                                            onClick={() => {
                                                add();
                                            }}
                                            block
                                        >
                                            <PlusOutlined /> Add Exercise
                                        </Button>
                                    </div>
                                );
                            }}
                        </Form.List>
                        <Button type="primary" htmlType="submit">
                            Next
                        </Button>
                    </Form>
                }
            </div>
        </>
    );
};

export default CreateEdit;
