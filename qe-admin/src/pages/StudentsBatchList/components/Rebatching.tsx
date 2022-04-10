import React, {useEffect, useState} from 'react';
import { Modal, Button, Spin } from 'antd';
import {
    getStudentActiveBatches
  } from "@/services/ant-design-pro/api";

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

    useEffect(() => {
        getStudentBatches();
    }, [data.id]);
  return (
      <Spin spinning={isLoading}>
        <Modal
            width={960}
            title={"Re-batching"}
            visible={show}
            footer={null}
            onCancel={() => {
                setShow(false)
            }}
        >
            <Batch data={data} setVisible={setShow} visible={show} />
        </Modal>

        <Button onClick={() => setShow(true)} block style={{ color: "white", backgroundColor: "DodgerBlue" }}>
            Change Batch
        </Button>
      </Spin>
  );
};

export default Rebatching;
