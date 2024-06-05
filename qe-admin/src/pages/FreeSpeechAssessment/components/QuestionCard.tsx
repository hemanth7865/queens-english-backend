import { CloseOutlined } from "@ant-design/icons";
import { Card, Input, Form, Modal } from "antd";
import React, { useEffect } from "react";
import "./form.css";
import { getStorageFileURL } from "@/services/ant-design-pro/helpers";
import ImageUploader from "./ImageUploader";

export type QuestionCardProps = {
    question: string;
    index: number;
    number: number;
    handleContentChange: (value: any) => void;
    handleCardRemove: (value: any) => void;
    imageUrl?: string;
    assessmentName: string;
};

const QuestionCard: React.FC<QuestionCardProps> = ({ ...props }) => {
    const [form] = Form.useForm();
    const [imageURI, setImageURI] = React.useState<any>(
        props.imageUrl ? getStorageFileURL(props.imageUrl) : undefined
    );
    const [openModal, setOpenModal] = React.useState<any>(false);

    const defaultValues = () => {
        form.setFieldsValue({
            question: props.question ?? "",
            imageUrl: props.imageUrl ?? "",
        });
    };

    useEffect(() => {
        defaultValues();
        if (props.imageUrl) {
            setImageURI(getStorageFileURL(props.imageUrl));
        } else {
            setImageURI(undefined);
        }
    }, [props]);

    return (
        <Card
            title={`Question Number ${props.index + 1}`}
            style={{
                width: 400,
                margin: "5px",
                borderRadius: "15px",
                boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
            }}
            extra={
                <CloseOutlined
                    style={{ cursor: "pointer" }}
                    onClick={() => setOpenModal(true)}
                    title="Remove Question"
                />
            }
            cover={
                <ImageUploader
                    imageURI={imageURI}
                    setImageURI={(data) => setImageURI(data)}
                    questionNumber={props.number}
                    data={{
                        assessmentName: props.assessmentName,
                        setNumber: 1,
                        number: props.number,
                        index: props.index,
                    }}
                    handleContentChange={(data) =>
                        props.handleContentChange({
                            imageUrl: data.imageUrl,
                        })
                    }
                />
            }
        >
            <Form
                name="studentdetails"
                form={form}
                labelCol={{
                    span: 6,
                }}
                wrapperCol={{
                    span: 17,
                }}
                autoComplete="off"
                scrollToFirstError
                key={props.index}
            >
                <Form.Item
                    label="Question"
                    name="question"
                    rules={[
                        {
                            required: true,
                            message: "Please enter Question",
                        },
                    ]}
                >
                    <Input
                        placeholder="Enter Question"
                        onChange={(e) =>
                            props.handleContentChange({
                                question: e.target.value,
                                number: props.number,
                            })
                        }
                    />
                </Form.Item>

                <Form.Item label="Image URL" name="imageUrl" hidden>
                    <Input
                        disabled
                        placeholder="Enter Image URL"
                        onChange={(e) =>
                            props.handleContentChange({
                                imageUrl: e.target.value,
                                number: props.number,
                            })
                        }
                    />
                </Form.Item>
            </Form>
            <Modal
                title="Modal"
                open={openModal}
                onOk={() => {
                    props.handleCardRemove(props);
                    setOpenModal(false);
                }}
                onCancel={() => setOpenModal(false)}
                okText="Delete Question"
                cancelText="Cancel"
            >
                Are you sure you want to delete this question ?
            </Modal>
        </Card>
    );
};

export default QuestionCard;
