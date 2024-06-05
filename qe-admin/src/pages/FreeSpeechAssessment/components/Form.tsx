import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, notification, Spin, Tabs } from "antd";
import {
  updateAssessmentContent,
  getAssessmentQuestions,
} from "@/services/ant-design-pro/api";
import QuestionCard from "./QuestionCard";
import "./form.css";
import CreateAssessmentForm from "./CreateAssessmentForm";

export type AssessmentContentFormProps = {
  assessmentData?: API.AssessmentItem;
  operationType: "create" | "update";
  actionRef: any;
  handleDrawerVisiblity: (visible: boolean) => void;
};

const { TabPane } = Tabs;

const AssessmentContentForm: React.FC<AssessmentContentFormProps> = ({
  ...props
}) => {
  const [assessmentQuestionsRecord, setAssessmentQuestionsRecord] = useState<
    API.AssessmentQuestion | undefined
  >(undefined);

  function editAssessmentQuestion(
    index: number,
    data: {
      question: string;
      imageUrl?: string;
      number: number;
    }
  ) {
    if (!assessmentQuestionsRecord) return;

    const updatedAssessmentQuestion =
      assessmentQuestionsRecord?.assessmentQuestion
        ? [...assessmentQuestionsRecord?.assessmentQuestion]
        : [];

    // remove undefined values or "" from the data object
    Object.keys(data).forEach(
      (key) => (data[key] === undefined || data[key] === "") && delete data[key]
    );

    updatedAssessmentQuestion[index] = {
      ...updatedAssessmentQuestion[index],
      ...data,
    };

    setAssessmentQuestionsRecord({
      ...assessmentQuestionsRecord,
      assessmentQuestion: updatedAssessmentQuestion,
    });
  }

  const removeEmptyQuestions = useCallback(async () => {
    const filteredQuestionsArray =
      assessmentQuestionsRecord?.assessmentQuestion.filter(
        (question: any) => question.question !== ""
      );
    if (!filteredQuestionsArray) return [];

    // sort the questions array by number
    filteredQuestionsArray.sort((a: any, b: any) => a.number - b.number);

    return filteredQuestionsArray;
  }, [assessmentQuestionsRecord]);

  const handleRemoveQuestionCard = useCallback(
    async (questionCard: API.AssessmentQuestion["assessmentQuestion"][0]) => {
      setAssessmentQuestionsRecord((prev) => {
        if (!prev) return;
        const updatedQuestions = prev?.assessmentQuestion.filter(
          (question: any) => question.number !== questionCard.number
        );
        // renumber the questions
        updatedQuestions.forEach((question: any, index: number) => {
          question.number = index + 1;
        });
        return { ...prev, assessmentQuestion: updatedQuestions };
      });
    },
    []
  );

  const handleAddQuestionCard = useCallback(() => {
    if (!assessmentQuestionsRecord) return;
    const currentNumber =
      assessmentQuestionsRecord?.assessmentQuestion?.length ?? 0;
    const newQuestion = {
      number: currentNumber + 1,
      question: "",
    };
    setAssessmentQuestionsRecord({
      ...assessmentQuestionsRecord,
      assessmentQuestion: [
        ...(assessmentQuestionsRecord?.assessmentQuestion ?? []),
        newQuestion,
      ],
    });
  }, [assessmentQuestionsRecord]);

  const QuestionCards = useMemo(
    () =>
      assessmentQuestionsRecord?.assessmentQuestion?.map(
        (question: any, index: number) => (
          <QuestionCard
            index={index}
            number={question.number}
            assessmentName={props.assessmentData?.name ?? ""}
            question={question.question}
            imageUrl={
              question.imageUrl ? question.imageUrl.substring(1) : undefined
            }
            handleCardRemove={(index) => handleRemoveQuestionCard(index)}
            handleContentChange={(returnedData) =>
              editAssessmentQuestion(index, { ...returnedData })
            }
            key={index}
          />
        )
      ) ?? [],
    [assessmentQuestionsRecord]
  );

  const openNotificationWithIcon = (type: string, errorType?: string) => {
    notification[type]({
      message:
        type == "error" && errorType === "excessQuestions"
          ? "Error: Add only upto 15 Questions"
          : type == "error" && errorType === "missingQuestions"
            ? "Error: Question numbers are not in sequence or the question/answer in middle are empty"
            : type == "error" && errorType === "noQuestions"
              ? "Error: Need atleast one question in the set"
              : type == "error"
                ? "Failed to update assessment questions!"
                : "Successfully updated assessment questions!",
      description: "",
    });
  };

  const onFinish = useCallback(async () => {
    if (!assessmentQuestionsRecord || props.assessmentData?.id === undefined)
      return;
    const filteredQuestionsArray = await removeEmptyQuestions();
    if (filteredQuestionsArray.length > 15) {
      openNotificationWithIcon("error", "excessQuestions");
      return;
    }
    if (filteredQuestionsArray.length < 1) {
      openNotificationWithIcon("error", "noQuestions");
      return;
    }
    if (!filteredQuestionsArray) {
      openNotificationWithIcon("error", "missingQuestions");
      return;
    }
    const data = {
      ...assessmentQuestionsRecord,
      setNumber: 1,
      assessmentId: props.assessmentData?.id,
      assessmentQuestion: filteredQuestionsArray,
      id: assessmentQuestionsRecord?.id,
      name: props.assessmentData?.name,
      active: props.assessmentData?.active,
    };

    try {
      setIsLoading(true);
      await updateAssessmentContent({
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      props.handleDrawerVisiblity(false);
      openNotificationWithIcon("success");
      if (props.actionRef.current) {
        props.actionRef.current.reload();
      }
    } catch (error) {
      openNotificationWithIcon("error");
    } finally {
      setIsLoading(false);
    }
  }, [assessmentQuestionsRecord, props]);

  const onSuccessAddedAssessment = () => {
    openNotificationWithIcon("success");
    props.handleDrawerVisiblity(false);
    if (props.actionRef.current) {
      props.actionRef.current.reload();
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  const getAssessmentQuestionsData = useCallback(async () => {
    if (!props.assessmentData || !props.assessmentData.id) return;
    try {
      setIsLoading(true);
      const { data } = await getAssessmentQuestions({
        assessmentId: props.assessmentData?.id,
        isFreeSpeech: true,
      });
      if (data && data.length > 0) {
        setAssessmentQuestionsRecord(data[0]);
      } else if (data.length === 0) {
        setAssessmentQuestionsRecord({
          ...props.assessmentData,
          assessmentId: props.assessmentData?.id,
          assessmentQuestion: [],
          id: "",
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [props.assessmentData]);

  useEffect(() => {
    if (props.operationType === "update") {
      getAssessmentQuestionsData();
    }
  }, [getAssessmentQuestionsData, props.operationType]);

  return (
    <>
      <>
        <Tabs defaultActiveKey={"1"}>
          <TabPane tab="Assessment Details" key="1" forceRender>
            <CreateAssessmentForm
              onSuccess={onSuccessAddedAssessment}
              assessmentData={props.assessmentData}
            />
          </TabPane>
          <TabPane
            tab="Assessment Questions"
            key="2"
            disabled={props.operationType === "create" ? true : false}
            forceRender
          >
            <Spin spinning={isLoading}>
              <div className="question-cards">{QuestionCards}</div>
              <Button
                onClick={handleAddQuestionCard}
                style={{
                  marginBottom: "8px",
                  backgroundColor: "black",
                  color: "white",
                }}
                block
                shape="round"
              >
                + Add Question
              </Button>
            </Spin>
            <Button
              type="primary"
              block
              shape="round"
              form="assessmentQuestionsForm"
              key="submit"
              onClick={onFinish}
            >
              Submit
            </Button>
          </TabPane>
        </Tabs>
      </>
    </>
  );
};

export default AssessmentContentForm;
