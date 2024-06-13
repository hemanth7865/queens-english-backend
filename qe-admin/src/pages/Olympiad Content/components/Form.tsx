import { EditOutlined } from "@ant-design/icons";
import { Button, Card, Form, Select, Space, Spin, Tag, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { GRADES, LEVELS, OlympiadContentFormType } from "../OlympiadUtils";
import "./form.css";
import QuestionCard from "./QuestionCard";

export type OlympiadContentFormProps = {
  olympiadData: OlympiadContentFormType | undefined;
  operationType: "create" | "update";
  actionRef: any;
  handleDrawerVisiblity: (visible: boolean) => void;
};

const initialOlympiadQuestion: OlympiadContentFormType = {
  grade: "",
  id: "",
  level: "",
  questions: []
}

const AssessmentContentForm: React.FC<OlympiadContentFormProps> = ({
  olympiadData,
  operationType
}) => {
  const [form] = Form.useForm();
  const [olympiadQuestion, setOlympiadQuestion] = useState<OlympiadContentFormType>(initialOlympiadQuestion);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (operationType === "create") {
      setOlympiadQuestion(initialOlympiadQuestion);
      return;
    }
    if (olympiadData) {
      setOlympiadQuestion(olympiadData)
      return;
    }
    setOlympiadQuestion(initialOlympiadQuestion)
  }, [olympiadData, operationType])

  const onFinish = () => {
    console.log("FINISHED")
  }
  const handleAddQuestionCard = () => {
    console.log("handleAddQuestionCard")
  }

  const levelOptions = LEVELS
    .map((level) => ({
      label: `Level ${level}`,
      value: level,
      key: level,
    }));

  const gradeOptions = GRADES
    .map((grade) => ({
      label: `${grade}`,
      value: grade,
      key: grade,
    }));

  const handleChange = (key: string, value: string) => {
    setOlympiadQuestion((question) => {
      const newQuestion: any = { ...question }
      newQuestion[key] = value
      return newQuestion;
    })
  }

  const defaultValues = () => {
    form.setFieldsValue({
      id: olympiadQuestion.id ?? "",
      level: olympiadQuestion.level || null,
      grade: olympiadQuestion.grade || null,
    });
  };

  useEffect(() => {
    defaultValues();
  }, [olympiadQuestion]);

  return (
    <>
      <Form
        form={form}
        name="olympiadContentForm"
        onFinish={onFinish}
        autoComplete="off"
        id="olympiadQuestionsForm"
        layout="inline"
        style={{ marginBottom: 10 }}
      >
        <Form.Item
          label="Select Level"
          name="level"
          rules={[{ required: true, message: "Please select a Level!" }]}
        >
          <Select
            placeholder="Select a level"
            optionFilterProp="children"
            options={levelOptions}
            clearIcon
            onChange={(value) => {
              handleChange("level", value)
            }}
            disabled={operationType === "update"}
            value={olympiadQuestion.level}
            style={{ width: 200 }}
          />
        </Form.Item>
        <Form.Item
          label="Select Grade"
          name="grade"
          rules={[{ required: true, message: "Please select a Grade!" }]}
        >
          <Select
            placeholder="Select a grade"
            optionFilterProp="children"
            options={gradeOptions}
            clearIcon
            onChange={(value) => {
              handleChange("grade", value)
            }}
            disabled={operationType === "update"}
            value={olympiadQuestion.grade}
            style={{ width: 200 }}
          />
        </Form.Item>
      </Form>
      {olympiadQuestion.level && olympiadQuestion.grade && (
        <Spin spinning={isLoading}>
          <Button onClick={handleAddQuestionCard} style={{ marginBottom: "8px" }} block shape="round">+ Add Question</Button>
        </Spin>
      )}
      <Space direction="horizontal" size={16} wrap>
        {olympiadQuestion?.questions?.map((question) => <QuestionCard question={question} />)}
      </Space>
    </>
  );
};

export default AssessmentContentForm;
