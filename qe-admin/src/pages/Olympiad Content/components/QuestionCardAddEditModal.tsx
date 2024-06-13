import {
    Button,
    Input,
    Modal,
    notification,
    Select,
    Space,
    Spin,
    Switch,
    Typography,
} from "antd";
import { FC, useCallback, useEffect, useState } from "react";
import { OlympiadContentFormType, OlympiadQuestionArray, Option, TYPES } from "../OlympiadUtils";
import { DeleteFilled } from "@ant-design/icons";
import { saveOlympiadQuestion } from "@/services/ant-design-pro/api";

interface QuestionCardAddEditModalProps {
    open: boolean;
    onCancel: () => void;
    selectedQuestion: OlympiadQuestionArray | null;
    selectedLevel: string;
    selectedGrade: string;
    handleSuccess: (data: OlympiadContentFormType) => void
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
    handleSuccess
}) => {
    const typeOptions = TYPES.map((type) => ({
        label: `${type}`,
        value: type,
        key: type,
    }));

    const [questionRecord, setQuestionRecord] = useState<OlympiadQuestionArray>(
        initialQuestionRecord
    );
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (selectedQuestion) {
            setQuestionRecord(selectedQuestion);
            return;
        }
        setQuestionRecord(initialQuestionRecord);
    }, [selectedQuestion]);

    const handleTypeChange = useCallback(
        (value) => {
            let options = questionRecord.options;
            let correctOption = questionRecord.correctOption;
            if (value === "MCQ" || value === "LISTENING") {
                if (!options || options.length === 0) {
                    options = [
                        {
                            option: "a",
                            value: "",
                        },
                    ];
                    correctOption = "a";
                }
            } else {
                options = [];
                correctOption = "";
            }
            setQuestionRecord((pre) => ({
                ...pre,
                type: value,
                options,
                correctOption,
            }));
        },
        [questionRecord]
    );

    const rearrangeOptions = (
        options: Option[]
    ): { options: Option[]; updatedCurrentAnswer: string | null } => {
        const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
        options.sort((a, b) => a.option.localeCompare(b.option));

        let updatedCurrentAnswer = null;

        options.forEach((option, index) => {
            if (option.option !== LETTERS[index]) {
                if (option.option === questionRecord.correctOption) {
                    updatedCurrentAnswer = LETTERS[index];
                }
                option.option = LETTERS[index];
            }
        });

        return { options, updatedCurrentAnswer };
    };

    const handleAddOption = useCallback(() => {
        let updatedOptions = questionRecord.options || [];
        updatedOptions.push({
            option: "f",
            value: "",
        });
        const { options, updatedCurrentAnswer } = rearrangeOptions(updatedOptions);
        setQuestionRecord({
            ...questionRecord,
            options: options,
            correctOption: updatedCurrentAnswer
                ? updatedCurrentAnswer
                : questionRecord.correctOption,
        });
    }, [questionRecord]);

    const handleRemoveOption = useCallback(
        (option: string) => {
            if (option === questionRecord.correctOption) {
                questionRecord.correctOption = "";
            }
            let updatedOptions =
                questionRecord.options?.filter((curOp) => curOp.option !== option) ||
                [];
            const { options, updatedCurrentAnswer } =
                rearrangeOptions(updatedOptions);
            setQuestionRecord({
                ...questionRecord,
                options: options,
                correctOption: updatedCurrentAnswer
                    ? updatedCurrentAnswer
                    : questionRecord.correctOption,
            });
        },
        [questionRecord]
    );

    const openNotificationWithIcon = (
        type: "success" | "error" | "info" | "warning",
        message?: string
    ) => {
        notification[type]({
            message: message,
            description: "",
        });
    };

    const handleSave = useCallback(async () => {
        try {
            if (!selectedLevel) throw new Error("Please Select level.");
            if (!selectedGrade) throw new Error("Please Select Grade.");
            setLoading(true);
            const dataToShare = {
                grade: selectedGrade,
                level: selectedLevel,
                questionRecord: questionRecord
            }
            const response = await saveOlympiadQuestion(dataToShare)
            console.log("response", response)
            if (response?.error) {
                throw new Error(response?.msg)
            }
            if (!response.id) {
                throw new Error("Something went wrong, couldn't found the id of the record.")
            }
            handleSuccess(response)
            openNotificationWithIcon("success", "Question Added / Updated Successfully.");
        } catch (error: any) {
            const errorMessage = error?.message || "Something went wrong."
            openNotificationWithIcon("error", errorMessage);
        } finally {
            setLoading(false);
        }
    }, [questionRecord, selectedGrade, selectedLevel]);

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            cancelButtonProps={{ loading }}
            okButtonProps={{ loading }}
            okText={"Save Question"}
            onOk={handleSave}
        >
            <Spin spinning={loading}>
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
                    {(questionRecord.type === "MCQ" ||
                        questionRecord.type === "LISTENING") && (
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
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "flex-end",
                                                justifyContent: "space-between",
                                                columnGap: 10,
                                            }}
                                            key={option.option}
                                        >
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
                                                            checked={
                                                                questionRecord.correctOption === option.option
                                                            }
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
                                            <Button
                                                type="primary"
                                                shape="circle"
                                                danger
                                                icon={<DeleteFilled />}
                                                onClick={() => {
                                                    handleRemoveOption(option.option);
                                                }}
                                            />
                                        </div>
                                    ))}
                                    <Button type="primary" shape="round" onClick={handleAddOption}>
                                        Add Option
                                    </Button>
                                </Space>
                            </div>
                        )}
                </Space>
            </Spin>
        </Modal>
    );
};

export default QuestionCardAddEditModal;
