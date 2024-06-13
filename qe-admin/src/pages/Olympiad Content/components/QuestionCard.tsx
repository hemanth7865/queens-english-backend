import { Button, Card, Tag, Tooltip } from "antd";
import { FC } from "react";
import { OlympiadQuestionArray } from "../OlympiadUtils";
import { EditOutlined } from "@ant-design/icons";

interface QuestionCardProps {
    question: OlympiadQuestionArray;
    handleEdit: (question: OlympiadQuestionArray) => void;
}

const QuestionCard: FC<QuestionCardProps> = ({ question, handleEdit }) => {
    const color =
        question.type === "MCQ"
            ? "magenta"
            : question.type === "SPEAKING"
                ? "red"
                : question.type === "GENERAL"
                    ? "blue"
                    : "purple";

    return (
        <Card
            size="small"
            title={question.question}
            extra={
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
            }
            style={{ width: 300 }}
        >
            <Tag color={color}>{question.type}</Tag>
            <p>Card content</p>
            <p>Card content</p>
            <p>Card content</p>
        </Card>
    );
};

export default QuestionCard;
