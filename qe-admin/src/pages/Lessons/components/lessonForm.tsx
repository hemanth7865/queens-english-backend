import React, { useEffect, useState } from 'react';
import {
    Form,
    Input,
    Button,
    Select,
    Spin,
    notification
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    MinusCircleOutlined
  } from "@ant-design/icons";
export type LessonFormProps = {
    tempData: {
        operation?: string,
    }
}

const LessonForm: React.FC<LessonFormProps> = (props) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [exercises, setExercises] = useState([
        {
            id: 1,
            heading: 'test',
            subHeading: '',
            image: '',
            imagePosition: '',
            content: '',

        }
    ]);
    const [form] = Form.useForm()

    const addExercise = () => {
        setExercises((ex) => [
            ...ex,
            {
                id: exercises.length + 1,
                heading: '',
                subHeading: '',
                image: '',
                imagePosition: '',
                content: '',
            }
        ])
    }

    const handleFormChange = (e: { target: { name: any; value: any; }; }, value: any) => {
        setExercises((value) => ({
          ...value,
          [e.target.name]: e.target.value,
        }));
        console.log('input one');
    };

    return (
        <>
            <Spin spinning={isLoading} ></Spin>

            <Form
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 10 }}
                layout="horizontal"
                form={form}
                autoComplete="off"
                scrollToFirstError
            >
                <Form.Item label="Lesson Number" name='lessonNumber'
                    rules={[{
                        required: true,
                    }]}>
                    <Input />
                </Form.Item>
                {exercises.map((exercise, index) => (
                    <div style={{ width: 100 + "%", border: "1px solid #ccc", borderRadius: "5px", marginBottom: "1em" }}>
                        {exercise.id}
                        <Form.Item label="Heading" name="exercise.heading"
                            rules={[{
                                required: true,
                            }]}>
                            <Input name="exercise.heading"/>
                        </Form.Item>
                        <Form.Item label="Sub Heading" name="exercise.subHeading"
                            rules={[{
                                required: true,
                            }]}>
                            <Input name="exercise.subHeading"/>
                        </Form.Item>
                    </div>
                ))}
                
                <div style={{textAlign: "right"}}>
                <Button
                    type="primary"
                    key="primary"
                    onClick={() => { addExercise(); }}
                >
                    <PlusOutlined /> Add Exercise
                </Button>
                </div>
            </Form>
        </>
    )
};

export default LessonForm;