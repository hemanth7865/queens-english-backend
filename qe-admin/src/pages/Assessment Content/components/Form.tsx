import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, notification, Spin, Tabs } from "antd";
import { getAssessmentQuestions, updateAssessmentContent, getLesson } from "@/services/ant-design-pro/api";
import QuestionCard from "./QuestionCard";
import Assessments from "../../../../data/assessmentsUAT.json";
import "./form.css"

export type AssessmentContentQuestion = [
  {
    number: string;
    question: string;
    answer: string;
    type: string;
    imageUrl?: any;
    uri?: string;
  }
];

export type AssessmentContentFormType = {
  setNumber: string;
  assessmentId: string;
  assessmentQuestion: AssessmentContentQuestion;
  id: string;
  name: string;
  lessonNumber: string;
  lessonId: string;
};

export type AssessmentContentFormProps = {
  assessmentData: AssessmentContentFormType | undefined;
  operationType: "create" | "update";
};

const { TabPane } = Tabs;

const AssessmentContentForm: React.FC<AssessmentContentFormProps> = (props) => {

  const [form] = Form.useForm();
  let setNumber = ""
  const [assessment, setAssessment] = useState<any>(props.assessmentData ? props.assessmentData : { setNumber: "", assessmentId: "", assessmentQuestion: [{ number: "", question: "", answer: "", type: "", imageUrl: "" }], id: "", name: "", lessonNumber: "", lessonId: "" });
  const [isLoading, setIsLoading] = useState<any>(false);
  const [questionCards, setQuestionCards] = useState<any>([]);
  const [disableQuestionsTab, setDisableQuestionsTab] = useState<any>(true);
  const [assessmentQuestionsArray, setAssessmentQuestionsArray] = useState<any>(props.assessmentData?.assessmentQuestion ? props.assessmentData.assessmentQuestion : []);

  function editAssessmentQuestion(index: number, question?: string, answer?: string, type?: string, imageUrl?: string, number?: string) {
    const originalAssessment = assessment;
    const updatedAssessmentQuestion = originalAssessment.assessmentQuestion;

    if (!updatedAssessmentQuestion[index]) {
      updatedAssessmentQuestion[index] = {
        number: "",
        question: "",
        answer: "",
        type: "",
        imageUrl: ""
      }
    }

    if (question) {
      updatedAssessmentQuestion[index].question = question;
    }
    if (answer) {
      updatedAssessmentQuestion[index].answer = answer;
    }
    if (type) {
      updatedAssessmentQuestion[index].type = type;
    }
    if (imageUrl) {
      updatedAssessmentQuestion[index].imageUrl = imageUrl;
    }
    if (number) {
      updatedAssessmentQuestion[index].number = number;
    }

    originalAssessment.assessmentQuestion = updatedAssessmentQuestion;

    setAssessmentQuestionsArray(updatedAssessmentQuestion);
    setAssessment(originalAssessment);
    form.setFieldsValue(originalAssessment);
  }

  const handleRemoveQuestionCard = (questionCard: any) => {
    setAssessmentQuestionsArray(assessmentQuestionsArray.filter((item: any) => item.number !== questionCard.number));
  };

  const handleAddQuestionCard = () => {
    const alreadyPresentQuestions = assessmentQuestionsArray;
    if (!alreadyPresentQuestions) {
      setAssessmentQuestionsArray([
        {
          number: "1",
          question: "",
          answer: "",
          type: "",
          imageUrl: ""
        }
      ])
    } else {
      setAssessmentQuestionsArray((assessmentQuestion: any) => (
        [...assessmentQuestion,
        {
          number: assessmentQuestion.length + 1,
          question: "",
          answer: "",
          type: "",
          imageUrl: ""
        }
        ]
      ))
    }
  }

  useEffect(() => {
    if (props.operationType === "update") {
      setAssessment(props.assessmentData);
    }
    setQuestionCards(() => (
      assessmentQuestionsArray.map((question: any, index: number) => (
        <QuestionCard
          index={index}
          number={question.number}
          question={question.question}
          answer={question.answer}
          type={question.type}
          imageUrl={question.imageUrl}
          operationType={props.operationType}
          handleCardRemove={(index) => handleRemoveQuestionCard(index)}
          handleContentChange={(returnedData) => editAssessmentQuestion(returnedData.index, returnedData?.question, returnedData?.answer, returnedData?.type, returnedData?.imageUrl, returnedData?.number)}
        />
      ))
    ))
  }, [assessmentQuestionsArray, assessment]);

  async function setToCreate(data: any) {
    setIsLoading(true);
    const existingSets = await getAssessmentQuestions();
    const sets = existingSets.data.filter(({ assessmentId }) => assessmentId === data.value);
    if (sets.length < 9) {
      setNumber = `0${sets.length + 1}`;
    } else {
      setNumber = `${sets.length + 1}`;
    }
    await getAssessmentDetails(data);
    setDisableQuestionsTab(false);
    setIsLoading(false);
  }

  async function getAssessmentDetails(data: any) {
    const lesson = await getLesson(JSON.stringify(data.lessonNumber));
      const assessmentData = {
        lessonNumber: data.lessonNumber.toString(),
        lessonId: lesson.id,
        name: data.assessmentName,
        assessmentId: data.value,
        setNumber: setNumber,
        id: `${data.value}-${setNumber}`,
        assessmentQuestion: assessmentQuestionsArray
      }
    setAssessment(assessmentData);
    form.setFieldsValue(assessmentData);
  }

  const assessmentOptions = Assessments.map((assessment) => (
    { label: `${assessment.name} ~ Due at Lesson ${assessment.lessonDue}`, value: assessment.id, key: assessment.id, assessmentName: assessment.name, lessonNumber: assessment.lessonDue }
  ));

  const openNotificationWithIcon = (type: string) => {
    notification[type]({
      message: type == 'error' ? 'Failed to update assessment questions!' : 'Successfully updated assessment questions!',
      description:
        '',
    });
  };

  const onFinish = async (values: any) => {
    const data = {
      setNumber: values.setNumber,
      assessmentId: values.assessmentId,
      assessmentQuestion: assessmentQuestionsArray,
      id: values.id,
      name: values.name,
      lessonNumber: values.lessonNumber,
      lessonId: values.lessonId,
      operation: "update"
    };
    try {
      const msg = await updateAssessmentContent({
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (msg.status === "ok") {
        console.log("API sucessfull", msg);
      }
      openNotificationWithIcon('success')
    } catch (error) {
      console.log("API error", error);
      openNotificationWithIcon('error')
    }
  };

  const defaultValues = () => {
    form.setFieldsValue({
      setNumber: props.assessmentData?.setNumber ?? "",
      assessmentId: props.assessmentData?.assessmentId ?? "",
      assessmentQuestion: props.assessmentData?.assessmentQuestion ?? assessmentQuestionsArray,
      id: props.assessmentData?.id ?? "",
      name: props.assessmentData?.name ?? "",
      lessonNumber: props.assessmentData?.lessonNumber ?? "",
      lessonId: props.assessmentData?.lessonId ?? "",
    });
  };

  useEffect(() => {
    defaultValues();
  }, [props.assessmentData?.id]);

  return (
    <>
      <>
        <Tabs defaultActiveKey={props.operationType === "create" ? "1" : "2"} >
          <TabPane tab="Assessment Details" key="1" forceRender disabled={props.operationType === "create" ? false : true}>
            <Form
              form={form}
              name="assessmentContentForm"
              labelCol={{ span: 7 }}
              wrapperCol={{ span: 18 }}
              initialValues={{ remember: true }}
              onFinish={onFinish}
              autoComplete="off"
              id="assessmentQuestionsForm"
            >
              <Form.Item
                label="Select Assessment"
                name="assessmentId"
                rules={[{ required: true, message: "Please select an Assessment to proceed!" }]}
              >
                <Select
                  placeholder="Select an assessment"
                  optionFilterProp="children"
                  options={assessmentOptions}
                  clearIcon
                  onChange={(value, option) => { setToCreate(option); }}
                  disabled={props.operationType === "create" ? false : true}
                />
              </Form.Item>

              <Spin spinning={isLoading}>
                <Form.Item
                  label="Set Number"
                  name="setNumber"
                >
                  <Input disabled />
                </Form.Item>

                <Form.Item
                  label="Lesson Number"
                  name="lessonNumber"
                >
                  <Input disabled />
                </Form.Item>

                <Form.Item
                  label="Name"
                  name="name"
                >
                  <Input disabled />
                </Form.Item>

                <Form.Item
                  label="ID"
                  name="id"
                >
                  <Input disabled />
                </Form.Item>

                <Form.Item
                  label="Lesson ID"
                  name="lessonId"
                >
                  <Input disabled />
                </Form.Item>
              </Spin>
            </Form >
            </TabPane>
            <TabPane tab="Assessment Questions" key="2" style={{
              display: "grid",
              justifyContent: "center",
              alignItems: "center"
          }}
            disabled={props.operationType === 'create' ? disableQuestionsTab : false}
            forceRender >
              <Spin spinning={isLoading}>
                  {questionCards}
                <Button onClick={handleAddQuestionCard} style={{ marginBottom: "8px", backgroundColor: "black", color: "white" }} block shape="round">+ Add Question</Button>
              </Spin>
            </TabPane>
          </Tabs>
        <Button type="primary" htmlType="submit" block shape="round" form="assessmentQuestionsForm" key="submit">
              Submit
          </Button>
        </>

      {/* <>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Assessment Questions" key="1" style={{
                display: "grid",
                justifyContent: "center",
                alignItems: "center"
              }}
                forceRender >
                <Spin spinning={isLoading}>
                  {questionCards}
                  <Button onClick={handleAddQuestionCard} style={{ marginBottom: "8px", backgroundColor: "black", color: "white" }} block shape="round">+ Add Question</Button>
                </Spin>
              </TabPane>
            </Tabs>
            <Button type="primary" htmlType="submit" block shape="round" form="assessmentQuestionsForm" key="submit">
              Submit
            </Button>
          </> */}

    </>
  );
};

export default AssessmentContentForm;
