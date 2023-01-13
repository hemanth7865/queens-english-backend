import { updateBatchActiveLesson } from '@/services/ant-design-pro/api'
import { LESSONS } from '../../../../config/lessons'
import { useEffect, useState } from 'react'
import {
    Button,
    Select,
    Spin,
} from "antd";
import { CheckCircleTwoTone, CheckOutlined, CloseCircleTwoTone, CloseOutlined, EditOutlined } from '@ant-design/icons';

const ActiveLessonContainer = ({ entity, notificationCall }: any) => {
    const [lesson, setLesson] = useState(entity.lessonNumber)
    const [edit, setEdit] = useState(false)
    const [loading, setLoading] = useState(false)
    const [filteredLesson, setFilteredLesson] = useState([])

    const cancel = () => {
        setLesson(entity.lessonNumber)
        setEdit(false)
        setLoading(false)
    }

    useEffect(() => {
        const startLessonNumber = LESSONS.filter((_l) => _l.id === entity?.startingLessonId)[0]?.number || 1
        const endLessonNumber = LESSONS.filter((_l) => _l.id === entity?.endingLessonId)[0]?.number || 399
        const actualLesson = LESSONS.filter((_l) => parseInt(_l.number) >= parseInt(startLessonNumber) && parseInt(_l.number) <= parseInt(endLessonNumber))
        setFilteredLesson(actualLesson)
    }, [])

    const handleSubmit = async () => {
        setLoading(true)
        try {
            let selectedLessonDetails = LESSONS.filter((_l) => _l.number === lesson)[0]!
            const res = await updateBatchActiveLesson({
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ classProfileId: entity.id, lessonId: selectedLessonDetails.id }),
            });
            console.log(res)
            notificationCall.open({
                message: res?.data?.message,
                icon: res.data.success ? <CheckCircleTwoTone color='green' /> : <CloseCircleTwoTone twoToneColor='red' />
            });
            if (!res?.data?.success) {
                cancel()
            } else {
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        } catch (error: any) {
            notificationCall.open({
                message: typeof error?.message === 'string' ? error?.message : "Something went wrong",
                icon: <CloseCircleTwoTone twoToneColor='red' />,
            });
        }
        setLoading(false)
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
        }}>
            {loading ? <Spin /> : (<>
                {!edit && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '80%',
                    }}>
                        {lesson}
                        <a
                            onClick={() => {
                                setEdit(true)
                            }}
                        >
                            <EditOutlined />
                        </a>
                    </div>
                )}
                {edit && (<div style={{
                    display: 'flex',
                    flexWrap: 'nowrap',
                    gap: '5px',
                    width: '100%'
                }}>
                    <Select
                        showSearch
                        onChange={(value) => {
                            setLesson(value)
                        }}
                        value={lesson}
                        filterOption={(input, option: any) =>
                            option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }>
                        {filteredLesson.map((_l) => (<Option key={_l.id} value={_l.number} label={_l.number}>{_l.number}</Option>))}
                    </Select>
                    <Button
                        shape="circle"
                        disabled={parseInt(entity.lessonNumber) === parseInt(lesson)}
                        onClick={handleSubmit}
                    >
                        <CheckOutlined />
                    </Button>
                    <Button
                        danger
                        shape="circle"
                        onClick={cancel}
                    >
                        <CloseOutlined />
                    </Button>
                </div>
                )}
            </>)}
        </div>
    );
}

export default ActiveLessonContainer