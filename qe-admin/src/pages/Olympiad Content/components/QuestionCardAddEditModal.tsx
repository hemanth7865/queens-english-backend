import { Button, Input, Modal, Select, Space, Switch, Typography } from "antd";
import { FC, useCallback, useEffect, useState } from "react";
import { OlympiadQuestionArray, Option, TYPES } from "../OlympiadUtils";
import { DeleteFilled } from "@ant-design/icons";

interface QuestionCardAddEditModalProps {
    open: boolean;
    onCancel: () => void;
    selectedQuestion: OlympiadQuestionArray | null;
    selectedLevel: string;
    selectedGrade: string;
}

const initialQuestionRecord: OlympiadQuestionArray = {
    id: "",
    question: "",
    type: "MCQ",
};

const { Text } = Typography;

const QuestionCardAddEditModal: FC<QuestionCardAddEditModalProps> = ({
    open,
    onCancel,
    selectedQuestion,
    selectedGrade,
    selectedLevel,
}) => {
    const typeOptions = TYPES.map((type) => ({
        label: `${type}`,
        value: type,
        key: type,
    }));

    const [questionRecord, setQuestionRecord] = useState<OlympiadQuestionArray>(
        initialQuestionRecord
    );

    useEffect(() => {
        if (selectedQuestion) {
            setQuestionRecord(selectedQuestion);
            return;
        }
        setQuestionRecord(initialQuestionRecord);
    }, [selectedQuestion]);

    console.log("questionRecord", questionRecord);

    const handleTypeChange = useCallback(
        (value) => {
            let options = questionRecord.options;
            if (
                questionRecord.type === "MCQ" ||
                questionRecord.type === "LISTENING"
            ) {
                if (!options || options) {
                    options = [
                        {
                            option: "a",
                            value: "",
                        },
                    ];
                }
            }
            setQuestionRecord((pre) => ({ ...pre, type: value, options }));
        },
        [questionRecord]
    );

    const rearrangeOptions = (options: Option[]) => {
        return options;
    }

    const handleAddOption = useCallback(() => {
        let updatedOptions = questionRecord.options || []
        updatedOptions.push({
            option: 'z',
            value: ''
        })
        updatedOptions = rearrangeOptions(updatedOptions)
        setQuestionRecord({ ...questionRecord, options: updatedOptions })
    }, [questionRecord])

    const handleRemoveOption = useCallback((option: string) => {
        if (option === questionRecord.correctOption) {
            questionRecord.correctOption = ""
        }
        let updatedOptions = questionRecord.options?.filter((curOp) => curOp.option !== option) || []
        updatedOptions = rearrangeOptions(updatedOptions);
        setQuestionRecord({ ...questionRecord, options: updatedOptions })
    }, [questionRecord])

    return (
        <Modal open={open} onCancel={onCancel}>
            <Space direction="vertical" style={{ rowGap: 16, width: "100%" }}>
                <div>
                    <Typography.Title level={5}>Question</Typography.Title>
                    <Input
                        defaultValue={questionRecord.question}
                        value={questionRecord.question}
                        onChange={(e) => {
                            setQuestionRecord((pre) => ({
                                ...pre,
                                question: e.target.value,
                            }));
                        }}
                        placeholder="Enter Question"
                    />
                </div>
                <div>
                    <Typography.Title level={5}>Type</Typography.Title>
                    <Select
                        defaultValue={questionRecord.type}
                        value={questionRecord.type}
                        options={typeOptions}
                        style={{ width: "100%" }}
                        onChange={handleTypeChange}
                    />
                </div>
                {questionRecord.type === "MCQ" && (
                    <div>
                        <Typography.Title level={5}>Options</Typography.Title>
                        <Space
                            direction="vertical"
                            style={{
                                rowGap: 10,
                                width: "100%",
                                paddingLeft: 10,
                                paddingRight: 10,
                            }}
                        >
                            {questionRecord.options?.map((option, index) => (
                                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', columnGap: 10 }}>
                                    <div style={{ flex: 1 }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "flex-end",
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            <Typography.Title level={5}>
                                                Option {option.option}
                                            </Typography.Title>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "flex-end",
                                                    columnGap: 10,
                                                }}
                                            >
                                                <Text style={{ margin: 0, padding: 0 }}>
                                                    Correct Answer :{" "}
                                                </Text>
                                                <Switch
                                                    checked={questionRecord.correctOption === option.option}
                                                    size="small"
                                                    onChange={() => {
                                                        setQuestionRecord((pre) => ({
                                                            ...pre,
                                                            correctOption: option.option,
                                                        }));
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <Input
                                            defaultValue={option.value}
                                            value={option.value}
                                            onChange={(e) => {
                                                const updatedOptions = questionRecord.options || [];
                                                updatedOptions[index].value = e.target.value;
                                                setQuestionRecord((pre) => ({
                                                    ...pre,
                                                    options: [...updatedOptions],
                                                }));
                                            }}
                                            placeholder="Option Value"
                                        />
                                    </div>
                                    <Button type="primary" shape="circle" danger icon={<DeleteFilled />} onClick={() => {
                                        handleRemoveOption(option.option)
                                    }} />
                                </div>
                            ))}
                            <Button type="primary" shape="round" onClick={handleAddOption}>Add Option</Button>
                        </Space>
                    </div>
                )}
            </Space>
        </Modal>
    );
};

export default QuestionCardAddEditModal;
