import { CloseOutlined } from '@ant-design/icons';
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
    update: number
    setIsLoading: (value: boolean) => void;
    key?: number;
};

const QuestionCard: React.FC<QuestionCardProps> = (props) => {
    const [form] = Form.useForm();
    const [imageURI, setImageURI] = React.useState<any>(props.imageUrl ? getImageURL(props.imageUrl) : undefined);

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
        } else {
            setImageURI(undefined);
        }
    }, [props.update]);

    return (
        <Card title={`Question Number ${props.number}`} style={{ width: 400, margin: "5px", borderRadius: "15px", boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)" }}
            extra={<CloseOutlined style={{ cursor: "pointer" }} onClick={() => props.handleCardRemove(props)} title="Remove Question" />}
            cover={<ImageUploader imageURI={imageURI} setImageURI={data => setImageURI(data)} questionNumber={props.number} data={props} handleContentChange={(data) => props.handleContentChange(data)} update={props.update} />}
            key={props.key}
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
                            message: 'Please enter Question!',
                        }
                    ]}
                >
                    <Input placeholder="Enter Question" onChange={(e) => props.handleContentChange({ question: e.target.value, number: props.number, index: props.index })} />
                </Form.Item>
                <Form.Item
                    label="Answer"
                    name="answer"
                    rules={[
                        {
                            required: true,
                            message: 'Please enter Answer!',
                        }
                    ]}
                >
                    <Input placeholder="Enter Answer" onChange={(e) => props.handleContentChange({ answer: e.target.value, number: props.number, index: props.index })} />
                </Form.Item>
                <Form.Item
                    label="Type"
                    name="type"
                    tooltip="To change the Question Type just add or remove the image."
                    hidden
                >
                    <Select
                        disabled
                        placeholder="Select Question Type"
                        allowClear
                        options={typeOptions}
                        onSelect={(value) => { props.handleContentChange({ type: value, number: props.number, index: props.index }); }}
                    />
                </Form.Item>
                <Form.Item
                    label="Image URL"
                    name="imageUrl"
                >
                    <Input disabled placeholder="Enter Image URL" onChange={(e) => props.handleContentChange({ imageUrl: e.target.value, number: props.number, index: props.index })} />
                </Form.Item>
            </Form>
        </Card >
    );
};

export default QuestionCard;