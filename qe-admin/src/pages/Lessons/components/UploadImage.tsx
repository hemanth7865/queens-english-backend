import { useRef, useState } from "react";
import { notification } from "antd";
import { uploadImagesStorage } from "@/services/ant-design-pro/api";
import { getStorageFileURL } from "@/services/ant-design-pro/helpers";

const UploadImage = ({ images, setImages }: any) => {
    const input = useRef<null | HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);


    const triggerImagesUpload = () => {
        if (input) {
            input.current?.click();
        }
    };

    const uploadImages = async (e: any) => {
        if (e.target.files.length > 0) {
            notification.warning({
                message: "Uploading Your Images",
            });
            setIsLoading(true);
            try {
                const formData = new FormData();
                for (let x = 0; x < e.target.files.length; x++) {
                    formData.append("images", e.target.files[x]);
                }

                const result: any = await uploadImagesStorage(
                    { path: "lesson-scripts" },
                    {
                        body: formData,
                    }
                );

                if (!result.images) {
                    throw new Error("Failed to upload the images");
                }

                setImages(result.images);

                notification.success({
                    message: "Finished Uploading Your Images",
                });
            } catch (e: any) {
                notification.error({
                    message: "Failed to upload images",
                    description: e.message,
                });
            }
            setIsLoading(false);

            return true;
        }

        notification.warning({
            message: "No Files Are Selected",
        });
    };

    return (
        <div
            className="rdw-image-wrapper"
            onClick={triggerImagesUpload}
            id="RichEditorImagesUpload"
        >
            <div className="rdw-option-wrapper" title="Upload Images">
                <img
                    src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUiIGhlaWdodD0iMTQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iIzAwMCIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTQuNzQxIDBILjI2Qy4xMTYgMCAwIC4xMzYgMCAuMzA0djEzLjM5MmMwIC4xNjguMTE2LjMwNC4yNTkuMzA0SDE0Ljc0Yy4xNDMgMCAuMjU5LS4xMzYuMjU5LS4zMDRWLjMwNEMxNSAuMTM2IDE0Ljg4NCAwIDE0Ljc0MSAwem0tLjI1OCAxMy4zOTFILjUxN1YuNjFoMTMuOTY2VjEzLjM5eiIvPjxwYXRoIGQ9Ik00LjEzOCA2LjczOGMuNzk0IDAgMS40NC0uNzYgMS40NC0xLjY5NXMtLjY0Ni0xLjY5NS0xLjQ0LTEuNjk1Yy0uNzk0IDAtMS40NC43Ni0xLjQ0IDEuNjk1IDAgLjkzNC42NDYgMS42OTUgMS40NCAxLjY5NXptMC0yLjc4MWMuNTA5IDAgLjkyMy40ODcuOTIzIDEuMDg2IDAgLjU5OC0uNDE0IDEuMDg2LS45MjMgMS4wODYtLjUwOSAwLS45MjMtLjQ4Ny0uOTIzLTEuMDg2IDAtLjU5OS40MTQtMS4wODYuOTIzLTEuMDg2ek0xLjgxIDEyLjE3NGMuMDYgMCAuMTIyLS4wMjUuMTcxLS4wNzZMNi4yIDcuNzI4bDIuNjY0IDMuMTM0YS4yMzIuMjMyIDAgMCAwIC4zNjYgMCAuMzQzLjM0MyAwIDAgMCAwLS40M0w3Ljk4NyA4Ljk2OWwyLjM3NC0zLjA2IDIuOTEyIDMuMTQyYy4xMDYuMTEzLjI3LjEwNS4zNjYtLjAyYS4zNDMuMzQzIDAgMCAwLS4wMTYtLjQzbC0zLjEwNC0zLjM0N2EuMjQ0LjI0NCAwIDAgMC0uMTg2LS4wOC4yNDUuMjQ1IDAgMCAwLS4xOC4xTDcuNjIyIDguNTM3IDYuMzk0IDcuMDk0YS4yMzIuMjMyIDAgMCAwLS4zNTQtLjAxM2wtNC40IDQuNTZhLjM0My4zNDMgMCAwIDAtLjAyNC40My4yNDMuMjQzIDAgMCAwIC4xOTQuMTAzeiIvPjwvZz48L3N2Zz4="
                    alt="Image"
                />
                <input
                    title="Images"
                    accept="image/*"
                    type="file"
                    multiple
                    data-max_length="20"
                    ref={input}
                    onChange={uploadImages}
                />
            </div>
        </div>
    );
};

export const ImagesData = ({ images }: { images: string[] }) => {
    return (
        <p className="lessons-script-images-container" style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
        }}>
            <span className="lessons-script-images-containerr">
                {
                    images.map(image => {
                        return (
                            <img alt="Lesson Image" src={getStorageFileURL(image)} key={image} />
                        )
                    })
                }
            </span>

        </p>
    )

    return (
        <div>
            <strong>Test</strong>
            <a href="https://google.com">Google</a>
            <img
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUiIGhlaWdodD0iMTQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iIzAwMCIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTQuNzQxIDBILjI2Qy4xMTYgMCAwIC4xMzYgMCAuMzA0djEzLjM5MmMwIC4xNjguMTE2LjMwNC4yNTkuMzA0SDE0Ljc0Yy4xNDMgMCAuMjU5LS4xMzYuMjU5LS4zMDRWLjMwNEMxNSAuMTM2IDE0Ljg4NCAwIDE0Ljc0MSAwem0tLjI1OCAxMy4zOTFILjUxN1YuNjFoMTMuOTY2VjEzLjM5eiIvPjxwYXRoIGQ9Ik00LjEzOCA2LjczOGMuNzk0IDAgMS40NC0uNzYgMS40NC0xLjY5NXMtLjY0Ni0xLjY5NS0xLjQ0LTEuNjk1Yy0uNzk0IDAtMS40NC43Ni0xLjQ0IDEuNjk1IDAgLjkzNC42NDYgMS42OTUgMS40NCAxLjY5NXptMC0yLjc4MWMuNTA5IDAgLjkyMy40ODcuOTIzIDEuMDg2IDAgLjU5OC0uNDE0IDEuMDg2LS45MjMgMS4wODYtLjUwOSAwLS45MjMtLjQ4Ny0uOTIzLTEuMDg2IDAtLjU5OS40MTQtMS4wODYuOTIzLTEuMDg2ek0xLjgxIDEyLjE3NGMuMDYgMCAuMTIyLS4wMjUuMTcxLS4wNzZMNi4yIDcuNzI4bDIuNjY0IDMuMTM0YS4yMzIuMjMyIDAgMCAwIC4zNjYgMCAuMzQzLjM0MyAwIDAgMCAwLS40M0w3Ljk4NyA4Ljk2OWwyLjM3NC0zLjA2IDIuOTEyIDMuMTQyYy4xMDYuMTEzLjI3LjEwNS4zNjYtLjAyYS4zNDMuMzQzIDAgMCAwLS4wMTYtLjQzbC0zLjEwNC0zLjM0N2EuMjQ0LjI0NCAwIDAgMC0uMTg2LS4wOC4yNDUuMjQ1IDAgMCAwLS4xOC4xTDcuNjIyIDguNTM3IDYuMzk0IDcuMDk0YS4yMzIuMjMyIDAgMCAwLS4zNTQtLjAxM2wtNC40IDQuNTZhLjM0My4zNDMgMCAwIDAtLjAyNC40My4yNDMuMjQzIDAgMCAwIC4xOTQuMTAzeiIvPjwvZz48L3N2Zz4="
                alt="Image"
            />
        </div>
    )

    return (
        <>
            <img src="https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8aHVtYW58ZW58MHx8MHx8&w=1000&q=80" alt="dsa" />
        </>
    )
}

export default UploadImage;
