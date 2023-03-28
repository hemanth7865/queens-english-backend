import { useState, useRef } from 'react';
import { DeleteOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons';
import { Modal, notification, Spin } from 'antd';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import { uploadImagesStorage } from '@/services/ant-design-pro/api';
import { getImageURL } from '@/services/ant-design-pro/helpers';


export type ImageUploaderProps = {
    imageURI?: string;
    exerciseNumber: number;
    addImage: (index: number, url: string) => void;
    removeImage: (index: number) => void;
};


const ImageUploader = (props: ImageUploaderProps) => {
    const uploadRef = useRef<any>();
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCancel = () => setPreviewOpen(false);

    const getBase64 = (file: RcFile): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                resolve(reader.result as string);
            }
            reader.onerror = (error) => reject(error);
        });

    const onPreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    };

    const uploadImages = async (e: any) => {
        if (e.target.files.length > 0) {
            notification.warning({
                message: "Uploading Your Images",
            });
            setLoading(true);
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

                props.addImage(props.exerciseNumber, result.images[0])

                notification.success({
                    message: "Finished Uploading Your Images",
                });
            } catch (e: any) {
                notification.error({
                    message: "Failed to upload images",
                    description: e.message,
                });
            }
            setLoading(false);

            return true;
        }
    }

    const removeImage = async () => {
        setLoading(true);
        await props.removeImage(props.exerciseNumber);
        setLoading(false);
    };

    return (
        <>
            <Spin spinning={loading}>
                <div className='ant-upload'>
                    {
                        props?.imageURI && props?.imageURI?.trim()?.length > 0 ?
                            <div className='image'>
                                <img
                                    src={getImageURL(props.imageURI)}
                                    alt="exercise-image"
                                    className="image_image"
                                />
                                <div className="image_overlay">
                                    <EyeOutlined
                                        onClick={() => onPreview({
                                            url: getImageURL(props.imageURI),
                                            uid: '-1',
                                            name: `Exercise ${props.exerciseNumber + 1}`,
                                        })}
                                        className="overlay-props"
                                        title="View Image"
                                    />
                                    <DeleteOutlined onClick={removeImage} className="overlay-props" title="Remove Image" />
                                </div>
                            </div>
                            :
                            <div className='image'>
                                <label className="custom-file-upload" title='Upload New Image'>
                                    <input type="file" name="uploadImage" accept="image/png" onChange={uploadImages} style={{ marginTop: "25px", marginLeft: "110px" }} ref={uploadRef} />
                                    <UploadOutlined style={{ fontSize: 25 }} />
                                    Click to Upload
                                </label>
                            </div>
                    }
                </div>
                <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
            </Spin>
        </>
    );
};

export default ImageUploader;