import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, notification, Spin, Card, Col, Row, Tabs } from "antd";
import { getAssessmentQuestions, putAssessment, getLesson } from "@/services/ant-design-pro/api";
import Assessments from "../../../../data/assessmentsUAT.json";

export type AssessmentContentQuestion = [
  {
    number: string;
    question: string;
    answer: string;
    type: string;
    imageUrl?: string;
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

  const [assessment, setAssessment] = useState<any>({});
  const [setNumber, setSetNumber] = useState<any>("");
  const [isLoading, setIsLoading] = useState<any>(false);
  const [questionCards, setQuestionCards] = useState<any>([]);

  useEffect(() => {
    if (props.assessmentData) {
      setQuestionCards(props.assessmentData.assessmentQuestion.map((question: any, index: number) => (
        <Card title={`Question ${index + 1}`} style={{ width: 300, margin: 10 }}>
          <Input defaultValue={question.question} />
          <Input defaultValue={question.answer} />
        </Card>
      )));
    }
  }, [props.assessmentData]);

  async function setToCreate(data: any) {
    setIsLoading(true);
    const existingSets = await getAssessmentQuestions({ current: 1, pageSize: 10, assessmentId: data.value });
    setSetNumber(`${existingSets.data.length + 1}`);
    await getAssessmentDetails(data, existingSets);
    setIsLoading(false);
  }

  async function getAssessmentDetails(data: any, existingSets?: any) {
    if (existingSets.data.length > 0) {
      setAssessment(existingSets.data[0]);
    } else {
      const lesson = await getLesson(JSON.stringify(data.lessonNumber));
      const assessmentData = {
        lessonNumber: data.lessonNumber.toString(),
        lessonId: lesson.id,
        name: data.assessmentName,
        assessmentId: data.value,
        setNumber: setNumber,
        id: `${data.value}-${setNumber}`
      }
      setAssessment(assessmentData);
      console.log("asssessmentData", assessmentData, "assessment", assessment);
    }
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
    setTimeout(() => {
      window.location.reload()
    }, 1000);
  };

  const onFinish = async (values: any) => {
    const data = {
      setNumber: values.setNumber,
      assessmentId: values.assessmentId,
      assessmentQuestion: values.assessmentQuestion,
      id: values.id,
      name: values.name,
      lessonNumber: values.lessonNumber,
      lessonId: values.lessonId
    };
    try {
      const msg = await putAssessment({
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
          <Tabs defaultActiveKey="1">
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
                  rules={[{ required: true, message: "Please input lesson number!" }]}
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
                  rules={[{ required: true, message: "Please input lesson number!" }]}
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
                  rules={[{ required: true, message: "Please input name!" }]}
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
                  rules={[{ required: true, message: "Please input ID!" }]}
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
                  rules={[{ required: true, message: "Please input lesson ID!" }]}
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
                  label="Assessment Question"
                  name="assessmentQuestion"
                  rules={[{ required: true, message: "Please input assessment question!" }]}
                >
                  {questionCards}
                </Form.Item>
              </Spin>
            </TabPane>
          </Tabs>
        </>
      ) : (
        <>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Assessment Details" key="1">
              <div align="center">
                <Form.Item
                  label="Assessment ID"
                  name="assessmentId"
                  rules={[{ required: true, message: "Please input assessment ID!" }]}
                >
                  <Input disabled />
                </Form.Item>

                <Form.Item
                  label="Set Number"
                  name="setNumber"
                  rules={[{ required: true, message: "Please input set number!" }]}
                >
                  <Input disabled />
                </Form.Item>

                <Form.Item
                  label="Lesson Number"
                  name="lessonNumber"
                  rules={[{ required: true, message: "Please input lesson number!" }]}
                >
                  <Input disabled />
                </Form.Item>

                <Form.Item
                  label="Name"
                  name="name"
                  rules={[{ required: true, message: "Please input name!" }]}
                >
                  <Input disabled />
                </Form.Item>

                <Form.Item
                  label="ID"
                  name="id"
                  rules={[{ required: true, message: "Please input ID!" }]}
                >
                  <Input disabled />
                </Form.Item>

                <Form.Item
                  label="Lesson ID"
                  name="lessonId"
                  rules={[{ required: true, message: "Please input lesson ID!" }]}
                >
                  <Input disabled />
                </Form.Item>
              </div>
            </TabPane>
            <TabPane tab="Assessment Questions" key="2">
              <Form.Item
                label="Assessment Question"
                name="assessmentQuestion"
                rules={[{ required: true, message: "Please input assessment question!" }]}
              >
                {questionCards}
              </Form.Item>
            </TabPane>
          </Tabs>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit" block>
              Submit
            </Button>
          </Form.Item>
        </>
      )
      }
    </Form >
  );
};

export default AssessmentContentForm;
