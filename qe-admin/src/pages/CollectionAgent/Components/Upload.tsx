import { Button, Spin } from "antd";
import { dynamicAPI } from '@/services/ant-design-pro/api';
import { useState } from "react";

const Upload = ({ isLoading, setIsLoading }: { isLoading: boolean, setIsLoading: (isLoading: boolean) => any }) => {
    const [response, setResponse] = useState({});
    const [success, setSuccess] = useState("");

    const handleUpload = async (e: any) => {
        setSuccess("Assigning Collection Experts In Progress...")
        // e.preventDefault();
        // setIsLoading(true)
        // try {
        //     const file: any = document.getElementById("file");
        //     const formData = new FormData();
        //     formData.append("students", file.files[0]);
        //     console.log(formData, file.files[0]);
        //     const res = await dynamicAPI("leads/csv/CE", "post", {}, {
        //         data: formData,
        //         headers: {
        //             'Content-Type': 'multipart/form-data'
        //         }
        //     });
        //     setResponse(res)
        // } catch (e: any) {
        //     setResponse({ error: e?.message })
        // }
        // setIsLoading(false)
    }

    return (<>
        <Spin spinning={isLoading}>
            {/* <code>
                <pre>
                    {JSON.stringify(response, null, 4)}
                </pre>
            </code> */}

            <code>
                File must be CSV and in this format:
                <pre>
                    installment_id,collection_agent_name <br />
                    INSTALLMENT_ID,COLLECTION_AGENT_NAME
                </pre>
                Or in this format
                <pre>
                    student_id,collection_agent_name,due_date <br />
                    STUDENT_ID,COLLECTION_AGENT_NAME,2022-06
                </pre>
            </code>

            {success && <div className="alert alert-success">{success}</div>}

            <form id="uploadForm" action="/be/csv/collection-agents/bulk-assignment" target="_blank" method="post" encType="multipart/form-data" onSubmit={handleUpload}>
                <input type="file" name="agents" required id="file" />
                <button className="ant-btn ant-btn-primary">
                    Upload File
                </button>
            </form>
        </Spin>
    </>)

}

export default Upload;