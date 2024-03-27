import { changeActiveLesson } from '@/services/ant-design-pro/api'
import { LESSONS } from '../../../../config/lessons'
import { useCallback, useEffect, useState } from 'react'
import {
    Button,
    Input,
    Modal,
    Select,
    Spin,
} from "antd";
import { CheckCircleTwoTone, CheckOutlined, CloseCircleTwoTone, CloseOutlined, EditOutlined } from '@ant-design/icons';

const ActiveLessonContainer = ({ entity, notificationCall }: any) => {
    const [lesson, setLesson] = useState(entity.lessonNumber)
    const [edit, setEdit] = useState(false)
    const [loading, setLoading] = useState(false)
    const [filteredLesson, setFilteredLesson] = useState<any[]>([])

    const cancel = () => {
        setLesson(entity.lessonNumber)
        setEdit(false)
        setLoading(false)
    }

    useEffect(() => {
        const startLessonNumber: number = parseInt(LESSONS.find((_l: { id: any; }) => _l.id === entity?.startingLessonId)?.number as string ?? 1)
        const endLessonNumber: number = parseInt(LESSONS.find((_l: { id: any; }) => _l.id === entity?.endingLessonId)?.number as string ?? 399)
        const actualLessons = LESSONS.filter((_l: { number: string; }) => parseInt(_l.number) >= startLessonNumber && parseInt(_l.number) <= endLessonNumber)
        setLesson(entity?.lessonNumber)
        setFilteredLesson(actualLessons)
    }, [entity])

    const [iSreasonModalVisible, setReasonModalVisible] = useState(false);
    const [reason, setReason] = useState('');

    const handleSubmit = useCallback(async () => {
        try {
            setLoading(true);
            const res = await changeActiveLesson(entity.id, lesson, reason)
            if (res?.success) {
                notificationCall.open({
                    message: "Active lesson changed successfully",
                    icon: <CheckCircleTwoTone twoToneColor='green' />
                });
                setLoading(false);
                setReasonModalVisible(false);
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        } catch (error: any) {
            setLoading(false);
            notificationCall.open({
                message: error.message || "Something went wrong",
                icon: <CloseCircleTwoTone twoToneColor='red' />
            });
        };
    }, [entity, lesson, reason]);


    const handleCancel = () => {
        setReasonModalVisible(false);
    }
    const handleOk = useCallback(async () => {
        if (reason === '' || reason === null || reason === undefined) {
            notificationCall.open({
                message: "Please enter reason",
                icon: <CloseCircleTwoTone twoToneColor='red' />
            });
            return;
        }
        await handleSubmit();

    }, [reason, handleSubmit]);


    return (
        <div
            style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
            }}
        >
            <Modal
                title="Lesson Status"
                open={iSreasonModalVisible}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel} disabled={loading}>
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={handleOk}
                        disabled={
                            reason === "" || reason === null || reason === undefined
                        }
                        loading={loading}
                    >
                        Submit
                    </Button>,
                ]}
            >
                <p>Are you sure you want to change active lesson?</p>
                <p>If yes, please enter reason for changing active lesson.</p>
                <label htmlFor="reason">Reason</label>
                <Input.TextArea
                    rows={4}
                    id="reason"
                    placeholder="Please write reason for changing active lesson"
                    onChange={(e) => {
                        setReason(e.target.value);
                    }}
                    required
                />
            </Modal>
            {loading ? (
                <Spin />
            ) : (
                <>
                    {!edit && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: "80%",
                            }}
                        >
                            {lesson}
                            <a
                                onClick={() => {
                                    setEdit(true);
                                }}
                            >
                                <EditOutlined />
                            </a>
                        </div>
                    )}
                    {edit && (
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "nowrap",
                                gap: "5px",
                                width: "100%",
                            }}
                        >
                            <Select
                                showSearch
                                onChange={(value) => {
                                    setLesson(value);
                                }}
                                value={lesson}
                                filterOption={(input, option: any) =>
                                    option?.children
                                        .toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0
                                }
                                options={filteredLesson.map((_l) => ({
                                    value: _l.number,
                                    label: _l.number,
                                }))}
                            />
                            <Button
                                shape="circle"
                                disabled={parseInt(entity.lessonNumber) === parseInt(lesson)}
                                onClick={() => {
                                    setReasonModalVisible(true);
                                }}
                            >
                                <CheckOutlined />
                            </Button>
                            <Button danger shape="circle" onClick={cancel}>
                                <CloseOutlined />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default ActiveLessonContainer