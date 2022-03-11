import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, notification } from "antd";

export type OnBordingFormProps = {
};


const OnBordingForm: React.FC<OnBordingFormProps> = (props) => {
  

  const onFinish = async (values: any) => {
    console.log("Success:", values);
    
  };

  
  const [form] = Form.useForm();
  const defaultValues = () => {
    form.setFieldsValue({
    });
  };
  useEffect(() => {
    defaultValues();
  }, []);

  return (
    <Form
      form={form}
      name="basic"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 15 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      autoComplete="off"
    >
      <Form.Item name="email" label="Email">
        <Input placeholder="Email" name="email" />
      </Form.Item>

      <Form.Item name="studentName" label="Student Name">
        <Input placeholder="Student Name" name="studentName" />
      </Form.Item>

      <Form.Item name="customerName" label="Customer Name">
        <Input placeholder="Customer Name" name="customerName" />
      </Form.Item>
      
      <Form.Item name="registrationNo" label="Registration Number">
        <Input placeholder="Registration Number" name="registrationNo" />
      </Form.Item>

      <Form.Item name="whatsappNo" label="Whatsapp Number">
        <Input placeholder="Whatsapp Number" name="whatsappNo" />
      </Form.Item>

      <Form.Item name="altNo" label="Alternate Number">
        <Input placeholder="Alternate Number" name="altNo" />
      </Form.Item>

      <Form.Item name="custNo" label="Customer Number">
        <Input placeholder="Customer Number" name="custNo" />
      </Form.Item>

      <Form.Item name="custEmail" label="Customer Email">
        <Input placeholder="Customer Email" name="custEmail" />
      </Form.Item>

      <Form.Item name="custAddr" label="Customer Address">
        <Input placeholder="Customer Address" name="custAddr" />
      </Form.Item>

      <Form.Item name="custState" label="Customer State">
        <Input placeholder="Customer State" name="custState" />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default OnBordingForm;
