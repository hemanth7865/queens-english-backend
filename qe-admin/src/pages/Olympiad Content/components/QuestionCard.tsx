import { Button, Card, Tag, Tooltip } from "antd";
import { FC } from "react";
import { OlympiadQuestionArray } from "../OlympiadUtils";
import { DeleteFilled, EditOutlined } from "@ant-design/icons";
import { getStorageFileURL } from "@/services/ant-design-pro/helpers";

interface QuestionCardProps {
    question: OlympiadQuestionArray;
    handleEdit: (question: OlympiadQuestionArray) => void;
    handleDelete: (question: OlympiadQuestionArray) => void;
}

const QuestionCard: FC<QuestionCardProps> = ({
    question,
    handleEdit,
    handleDelete,
}) => {
    const color =
        question.type === "MCQ"
            ? "magenta"
            : question.type === "FREE_SPEECH"
                ? "red"
                : question.type === "GENERAL"
                    ? "blue"
                    : "purple";

    return (
        <Card
            size="small"
            title={question.question}
            extra={
                <>
                    <Tooltip title="edit">
                        <Button
                            onClick={() => {
                                handleEdit(question);
                            }}
                            type="primary"
                            shape="circle"
                            icon={<EditOutlined />}
                        />
                    </Tooltip>
                    <Tooltip title="delete">
                        <Button
                            style={{ marginLeft: 5 }}
                            onClick={() => {
                                handleDelete(question);
                            }}
                            type="ghost"
                            shape="circle"
                            danger
                            icon={<DeleteFilled />}
                        />
                    </Tooltip>
                </>
            }
            style={{ width: 300 }}
            cover={
                <>
                    {question?.image && (
                        <div className="image">
                            <img
                                src={getStorageFileURL(question.image)}
                                alt="question-image"
                                className="image_image"
                            />
                        </div>
                    )}
                </>
            }
        >
            <Tag color={color}>{question.type?.replace("_", " ")}</Tag>
            {question.type === "MCQ" && (
                <div style={{ marginTop: 10 }}>
                    <h3>Options: </h3>
                    {question.options?.map((option) => {
                        const isCorrectAnswer = option.option === question.correctOption;
                        return (
                            <h4
                                key={option.option}
                                style={{
                                    margin: 0,
                                    color: isCorrectAnswer ? "green" : "black",
                                    fontWeight: isCorrectAnswer ? "bolder" : "normal",
                                }}
                            >
                                {option.option}: {option.value}
                            </h4>
                        );
                    })}
                </div>
            )}
            {question.type === "FREE_SPEECH" && (
                <div style={{ marginTop: 10 }}>
                    <h3>Expected Answer: </h3>
                    <p>{question.expectedAnswer}</p>
                </div>
            )}
            {question.type === "GENERAL" && (
                <div style={{ marginTop: 10 }}>
                    <h3>Topic: </h3>
                    <p>{question.topic}</p>
                </div>
            )}
        </Card>
    );
};

export default QuestionCard;
