import { CloseCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Card, Input, Select, Form, Image, Divider } from 'antd';
import React from 'react';

const typeOptions = [{ value: 'word', label: 'word' }, { value: 'image', label: 'image' }]

export type QuestionCardProps = {
    operationType: "create" | "update";
    question: string;
    answer: string;
    type: string;
    index: number;
    array: any;
    imageUrl?: string;
    handleContentChange?: (value: any) => void;
};

const QuestionCard: React.FC<QuestionCardProps> = (props) => {
    const [form] = Form.useForm();
    const [assessment, setAssessment] = React.useState({ assessmentQuestion: [] });
    const [hideImageURL, setHideImageURL] = React.useState(props.type === "image" ? false : true);
    const [question, setQuestion] = React.useState(props.question);
    const [answer, setAnswer] = React.useState(props.answer);
    const [type, setType] = React.useState(props.type);
    const [imageUrl, setImageUrl] = React.useState(props.imageUrl);

    async function onFinish(values: any) {
        console.log(values);
    }

    async function onFinishFailed(errorInfo: any) {
        console.log('Failed:', errorInfo);
    }

    async function removeQuestionCard(questionCard: any) {
        props.array.splice(questionCard.index, 1)
    }

    console.log("props", props.array)

    return (
        <Card title={`Question Number ${props.index + 1}`} style={{ width: 400, margin: "10px" }}
            extra={<CloseOutlined style={{ cursor: "pointer" }} onClick={() => removeQuestionCard(props)} />}
            cover={
                <img
                    alt="example"
                    src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                />
            }
        >
            <Form
                name="studentdetails"
                form={form}
                labelCol={{
                    span: 7,
                }}
                wrapperCol={{
                    span: 16,
                }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                scrollToFirstError
            >
                <Form.Item
                    label="Question"
                    name="question"
                >
                    <Input placeholder="Enter Question" defaultValue={question} onChange={(e) => setQuestion(e.target.value)} />
                </Form.Item>
                <Form.Item
                    label="Answer"
                    name="answer"
                >
                    <Input placeholder="Enter Answer" defaultValue={answer} onChange={(e) => setAnswer(e.target.value)} />
                </Form.Item>
                <Form.Item
                    label="Question Type"
                    name="type"
                >
                    <Select
                        placeholder="Select Question Type"
                        allowClear
                        options={typeOptions}
                        defaultValue={type}
                        onChange={(value) => {
                            setType(value);
                            if (value === "image") {
                                setHideImageURL(false);
                            } else {
                                setHideImageURL(true);
                            }
                        }} />
                </Form.Item>
                <Form.Item
                    label="Image URL"
                    name="imageUrl"
                    hidden={hideImageURL}
                >
                    <Input placeholder="Enter Image URL" defaultValue={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                </Form.Item>
                <Button type="primary" style={{ display: "block" }} shape="round" block onClick={() => console.log(props)}>{props.operationType === "update" ? "Update Question" : "Create Question"}</Button>
            </Form>
        </Card >
    );
};

export default QuestionCard;