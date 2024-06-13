import { Button, Card, Tag, Tooltip } from 'antd'
import { FC } from 'react'
import { OlympiadQuestionArray } from '../OlympiadUtils'
import { EditOutlined } from '@ant-design/icons'

interface QuestionCardProps {
    question: OlympiadQuestionArray
}

const QuestionCard: FC<QuestionCardProps> = ({ question }) => {
    return (
        <Card
            size="small"
            title={question.question}
            extra={
                <Tooltip title="edit">
                    <Button type="primary" shape="circle" icon={<EditOutlined />} />
                </Tooltip>
            }
            style={{ width: 300 }}
        >
            <Tag color={question.type === "MCQ" ? "magenta" : question.type === "SPEAKING" ? "red" : question.type === "GENERAL" ? "blue" : "purple"}>{question.type}</Tag>
            <p>Card content</p>
            <p>Card content</p>
            <p>Card content</p>
        </Card>
    )
}

export default QuestionCard