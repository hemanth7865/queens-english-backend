import { Button, Form, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { OlympiadContentFormType } from "../OlympiadUtils";
import "./form.css";

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

  return (
    <>
      <Spin spinning={isLoading}>
        <Button onClick={handleAddQuestionCard} style={{ marginBottom: "8px", backgroundColor: "black", color: "white" }} block shape="round">+ Add Question</Button>
      </Spin>
      <Spin spinning={isLoading}>
        <Button type="primary" htmlType="submit" block shape="round" form="assessmentQuestionsForm" key="submit">
          Submit
        </Button>
      </Spin>
    </>
  );
};

export default AssessmentContentForm;
