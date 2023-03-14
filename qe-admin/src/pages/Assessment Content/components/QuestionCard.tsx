import { CloseOutlined, EditOutlined } from '@ant-design/icons';
import { Card, Input, Select, Form } from 'antd';
import React, { useEffect } from 'react';
import './form.css';
import { getImageURL } from '@/services/ant-design-pro/helpers';
import ImageUploader from './ImageUploader';

const typeOptions = [{ value: 'word', label: 'word' }, { value: 'image', label: 'image' }]

export type QuestionCardProps = {
    operationType: "create" | "update";
    question: string;
    answer: string;
    type: string;
    index: number;
    number: string;
    handleContentChange: (value: any) => void;
    handleCardRemove: (value: any) => void;
    imageUrl?: string;
    assessmentName?: string;
    setNumber?: string;
    imagesToUpload?: any[];
    setImagestoUpload: (imagesToUpload: any) => void;
};

const QuestionCard: React.FC<QuestionCardProps> = (props) => {
    const [form] = Form.useForm();
    const [hideImageURL, setHideImageURL] = React.useState(props.type === "image" ? false : true);
    const [imageURI, setImageURI] = React.useState("");

    const defaultValues = () => {
        form.setFieldsValue({
            question: props.question ? props.question : "",
            type: props.type ? props.type : "",
            answer: props.answer ? props.answer : "",
            imageUrl: props.imageUrl ? props.imageUrl : "",
        });
    };

    useEffect(() => {
        defaultValues();
        if (props.imageUrl) {
            setImageURI(getImageURL(props.imageUrl));
        }
    }, [props.type, props.operationType, props.question, props.answer, props.imageUrl]);

    async function onFinish(values: any) {
        console.log(values);
    }

    async function onFinishFailed(errorInfo: any) {
        console.log('Failed:', errorInfo);
    }

    return (
        <Card title={`Question Number ${props.number}`} style={{ width: 400, margin: "10px" }}
            extra={<CloseOutlined style={{ cursor: "pointer" }} onClick={() => props.handleCardRemove(props)} title="Remove Question" />}
            cover={<ImageUploader imageUrl={imageURI} questionNumber={props.number} data={props} imagesToUpload={props.imagesToUpload} setImagestoUpload={(imagesToUpload) => props.setImagestoUpload(imagesToUpload)} />}
            key={props.index}
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
                key={props.index}
            >
                <Form.Item
                    label="Question"
                    name="question"
                >
                    <Input placeholder="Enter Question" onChange={(e) => props.handleContentChange({ question: e.target.value, number: props.number, index: props.index })} />
                </Form.Item>
                <Form.Item
                    label="Answer"
                    name="answer"
                >
                    <Input placeholder="Enter Answer" onChange={(e) => props.handleContentChange({ answer: e.target.value, number: props.number, index: props.index })} />
                </Form.Item>
                <Form.Item
                    label="Question Type"
                    name="type"
                >
                    <Select
                        placeholder="Select Question Type"
                        allowClear
                        options={typeOptions}
                        onSelect={(value) => { props.handleContentChange({ type: value, number: props.number, index: props.index }); setHideImageURL(value === "image" ? false : true); }}
                    />
                </Form.Item>
                <Form.Item
                    label="Image URL"
                    name="imageUrl"
                    hidden={hideImageURL}
                    tooltip="To edit or remove the image from the question please use the buttons below"
                >
                    <Input placeholder="Enter Image URL" onChange={(e) => props.handleContentChange({ imageUrl: e.target.value, number: props.number, index: props.index })} />
                </Form.Item>
            </Form>
        </Card >
    );
};

export default QuestionCard;