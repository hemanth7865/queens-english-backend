import { getOlympiadQuestions } from "@/services/ant-design-pro/api";
import { Button, Form, Select, Space, Spin } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import {
  GRADES,
  LEVELS,
  OlympiadContentFormType,
  OlympiadQuestionArray,
} from "../OlympiadUtils";
import "./form.css";
import QuestionCard from "./QuestionCard";
import QuestionCardAddEditModal from "./QuestionCardAddEditModal";
import QuestionDeleteModal from "./QuestionDeleteModal";

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
  questions: [],
};

const AssessmentContentForm: React.FC<OlympiadContentFormProps> = ({
  olympiadData,
  operationType,
}) => {
  const [form] = Form.useForm();
  const [olympiadQuestion, setOlympiadQuestion] =
    useState<OlympiadContentFormType>(initialOlympiadQuestion);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] =
    useState<OlympiadQuestionArray | null>(null);

  useEffect(() => {
    if (operationType === "create") {
      setOlympiadQuestion(initialOlympiadQuestion);
      setSelectedLevel(null);
      setSelectedGrade(null);
      return;
    }
    if (olympiadData) {
      setOlympiadQuestion(olympiadData);
      setSelectedLevel(olympiadData.level);
      setSelectedGrade(olympiadData.grade);
      return;
    }
    setOlympiadQuestion(initialOlympiadQuestion);
    setSelectedLevel(null);
    setSelectedGrade(null);
  }, [olympiadData, operationType]);

  const handleAddQuestion = () => {
    setShowModal(true);
    setSelectedQuestion(null);
  };
  const handleEditQuestion = (question: OlympiadQuestionArray) => {
    setShowModal(true);
    setSelectedQuestion(question);
  };
  const handleDelete = (question: OlympiadQuestionArray) => {
    setShowDeleteModal(true);
    setSelectedQuestion(question);
  };
  const handleCancel = () => {
    setShowModal(false);
    setShowDeleteModal(false);
    setSelectedQuestion(null);
  };
  const handleSuccess = (data: OlympiadContentFormType) => {
    handleCancel();
    setOlympiadQuestion(data);
  };

  const levelOptions = LEVELS.map((level) => ({
    label: `Level ${level}`,
    value: level,
    key: level,
  }));

  const gradeOptions = GRADES.map((grade) => ({
    label: `${grade}`,
    value: grade,
    key: grade,
  }));

  const handleChange = (key: string, value: string) => {
    if (key === "level") {
      setSelectedLevel(value);
    }
    if (key === "grade") {
      setSelectedGrade(value);
    }
  };

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

  const handleFetchExistingOlympiadQuestion = useCallback(async () => {
    if (!selectedGrade || !selectedLevel) return;
    try {
      setIsLoading(true);
      const { data } = await getOlympiadQuestions({
        level: selectedLevel,
        grade: selectedGrade,
      });
      const existingRecord = data?.[0];
      if (existingRecord) {
        setOlympiadQuestion(existingRecord);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, [selectedGrade, selectedLevel]);

  useEffect(() => {
    handleFetchExistingOlympiadQuestion();
  }, [handleFetchExistingOlympiadQuestion]);

  return (
    <>
      <Form
        form={form}
        name="olympiadContentForm"
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
              handleChange("level", value);
            }}
            disabled={operationType === "update"}
            value={selectedLevel}
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
              handleChange("grade", value);
            }}
            disabled={operationType === "update"}
            value={selectedGrade}
            style={{ width: 200 }}
          />
        </Form.Item>
      </Form>
      {selectedLevel && selectedGrade && (
        <Spin spinning={isLoading}>
          <Button
            onClick={handleAddQuestion}
            style={{ marginBottom: "8px" }}
            block
            shape="round"
          >
            + Add Question
          </Button>
        </Spin>
      )}
      <Spin spinning={isLoading}>
        <Space direction="horizontal" size={16} wrap align="start">
          {olympiadQuestion?.questions?.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              handleEdit={handleEditQuestion}
              handleDelete={handleDelete}
            />
          ))}
        </Space>
      </Spin>
      {selectedGrade && selectedLevel && (
        <QuestionCardAddEditModal
          open={showModal}
          onCancel={handleCancel}
          selectedQuestion={selectedQuestion}
          selectedLevel={selectedLevel}
          selectedGrade={selectedGrade}
          handleSuccess={handleSuccess}
        />
      )}
      {olympiadQuestion.id && (
        <QuestionDeleteModal
          open={showDeleteModal}
          onCancel={handleCancel}
          olympiadId={olympiadQuestion.id}
          selectedQuestion={selectedQuestion}
          handleSuccess={handleSuccess}
        />
      )}
    </>
  );
};

export default AssessmentContentForm;
