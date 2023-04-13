import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, notification, Spin, Tabs } from "antd";
import { getAssessmentQuestions, updateAssessmentContent, getLesson } from "@/services/ant-design-pro/api";
import QuestionCard from "./QuestionCard";
import Assessments from "../../../../data/assessments.json";
import "./form.css"

export type AssessmentContentQuestion = [
  {
    number: string;
    question: string;
    answer: string;
    type: string;
    imageUrl?: string;
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
  active?: boolean;
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
  const [assessment, setAssessment] = useState<any>(props.assessmentData ? props.assessmentData : { setNumber: "", assessmentId: "", assessmentQuestion: [], id: "", name: "", lessonNumber: "", lessonId: "", active: true });
  const [isLoading, setIsLoading] = useState<any>(false);
  const [questionCards, setQuestionCards] = useState<any>([]);
  const [disableQuestionsTab, setDisableQuestionsTab] = useState<any>(true);
  const [update, setUpdate] = useState<any>(0);
  const [status, setStatus] = useState<boolean>(true);
  const statusOptions = [{ value: true, label: "Active" }, { value: false, label: "Inactive" }];

  function editAssessmentQuestion(index: number, question?: string, instruction?: string, answer?: string, type?: string, imageUrl?: string, number?: string, imageRemove?: boolean, questionRemove?: boolean, instructionRemove?: boolean, answerRemove?: boolean) {
    const originalAssessment = assessment;
    const updatedAssessmentQuestion = originalAssessment.assessmentQuestion;

    if (!updatedAssessmentQuestion[index]) {
      updatedAssessmentQuestion[index] = {
        number: "",
        question: "",
        instruction: "",
        answer: "",
        type: "",
        imageUrl: ""
      }
    }

    if (question) {
      updatedAssessmentQuestion[index].question = question;
    }
    if (instruction) {
      updatedAssessmentQuestion[index].instruction = instruction;
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
    if (questionRemove) {
      updatedAssessmentQuestion[index].question = undefined;
    }
    if (instructionRemove) {
      updatedAssessmentQuestion[index].instruction = undefined;
    }
    if (answerRemove) {
      updatedAssessmentQuestion[index].answer = undefined;
    }

    originalAssessment.assessmentQuestion = updatedAssessmentQuestion;

    setAssessment({ ...assessment, assessmentQuestion: updatedAssessmentQuestion });
    form.setFieldsValue(originalAssessment);
    setUpdate(update + 1);
  }

  async function removeEmptyQuestions() {
    const originalAssessment = assessment;
    const updatedAssessmentQuestion = originalAssessment.assessmentQuestion;
    const filteredQuestions = await updatedAssessmentQuestion.filter((question: any) => question.question && question.answer !== "" || undefined || null);
    originalAssessment.assessmentQuestion = filteredQuestions;
    const updatedAssessment = {
      ...originalAssessment,
      assessmentQuestion: filteredQuestions.map((question: {
        number: string;
        question: string;
        instruction: string,
        answer: string;
        type: string;
        imageUrl?: string;
      }) => {
        if (question.type === "image") {
          return {
            ...question,
            imageUrl: `/${question.imageUrl}`
          };
        }
        return question;
      })
    };
    setAssessment(updatedAssessment);
    form.setFieldsValue(updatedAssessment);
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
            instruction: "",
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
            instruction: "",
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
          instruction={question.instruction}
          answer={question.answer}
          type={question.type}
          imageUrl={question.imageUrl ? question.imageUrl.substring(1) : undefined}
          operationType={props.operationType}
          handleCardRemove={(index) => handleRemoveQuestionCard(index)}
          handleContentChange={(returnedData) => editAssessmentQuestion(returnedData.index, returnedData?.question, returnedData?.instruction, returnedData?.answer, returnedData?.type, returnedData?.imageUrl, returnedData?.number, returnedData?.imageRemove, returnedData?.questionRemove, returnedData?.instructionRemove, returnedData?.answerRemove)}
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
    const sets = existingSets.data.filter(({ assessmentId }: AssessmentContentFormType) => assessmentId === data.value);
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
      displayName: data.displayName,
      assessmentId: data.value,
      setNumber: setNumber,
      id: `${data.value}-${setNumber}`,
      assessmentQuestion: assessment.assessmentQuestion
    }
    setAssessment(assessmentData);
    form.setFieldsValue(assessmentData);
  }

  const assessmentOptions = Assessments.filter((assessment) => assessment.active).map((assessment) => (
      { label: `${assessment.displayName} ~ Due at Lesson ${assessment.lessonDue}`, value: assessment.id, key: assessment.id, assessmentName: assessment.name, lessonNumber: assessment.lessonDue, displayName: assessment.displayName }
    ));


  const openNotificationWithIcon = (type: string, errorType?: string) => {
    notification[type]({
      message: type == 'error' && errorType === "excessQuestions" ? 'Error: Add only upto 15 Questions' : type == 'error' && errorType === "missingQuestions" ? 'Error: Question numbers are not in sequence or the question/answer in middle are empty' : type == 'error' && errorType === "noQuestions" ? 'Error: Need atleast one question in the set' : type == 'error' ? 'Failed to update assessment questions!' : 'Successfully updated assessment questions!',
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
      displayName: values.displayName,
      lessonNumber: values.lessonNumber,
      lessonId: values.lessonId,
      operation: "update",
      active: status
    };

    console.log("data", data)

    try {
      setIsLoading(true);
      const api = await updateAssessmentContent({
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      console.log("api", api)
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
      status: assessment.status ?? "Not Set",
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
                  name="displayName"
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
              <Form.Item
                label="Status"
                name="status"
                rules={[
                  {
                    required: true,
                    message: 'Status cannot be empty!',
                  }
                ]}
                tooltip="This will only save the status in the backend, the frontend implementation for app is not done yet so the set will be visible to the students in the mobile app even if set to inactive or not set."
              >
                <Select
                  placeholder="Select Status of Set"
                  options={statusOptions}
                  onSelect={(value) => { setStatus(value) }}
                  value={status}
                  defaultValue={props.assessmentData?.active ?? true}
                />
              </Form.Item>
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
