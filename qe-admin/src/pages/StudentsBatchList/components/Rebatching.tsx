import React, {useEffect, useState} from 'react';
import { Modal, Button, Spin } from 'antd';
import {
    getStudentActiveBatches, addTeacherSchedule, rebatchStudent
  } from "@/services/ant-design-pro/api";
import {
    handleAPIResponse
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
    console.log("data", data);

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
        try {
            const msg = await rebatchStudent(data.id, batchId);
            handleAPIResponse(msg, "Student Rebatched Successfully", "Failed To Rebatched Student");
          } catch (error) {
            handleAPIResponse({status: 400}, "Student Rebatched Successfully", "Failed To Rebatched Student");
          }
        setIsLoading(false);
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
                <Batch data={data} setVisible={setShow} visible={show} filterTheme={"RE_BATCHING"} currentBatch={batches[0]} filterCallBack={filterCallBack} onFinish={onFinish} />
            </Spin>
        </Modal>
        <Button onClick={() => setShow(true)} block style={{ color: "white", backgroundColor: "DodgerBlue" }}>
            Change Batch
        </Button>
    </>
  );
};

export default Rebatching;
