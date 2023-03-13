import { CloseOutlined, EditOutlined, EyeOutlined, PlusCircleOutlined, PlusSquareFilled } from '@ant-design/icons';
import { Card, Input, Select, Form, Space } from 'antd';
import React, { useEffect } from 'react';
import './form.css';

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
};

const QuestionCard: React.FC<QuestionCardProps> = (props) => {
    const [form] = Form.useForm();
    const [hideImageURL, setHideImageURL] = React.useState(props.type === "image" ? false : true);

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
            cover={
                props.type === "image" && props.imageUrl ?
                    <>
                        <img
                            alt="example"
                            src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                            className='image' />
                        <div className="image_overlay">
                            <Space size="small">
                                <div className="image_remove">
                                    <CloseOutlined style={{ cursor: "pointer", marginInline: "20px" }} title="Remove Image" />
                                </div>
                                <div className="image_edit">
                                    <EditOutlined style={{ cursor: "pointer", marginInline: "20px" }} title="Change Image" />
                                </div>
                            </Space>
                        </div>
                    </>
                    :
                    <>
                        <PlusSquareFilled style={{ marginLeft: "1px", marginTop: "25px", fontSize: '25px', cursor: "pointer" }} title="Add Image" />
                    </>

            }
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
                >
                    <Input placeholder="Enter Image URL" onChange={(e) => props.handleContentChange({ imageUrl: e.target.value, number: props.number, index: props.index })} />
                </Form.Item>
            </Form>
        </Card >
    );
};

export default QuestionCard;