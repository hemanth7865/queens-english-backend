import React, { useState, useEffect } from "react";
import { Form, Spin } from "antd";

export type ViewProps = {
    data: any
};

const View: React.FC<ViewProps> = (props) => {

    const [isLoading, setIsLoading] = useState(false);

    const [form] = Form.useForm();

    return (
        <>
            <Spin spinning={isLoading}>
                <Form
                    name="lessonView"
                    form={form}
                    labelCol={{
                        span: 8,
                    }}
                    wrapperCol={{
                        span: 16,
                    }}
                    autoComplete="off"
                >
                    <div>
                        <h1>View Lesson</h1>
                    </div>
                </Form>
            </Spin>
        </>
    );
};

export default View;
