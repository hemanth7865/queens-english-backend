import { deleteOlympiadQuestion } from "@/services/ant-design-pro/api";
import { Modal, notification, Space, Spin, Typography } from "antd";
import { FC, useCallback, useState } from "react";
import {
    OlympiadContentFormType,
    OlympiadQuestionArray,
} from "../OlympiadUtils";

interface QuestionCardAddEditModalProps {
    open: boolean;
    onCancel: () => void;
    selectedQuestion: OlympiadQuestionArray | null;
    handleSuccess: (data: OlympiadContentFormType) => void;
    olympiadId: string;
}

const QuestionDeleteModal: FC<QuestionCardAddEditModalProps> = ({
    open,
    onCancel,
    selectedQuestion,
    handleSuccess,
    olympiadId,
}) => {
    const [loading, setLoading] = useState<boolean>(false);

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
            if (!olympiadId) throw new Error("Please provide olympiad id.");
            if (!selectedQuestion?.id) throw new Error("Please provide question id.");
            setLoading(true);
            const response = await deleteOlympiadQuestion({
                id: olympiadId,
                questionId: selectedQuestion.id,
            });
            if (response?.error) {
                throw new Error(response?.msg);
            }
            if (!response.id) {
                throw new Error(
                    "Something went wrong, couldn't found the id of the record."
                );
            }
            handleSuccess(response);
            openNotificationWithIcon("success", "Question Removed Successfully.");
        } catch (error: any) {
            const errorMessage = error?.message || "Something went wrong.";
            openNotificationWithIcon("error", errorMessage);
        } finally {
            setLoading(false);
        }
    }, [selectedQuestion, olympiadId]);

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            cancelButtonProps={{ loading }}
            okButtonProps={{
                loading,
                style: {
                    background: "#FF4D4F",
                    border: "none",
                },
            }}
            okText={"Yes, delete this question."}
            cancelText={"No, I clicked this by mistake."}
            onOk={handleSave}
        >
            <Spin spinning={loading}>
                <Space direction="vertical" style={{ rowGap: 16, width: "100%" }}>
                    <Typography.Title level={4}>
                        Are you sure you want to delete this question?
                    </Typography.Title>
                    <Typography.Title level={5}>
                        Question : {selectedQuestion?.question}
                    </Typography.Title>
                </Space>
            </Spin>
        </Modal>
    );
};

export default QuestionDeleteModal;
