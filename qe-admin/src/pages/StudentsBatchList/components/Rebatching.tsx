import React, {useEffect, useState} from 'react';
import { Modal, Button, Spin } from 'antd';
import {
    getStudentActiveBatches, addTeacherSchedule, rebatchStudent
  } from "@/services/ant-design-pro/api";
import {
    handleAPIResponse, getLessonByID
} from "@/services/ant-design-pro/helpers";

import Batch from "./../../BatchingStudent/components/Batch";

export type Props = {
  show: boolean;
  setShow: (show: boolean) => any;
  data: any
};

const Rebatching: React.FC<Props> = ({show, setShow, data}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [batches, setBatches] = useState<any[]>([]);

    let startLesson = data.startLesson;
    let lesson = getLessonByID(batches[0]?.activeLessonId)?.number;
    if (lesson) {
      startLesson = `Lesson ${lesson}`;
    }

    const getStudentBatches = async () => {
        setIsLoading(true);
        try{
            let res = await getStudentActiveBatches(data.id);
            setBatches(res.data);
        }catch(e){
            console.log(e);
        }
        setIsLoading(false);
    }

    const filterCallBack = async (data: any) => {
        setIsLoading(true);
        try {
            const msg = await addTeacherSchedule({
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            });
            handleAPIResponse(msg, "Student Updated Successfully", "Failed To Update Student", false);
          } catch (error) {
            handleAPIResponse({status: 400}, "Student Updated Successfully", "Failed To Update Student", false);
          }
        setIsLoading(false);
    }

    const onFinish = async (batchId: string) => {
        setIsLoading(true);
        let success = true;
        try {
            const msg = await rebatchStudent(data.id, batchId);
            if(msg.status === false && msg.message){
              msg.status = 400;
              success = false;
            }
            handleAPIResponse(msg, "Student Rebatched Successfully", msg.message || "Failed To Rebatched Student", false);
          } catch (error) {
            success = false;
            handleAPIResponse({status: 400}, "Student Rebatched Successfully", "Failed To Rebatched Student", false);
          }
        setIsLoading(false);
        return success;
      }

    useEffect(() => {
        getStudentBatches();
    }, [data.id]);
  return (
    <>
        <Modal
            width={960}
            title={"Re-batching"}
            visible={show}
            footer={null}
            onCancel={() => {
                setShow(false)
            }}
        >
            <Spin spinning={isLoading}>
                <Batch data={{...data, startLesson}} setVisible={setShow} visible={show} filterTheme={"RE_BATCHING"} currentBatch={batches[0]} filterCallBack={filterCallBack} onFinish={onFinish} />
            </Spin>
        </Modal>
        <Button onClick={() => setShow(true)} block style={{ color: "white", backgroundColor: "DodgerBlue" }}>
            Change Batch
        </Button>
    </>
  );
};

export default Rebatching;
