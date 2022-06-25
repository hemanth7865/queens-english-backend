import {
    Form,
    Spin,
    Button
} from "antd";
import { useState } from "react";
import {
    dynamicAPI
} from "@/services/ant-design-pro/api";

const Reassign = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState({});
    const handleCall = async (url: string, method: string, params: any, options: any) => {
        setIsLoading(true);
        try {
            const res = await dynamicAPI(url, method, params, options);
            setResponse(res);
        } catch (e) {
            console.log(e);
        }
        setIsLoading(false);
    }

    return (<>
        <Spin spinning={isLoading}>
            <code>
                <pre>
                    {JSON.stringify(response, null, 4)}
                </pre>
            </code>

            <div style={{ display: "flex", gap: 10, justifyContent: "center", alignItems: "center" }}>
                <Button type="primary" onClick={() => handleCall("zoom-users/generate-active-license", "post", {}, {})}>Generate Licenes For Active Teachers</Button>
                <Button type="primary" onClick={() => handleCall("zoom-meetings/active-batches-generate-meetings", "post", {}, {})}>Generate Zoom Meeting Links For Active Batches</Button>
            </div>
        </Spin>
    </>)
}
export default Reassign;