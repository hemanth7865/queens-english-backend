import { SECTION_TYPES } from "@/components/Constants/constants";
import { getAllLessonScripts, createLessonScript, updateLessonScript } from "@/services/ant-design-pro/api";
import { updateImageSasBlob } from "@/services/ant-design-pro/helpers";
import { LoadingOutlined, CloseCircleOutlined, CloseCircleFilled, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Checkbox, Row, Select, Spin, notification, Tabs, Popconfirm } from "antd";
import React, { useState, useEffect } from "react";
import RichEditor from "./RichEditor";
// @ts-expect-error
import { v4 as uuid } from "uuid";
import Preview from "./Preview";
import ImageUploader from "./ImageUploader";

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
    newHeading: boolean;
    subHeading: string;
    key: string;
    sections: Section[]
    image?: string;
}

const { TabPane } = Tabs;

function initialFormData() {
    const initialData: Exercise[] = [
        {
            heading: "",
            newHeading: true,
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
        const lessonData = lessons?.map((lesson) => {
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
                    const updatedData = updateHTMLOfSection(existingLesson.lessonDetails);
                    setFormData(updatedData);
                    setAlreadyExist(true)
                } else {
                    setAlreadyExist(false)
                }
            }
            setLoading(false)
        })()
    }, [selectedLessonId, edit])

    // Function to identify and mark the block start and block end in the HTML content
    const updateHTMLOfSection = (currentData: any) => {
        const updateData = currentData;

        const parser = new DOMParser();

        const fullHTMLData = parser.parseFromString(currentData, 'text/html');

        // condition to check if the HTML content already contains the block splits
        // If it already has ## block in it, then it means the lesson is already saved based on the blocks.
        // If not, then we need to identify where the <strong> tag with its first word as repeat occurs
        // And based on it we need to add the block start and block end
        if (!fullHTMLData?.body?.textContent?.toLowerCase().includes('## block')) {
            updateData.forEach((exerciseData: any) => {
                exerciseData.sections.forEach((sectionData: any) => {
                    const htmlDoc = parser.parseFromString(sectionData.description, 'text/html');
                    const strongElements = htmlDoc.querySelectorAll('strong');

                    strongElements.forEach(strongElement => {
                        const words = strongElement.textContent?.trim().split(' ');
                        console.log("strongElement = ", strongElement);
                        if (words && words.length > 0 && words[0].toLowerCase().includes('repeat')) {
                            // Find the parent element of the <strong> element
                            const parentElement = strongElement.parentNode;

                            // Create a new <div> element for "## Block Starts ##"
                            const blockStartsDiv = document.createElement('div');
                            blockStartsDiv.style.fontWeight = 'bold';
                            blockStartsDiv.textContent = '## Block Starts ##';

                            // Create a new <div> element for "## Block ends ##"
                            const blockEndsElement = document.createElement('p');
                            blockEndsElement.style.fontWeight = 'bold';
                            blockEndsElement.textContent = '## Block Ends ##';

                            // Find the character after the word "step"
                            const stepIndex = words.findIndex(word => word.toLowerCase().includes('step'));

                            if (stepIndex !== -1 && stepIndex < words.length - 1) {
                                const nextCharacter = words[stepIndex + 1].toLowerCase();
                                // Traverse upwards to find a suitable preceding element
                                let currentNode = parentElement;
                                while (currentNode !== null) {
                                    // Check if the current node is an element node and its content starts with the next character
                                    if (currentNode.nodeType === Node.ELEMENT_NODE && currentNode?.textContent?.trim().toLowerCase().startsWith(`${nextCharacter}.`)) {
                                        currentNode?.parentNode?.insertBefore(blockStartsDiv, currentNode);
                                        break; // Stop traversal once the element is found and processed
                                    }
                                    // Move to the parent node
                                    currentNode = currentNode.previousSibling ?? currentNode.parentNode;
                                }
                            }
                            // Check if the parent element is <li>
                            if (parentElement?.tagName?.toLowerCase() === 'li') {
                                // Find the grandparent of the <strong> element
                                const grandparentElement = parentElement.parentNode;

                                // Insert the <div> element after the grandparent element
                                grandparentElement?.parentNode?.insertBefore(blockEndsElement, grandparentElement.nextSibling);
                            } else {
                                // Insert the <div> element after the parent element
                                parentElement?.parentNode?.insertBefore(blockEndsElement, strongElement.nextSibling);
                            }
                        }
                        sectionData.description = htmlDoc.body.innerHTML;
                    })
                });
            });
        }
        return updateData;
    }

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
                newHeading: true,
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

    const addImage = (index: number, url: string) => {
        setFormData((data) => {
            data[index].image = url;
            return data;
        })
        setUpdate((u) => u + 1);
    }

    const removeImage = (index: number) => {
        setFormData((data) => {
            data[index].image = undefined;
            return data;
        })
        setUpdate((u) => u + 1);
    }

    return (
        <>
            <Tabs defaultActiveKey="1" onTabClick={() => { setUpdate((u) => u + 1) }}>
                <TabPane tab={edit ? "Edit" : "Create"} key="1">
                    <div>
                        {/* <h2>{edit ? "Edit Lesson Script" : "Create Lesson Script"}</h2> */}
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
                                            fromData?.map((exercise, index) => {
                                                return (
                                                    <Row
                                                        key={exercise.key}
                                                        className="exerciseContainer"
                                                        style={{ display: "flex", flexDirection: "column", marginTop: 10 }}
                                                    >
                                                        <Row style={{ justifyContent: 'space-between', flexFlow: 'row' }}>

                                                            <h2>{`Exercise ${index + 1}`}</h2>
                                                            <span className="headingContainer" style={{ width: '50%', margin: '0px 0.5em' }}>
                                                                <Form.Item
                                                                    rules={[
                                                                        { required: true, message: "Missing Heading" }
                                                                    ]}
                                                                >
                                                                    <Input defaultValue={exercise.heading} placeholder="Enter Heading" onChange={(e) => updateExerciseData(index, 'heading', e.target.value)} />
                                                                </Form.Item>
                                                                <Form.Item name="isAccepted">
                                                                    <Checkbox
                                                                        defaultChecked={exercise.newHeading}
                                                                        onChange={(e) => {
                                                                            exercise.newHeading = !exercise.newHeading
                                                                        }
                                                                        }>
                                                                        New Heading - {exercise.newHeading}</Checkbox>
                                                                </Form.Item>
                                                            </span>
                                                            <span style={{ width: '30%', margin: '0px 0.5em' }}>
                                                                <Form.Item>
                                                                    <Input defaultValue={exercise.subHeading} placeholder="Enter Sub Heading" onChange={(e) => updateExerciseData(index, 'subHeading', e.target.value)} />
                                                                </Form.Item>
                                                            </span>
                                                            <Popconfirm
                                                                placement="topLeft"
                                                                title={"Are you sure you want to delete this exercise?"}
                                                                onConfirm={() => {
                                                                    removeExercise(index);
                                                                }}
                                                                okText="Yes"
                                                                cancelText="No"
                                                            >
                                                                <CloseCircleFilled />
                                                            </Popconfirm>
                                                        </Row>

                                                        <Row style={{ justifyContent: 'center' }}>
                                                            <ImageUploader imageURI={exercise.image} exerciseNumber={index} addImage={addImage} removeImage={removeImage} />
                                                        </Row>

                                                        {
                                                            exercise?.sections?.map((section, sectionIndex) => {
                                                                return (
                                                                    <div key={section.key} className="sectionContainer" style={{ marginBottom: 10 }}>
                                                                        <Row gutter={10}>
                                                                            <Col flex={1}>
                                                                                <h4>{`Section ${sectionIndex + 1}`}</h4>
                                                                            </Col>
                                                                            <Col>
                                                                                <Popconfirm
                                                                                    placement="topLeft"
                                                                                    title={"Are you sure you want to delete this Section?"}
                                                                                    onConfirm={() => {
                                                                                        removeSection(index, sectionIndex);
                                                                                    }}
                                                                                    okText="Yes"
                                                                                    cancelText="No"
                                                                                >
                                                                                    <CloseCircleOutlined />
                                                                                </Popconfirm>
                                                                            </Col>
                                                                        </Row>
                                                                        <Row gutter={10}>
                                                                            <Col flex={1}>
                                                                                <RichEditor key={section.key} sectionKey={section.key}
                                                                                    onChange={(data: string) => updateSectionData(index, sectionIndex, 'description', data)}
                                                                                    defaultValue={updateImageSasBlob(section.description)}></RichEditor>
                                                                            </Col>
                                                                        </Row>
                                                                    </div>
                                                                )
                                                            })
                                                        }

                                                        <Form.Item>
                                                            <Button style={{ fontWeight: 'bold', color: '#1e90ff' }}
                                                                type="dashed"
                                                                shape="round"
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
                                            style={{ fontWeight: 'bold', color: '#1e90ff' }}
                                            type="dashed"
                                            onClick={() => {
                                                addExercise();
                                            }}
                                            block
                                            shape="round"
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
                    <Preview formData={fromData} />
                </TabPane>
            </Tabs>
            <Button
                style={{ fontWeight: 'bold' }}
                type="primary" block shape="round" disabled={!selectedLessonId || loading || (!edit && alreadyExist)} onClick={() => form.submit()}>
                Submit
            </Button>
        </>
    );
};

export default CreateEdit;
