import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, notification, Spin, Card, Col, Row, Tabs } from "antd";
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

  let setNumber = ""
  const [assessment, setAssessment] = useState<any>({});
  const [isLoading, setIsLoading] = useState<any>(false);
  const [questionCards, setQuestionCards] = useState<any>([]);
  const [hideImageURL, sethideImageURL] = useState(true)
  const typeOptions = [{ value: 'text', label: 'text' }, { value: 'image', label: 'image' }]

  const handleQuestionChange = (value: string, index: number) => {
    if (props.assessmentData) {
      props.assessmentData.assessmentQuestion[index].question = value;
    } else {
      setAssessment({ ...assessment, assessmentQuestion: [{ ...assessment.assessmentQuestion, question: value }] })
    }
  }

  const handleAnswerChange = (value: any, index: number) => {
    if (props.assessmentData) {
      props.assessmentData.assessmentQuestion[index].answer = value;
    } else {
      setAssessment({ ...assessment, assessmentQuestion: [{ ...assessment.assessmentQuestion, answer: value }] })
    }
  }

  const handleImageChange = (value: any, index: number) => {
    if (props.assessmentData) {
      props.assessmentData.assessmentQuestion[index].imageUrl = value;
    } else {
      setAssessment({ ...assessment, assessmentQuestion: [{ ...assessment.assessmentQuestion, imageUrl: value }] })
    }
  }

  const handleTypeChange = (value: any, index: number) => {
    if (value === "image") {
      sethideImageURL(false)
    }
    if (props.assessmentData) {
      props.assessmentData.assessmentQuestion[index].type = value;
    } else {
      setAssessment({ ...assessment, assessmentQuestion: [{ ...assessment.assessmentQuestion, type: value }] })
    }
  }

  const modifyQuestionCard = async (data: { question: string, answer: string, type: string, imageUrl: string, index: number }) => {
    setAssessment({ ...assessment, assessmentQuestion: [{ number: data.index + 1, question: data.question, answer: data.answer, type: data.type, imageUrl: data.imageUrl }] })
  }

  const handleAddQuestionCard = () => {
    const alreadyPresentQuestions = questionCards;
    setQuestionCards(
      [...alreadyPresentQuestions,
      <Card key={alreadyPresentQuestions.length + 1} title={`Question ${alreadyPresentQuestions.length + 1}`} style={{ width: 300, margin: 10 }}>
        <Input placeholder="Enter Question" />
        <Input placeholder="Enter Answer" />
        <Select
          placeholder="Select Question Type"
          allowClear
          options={typeOptions}
        />
        <Input placeholder="Enter Image URL" hidden={hideImageURL} />
        <Button onClick={(data) => modifyQuestionCard(data)}>Add Question</Button>
      </Card>
      ])
  }

  useEffect(() => {
    if (props.assessmentData) {
      for (let i = 0; i < props.assessmentData.assessmentQuestion.length; i++) {
        if (props.assessmentData.assessmentQuestion[i].type === "image") {
          // Need to add logic to get the image from the assets folder
        }
      }
      setQuestionCards(props.assessmentData.assessmentQuestion.map((question: any, index: number, array) => (
        <QuestionCard
          index={index}
          question={question.question}
          answer={question.answer}
          type={question.type}
          imageUrl={question.imageUrl}
          handleContentChange={(returnedData) => modifyQuestionCard(returnedData)}
          operationType={props.operationType}
          array={array}
        />
      )))
    }
  }
    , [props.assessmentData]);

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
        assessmentQuestion: questionCards
      }
    setAssessment(assessmentData);
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
    console.log(assessment)
    const data = {
      setNumber: props.assessmentData.setNumber ? props.assessmentData.setNumber : setNumber,
      assessmentId: props.assessmentData.assessmentId,
      assessmentQuestion: props.assessmentData.assessmentQuestion,
      id: props.assessmentData.id,
      name: props.assessmentData.name,
      lessonNumber: props.assessmentData.lessonNumber,
      lessonId: props.assessmentData.lessonId,
      operation: "update"
    };
    console.log("data", data)
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

  const [form] = Form.useForm();

  const defaultValues = () => {
    form.setFieldsValue({
      setNumber: props.assessmentData?.setNumber ?? "",
      assessmentId: props.assessmentData?.assessmentId ?? "",
      assessmentQuestion: props.assessmentData?.assessmentQuestion ?? [],
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
    <Form
      form={form}
      name="assessmentContentForm"
      labelCol={{ span: 7 }}
      wrapperCol={{ span: 18 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      autoComplete="off"
    >
      {props.operationType === "create" ? (
        <>
          <Tabs defaultActiveKey="1" >
            <TabPane tab="Assessment Details" key="1">
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
                />
              </Form.Item>

              <Spin spinning={isLoading}>
                <Form.Item
                  label="Set Number"
                  name="setNumber"
                  getValueProps={() => {
                    return {
                      value: assessment.setNumber,
                    };
                  }}
                >
                  <Input disabled />
                </Form.Item>

                <Form.Item
                  label="Lesson Number"
                  name="lessonNumber"
                  getValueProps={() => {
                    return {
                      value: assessment.lessonNumber,
                    };
                  }}
                >
                  <Input disabled />
                </Form.Item>

                <Form.Item
                  label="Name"
                  name="name"
                  getValueProps={() => {
                    return {
                      value: assessment.name,
                    };
                  }}
                >
                  <Input disabled />
                </Form.Item>

                <Form.Item
                  label="ID"
                  name="id"
                  getValueProps={() => {
                    return {
                      value: assessment.id,
                    };
                  }}
                >
                  <Input disabled />
                </Form.Item>

                <Form.Item
                  label="Lesson ID"
                  name="lessonId"
                  getValueProps={() => {
                    return {
                      value: assessment.lessonId,
                    };
                  }}
                >
                  <Input disabled />
                </Form.Item>
              </Spin>
            </TabPane>
            <TabPane tab="Assessment Questions" key="2">
              <Spin spinning={isLoading}>
                <Form.Item
                  name="assessmentQuestion"
                >
                  {questionCards}
                  <Button onClick={handleAddQuestionCard}>+ Add</Button>
                </Form.Item>
              </Spin>
            </TabPane>
          </Tabs>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit" block>
              Submit
            </Button>
          </Form.Item>
        </>
      ) : (
        <>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Assessment Questions" key="2" style={{
                display: "grid",
                justifyContent: "center",
                alignItems: "center"
              }}>
                {questionCards}
            </TabPane>
            </Tabs>
            <Button type="primary" htmlType="submit" block shape="round">
              Submit
            </Button>
        </>
      )
      }
    </Form >
  );
};

export default AssessmentContentForm;
