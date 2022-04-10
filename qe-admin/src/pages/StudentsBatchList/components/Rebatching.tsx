import React, {useEffect, useState} from 'react';
import { Modal, Button, Spin } from 'antd';
import {
    getStudentActiveBatches
  } from "@/services/ant-design-pro/api";

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
            console.log(res, "res");
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
            width={640}
            bodyStyle={{ padding: '32px 40px 48px' }}
            title={"Re-batching"}
            visible={show}
            onCancel={() => {
                setShow(false)
            }}
        >
            Hello World
        </Modal>

        <Button onClick={() => setShow(true)} block style={{ color: "white", backgroundColor: "DodgerBlue" }}>
            Change Batch
        </Button>
      </Spin>
  );
};

export default Rebatching;
