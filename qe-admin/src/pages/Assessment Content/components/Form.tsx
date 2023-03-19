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
  actionRef: any;
  handleDrawerVisiblity: (visible: boolean) => void;
};

const { TabPane } = Tabs;

const AssessmentContentForm: React.FC<AssessmentContentFormProps> = (props) => {

  const [form] = Form.useForm();
  const [assessment, setAssessment] = useState<any>(props.assessmentData ? props.assessmentData : { setNumber: "", assessmentId: "", assessmentQuestion: [], id: "", name: "", lessonNumber: "", lessonId: "" });
  const [isLoading, setIsLoading] = useState<any>(false);
  const [questionCards, setQuestionCards] = useState<any>([]);
  const [disableQuestionsTab, setDisableQuestionsTab] = useState<any>(true);
  const [update, setUpdate] = useState<any>(0);

  function editAssessmentQuestion(index: number, question?: string, answer?: string, type?: string, imageUrl?: string, number?: string, imageRemove?: boolean) {
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
    if (imageRemove) {
      updatedAssessmentQuestion[index].imageUrl = undefined;
    }

    originalAssessment.assessmentQuestion = updatedAssessmentQuestion;

    setAssessment({ ...assessment, assessmentQuestion: updatedAssessmentQuestion });
    form.setFieldsValue(originalAssessment);
    setUpdate(update + 1);
  }

  async function removeEmptyQuestions() {
    const originalAssessment = assessment;
    const updatedAssessmentQuestion = originalAssessment.assessmentQuestion;
    const filteredQuestions = await updatedAssessmentQuestion.filter((question: any) => question.question !== "" || question.answer !== "");
    originalAssessment.assessmentQuestion = filteredQuestions;
    setAssessment({ ...assessment, assessmentQuestion: filteredQuestions });
    form.setFieldsValue(originalAssessment);
    for (let i = 0; i < filteredQuestions.length; i++) {
      if (Number(filteredQuestions[i].number) !== i + 1) {
        return false
      }
    }
    return filteredQuestions;
  }

  const handleRemoveQuestionCard = (questionCard: any) => {
    setAssessment({ ...assessment, assessmentQuestion: assessment.assessmentQuestion.filter((item: any) => item.number !== questionCard.number) });
    setUpdate(update + 1);
  };

  const handleAddQuestionCard = () => {
    const alreadyPresentQuestions = assessment.assessmentQuestion;
    if (!alreadyPresentQuestions) {
      setAssessment({
        ...assessment, assessmentQuestion: [
          {
            number: "1",
            question: "",
            answer: "",
            type: "word",
            imageUrl: ""
          }
        ]
      })
      setUpdate(update + 1);
    } else {
      setAssessment({
        ...assessment,
        assessmentQuestion: [
          ...assessment.assessmentQuestion,
          {
            number: assessment.assessmentQuestion.length + 1,
            question: "",
            answer: "",
            type: "word",
            imageUrl: ""
          }
        ]
      })
      setUpdate(update + 1);
    }
  }

  useEffect(() => {
    setQuestionCards(() => (
      assessment.assessmentQuestion.map((question: any, index: number) => (
        <QuestionCard
          index={index}
          number={question.number}
          question={question.question}
          answer={question.answer}
          type={question.type}
          imageUrl={question.imageUrl ? question.imageUrl : undefined}
          operationType={props.operationType}
          handleCardRemove={(index) => handleRemoveQuestionCard(index)}
          handleContentChange={(returnedData) => editAssessmentQuestion(returnedData.index, returnedData?.question, returnedData?.answer, returnedData?.type, returnedData?.imageUrl, returnedData?.number, returnedData?.imageRemove)}
          assessmentName={assessment.name}
          setNumber={assessment.setNumber}
          update={update}
          setIsLoading={(data) => setIsLoading(data)}
          key={index}
        />
      ))
    ))
  }, [update]);

  async function setToCreate(data: any) {
    setIsLoading(true);
    const existingSets = await getAssessmentQuestions();
    const sets = existingSets.data.filter(({ assessmentId }) => assessmentId === data.value);
    setAssessment({ ...assessment, setNumber: `0${sets.length + 1}` });
    form.setFieldsValue({ setNumber: `0${sets.length + 1}` });
    await getAssessmentDetails(data, `0${sets.length + 1}`);
    setUpdate(update + 1);
    setDisableQuestionsTab(false);
    setIsLoading(false);
  }

  async function getAssessmentDetails(data: any, setNumber: string) {
    const lesson = await getLesson(JSON.stringify(data.lessonNumber));
      const assessmentData = {
        lessonNumber: data.lessonNumber.toString(),
        lessonId: lesson.id,
        name: data.assessmentName,
        assessmentId: data.value,
        setNumber: setNumber,
        id: `${data.value}-${setNumber}`,
        assessmentQuestion: assessment.assessmentQuestion
      }
    setAssessment(assessmentData);
    form.setFieldsValue(assessmentData);
  }

  const assessmentOptions = Assessments.map((assessment) => (
    { label: `${assessment.name} ~ Due at Lesson ${assessment.lessonDue}`, value: assessment.id, key: assessment.id, assessmentName: assessment.name, lessonNumber: assessment.lessonDue }
  ));

  const openNotificationWithIcon = (type: string, errorType?: string) => {
    notification[type]({
      message: type == 'error' && errorType === "excessQuestions" ? 'Error: Add only upto 15 Questions' : type == 'error' && errorType === "missingQuestions" ? 'Error: Question numbers are not in sequence' : type == 'error' && errorType === "noQuestions" ? 'Error: Need atleast one question in the set' : type == 'error' ? 'Failed to update assessment questions!' : 'Successfully updated assessment questions!',
      description:
        '',
    });
  };

  const onFinish = async (values: any) => {
    const filteredQuestionsArray = await removeEmptyQuestions();
    if (filteredQuestionsArray.length > 15) {
      openNotificationWithIcon('error', 'excessQuestions')
      return;
    }
    if (filteredQuestionsArray.length < 1) {
      openNotificationWithIcon('error', 'noQuestions')
      return;
    }
    if (!filteredQuestionsArray) {
      openNotificationWithIcon('error', 'missingQuestions')
      return;
    }
    const data = {
      setNumber: values.setNumber,
      assessmentId: values.assessmentId,
      assessmentQuestion: filteredQuestionsArray,
      id: values.id,
      name: values.name,
      lessonNumber: values.lessonNumber,
      lessonId: values.lessonId,
      operation: "update"
    };
    try {
      setIsLoading(true);
      await updateAssessmentContent({
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      setIsLoading(false);
      props.handleDrawerVisiblity(false);
      openNotificationWithIcon('success')
      if (props.actionRef.current) {
        props.actionRef.current.reload();
      }
    } catch (error) {
      console.log("API error", error);
      setIsLoading(false);
      openNotificationWithIcon('error')
    }
  };

  const defaultValues = () => {
    form.setFieldsValue({
      setNumber: assessment.setNumber ?? "",
      assessmentId: assessment.assessmentId ?? "",
      assessmentQuestion: assessment.assessmentQuestion ?? assessment.assessmentQuestion,
      id: assessment.id ?? "",
      name: assessment.name ?? "",
      lessonNumber: assessment.lessonNumber ?? "",
      lessonId: assessment.lessonId ?? "",
    });
  };

  useEffect(() => {
    defaultValues();
  }, [assessment.id]);

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
          <TabPane tab="Assessment Questions" key="2"
            disabled={props.operationType === 'create' ? disableQuestionsTab : false}
            forceRender>
            <Spin spinning={isLoading}>
              <div className="question-cards">
                {questionCards}
              </div>
              <Button onClick={handleAddQuestionCard} style={{ marginBottom: "8px", backgroundColor: "black", color: "white" }} block shape="round" hidden={assessment.assessmentQuestion.length >= 15}>+ Add Question</Button>
            </Spin>
            <Button type="primary" htmlType="submit" block shape="round" form="assessmentQuestionsForm" key="submit">
              Submit
            </Button>
          </TabPane>
        </Tabs>
      </>
    </>
  );
};

export default AssessmentContentForm;
