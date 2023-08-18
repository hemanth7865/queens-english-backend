import { addeditbatch, getIndividualBatch } from '@/services/ant-design-pro/api'
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
    const [filteredLesson, setFilteredLesson] = useState<any[]>([])

    const cancel = () => {
        setLesson(entity.lessonNumber)
        setEdit(false)
        setLoading(false)
    }

    useEffect(() => {
        const startLessonNumber: number = parseInt(LESSONS.find((_l) => _l.id === entity?.startingLessonId)?.number as string ?? 1)
        const endLessonNumber: number = parseInt(LESSONS.find((_l) => _l.id === entity?.endingLessonId)?.number as string ?? 399)
        const actualLessons = LESSONS.filter((_l) => parseInt(_l.number) >= startLessonNumber && parseInt(_l.number) <= endLessonNumber)
        setLesson(entity?.lessonNumber)
        setFilteredLesson(actualLessons)
    }, [entity])

    const getFormData = async (rowval: any) => {
        const selectedLessonDetails = LESSONS.filter((_l) => _l.number === lesson)[0]!
        return await getIndividualBatch(rowval.id)
            .then((data: any) => {
                const batchData = data.data;
                const dataObject: any = {}

                dataObject.id = batchData.classes.id;
                dataObject.batchAvailability = [{}]

                let reformatData: any[] = batchData?.students.map((elem: any) => {
                    elem.value = elem.studentId
                    elem.label = `${elem?.student?.firstName} ${elem?.student?.lastName} - ${elem?.student?.phoneNumber}`;
                    elem.key = elem.id
                    return elem
                }) || []

                dataObject.students = [...reformatData]
                dataObject.edit = true;
                dataObject.schoolId = batchData?.classes?.schoolId;

                dataObject.activeLessonId = selectedLessonDetails?.id;
                dataObject.classCode = batchData?.classes?.classCode || "";
                dataObject.batchNumber = batchData.classes.batchNumber;
                dataObject.zoomLink = batchData?.classes?.zoomLink || "";
                dataObject.zoomInfo = batchData?.classes?.zoomInfo || "";
                dataObject.whatsappLink = batchData?.classes?.whatsappLink || "";

                dataObject.teacherId = batchData?.classes?.teacherId;
                dataObject.startingLessonId = batchData?.classes?.startingLessonId;
                dataObject.endingLessonId = batchData?.classes?.endingLessonId;
                dataObject.classStartDate = batchData?.classes?.classStartDate;
                dataObject.classEndDate = batchData?.classes?.classEndDate;
                dataObject.lessonStartTime = batchData?.classes?.lessonStartTime;
                dataObject.lessonEndTime = batchData?.classes?.lessonEndTime;
                dataObject.ageGroup = batchData?.classes?.ageGroup;
                dataObject.frequency = batchData?.classes?.frequency;
                dataObject.useNewZoomLink = batchData?.classes?.useNewZoomLink;
                dataObject.useAutoAttendance = batchData?.classes?.useAutoAttendance;
                dataObject.offlineBatch = batchData?.classes?.offlineBatch;
                dataObject.followupVersion = batchData?.classes?.followupVersion;
                dataObject.followupVersion = batchData?.classes?.followupVersion;

                return dataObject;
            })
            .catch((error) => {
                console.log(error);
                return false;
            })
    };

    const createEditBatch = async (data?: any) => {
        const msg = await addeditbatch({
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (msg.success) {
            if (msg.data[0]?.message) {
                notificationCall.open({
                    message: msg.data[0].message || "Some error occured",
                    icon: <CloseCircleTwoTone twoToneColor='red' />
                });
            } else {
                notificationCall.open({
                    message: "Batch Active Lesson Updated Successfully.",
                    icon: <CheckCircleTwoTone color='green' />
                });
                setLoading(false);
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        }
    }

    const handleSubmit = async () => {
        if (confirm('Are you sure you want to change active lesson ?')) {
            try {
                setLoading(true);
                const dataForm = await getFormData(entity)
                if (!dataForm) {
                    notificationCall.open({
                        message: "Something went wrong, while fetching batch data.",
                        icon: <CloseCircleTwoTone twoToneColor='red' />
                    });
                    setLoading(false);
                    return;
                }
                await createEditBatch(dataForm);
                setLoading(false);
            } catch (error: any) {
                setLoading(false);
                notificationCall.open({
                    message: error.message || "Something went wrong",
                    icon: <CloseCircleTwoTone twoToneColor='red' />
                });
            };
        }
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