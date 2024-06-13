import { CloseOutlined } from '@ant-design/icons';
import { Card, Input, Select, Form, Modal } from 'antd';
import React, { useEffect } from 'react';
import './form.css';
import { getStorageFileURL } from '@/services/ant-design-pro/helpers';
import ImageUploader from './ImageUploader';

const typeOptions = [{ value: 'word', label: 'word' }, { value: 'image', label: 'image' }]

export type QuestionCardProps = {
    operationType: "create" | "update";
    question: string;
    instruction: string;
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
    const [imageURI, setImageURI] = React.useState<any>(props.imageUrl ? getStorageFileURL(props.imageUrl) : undefined);
    const [openModal, setOpenModal] = React.useState<any>(false);

    const defaultValues = () => {
        form.setFieldsValue({
            question: props.question ?? "",
            instruction: props.instruction ?? "",
            type: props.type ?? "",
            answer: props.answer ?? "",
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
    }, [props.update]);

    return (
        <Card title={`Question Number ${props.index + 1}`} style={{ width: 400, margin: "5px", borderRadius: "15px", boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)" }}
            extra={<CloseOutlined style={{ cursor: "pointer" }} onClick={() => setOpenModal(true)} title="Remove Question" />}
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
                            message: 'Please enter Question',
                        }
                    ]}
                >
                    <Input placeholder="Enter Question" onChange={(e) => props.handleContentChange({ question: e.target.value, number: props.number, index: props.index, questionRemove: e.target.value.length === 0 ? true : false })} />
                </Form.Item>
                <Form.Item
                    label="Instruction"
                    name="instruction"
                    rules={[
                        {
                            required: false,
                            message: 'Please Enter Teacher Instruction',
                        }
                    ]}
                >
                    <Input placeholder="Enter Teacher Instruction" onChange={(e) => props.handleContentChange({ instruction: e.target.value, number: props.number, index: props.index, instructionRemove: e.target.value.length === 0 ? true : false })} />
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
                    <Input placeholder="Enter Answer" onChange={(e) => props.handleContentChange({ answer: e.target.value, number: props.number, index: props.index, answerRemove: e.target.value.length === 0 ? true : false })} />
                </Form.Item>
                <p hidden={!props.question || !props.answer ? false : true}><small style={{ color: "red" }}>Leaving mandatory field empty will remove the question entirely upon form submit</small></p>
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
                    hidden
                >
                    <Input disabled placeholder="Enter Image URL" onChange={(e) => props.handleContentChange({ imageUrl: e.target.value, number: props.number, index: props.index })} />
                </Form.Item>
            </Form>
            <Modal
                title="Modal"
                open={openModal}
                onOk={() => { props.handleCardRemove(props); setOpenModal(false); }}
                onCancel={() => setOpenModal(false)}
                okText="Delete Question"
                cancelText="Cancel"
            >
                Are you sure you want to delete this question ?
            </Modal>
        </Card >
    );
};

export default QuestionCard;