// fileService.ts
import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import { axiosPost, axiosGet, axiosDelete } from '../../axios/axios.method';
import {urls} from "../../axios/config";
// import {AxiosResponse} from "../../interfaces";

export const uploadFile = async (chatRoomId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('contentType', file.type);
    formData.append('fileSize', file.size.toString());

    const config: AxiosRequestConfig = {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    };

    const response:AxiosResponse<any> = await axiosPost(
        urls.FILE_UPLOAD_URL+`${chatRoomId}`,
            'UploadingFile',
            formData,
            config
    );

    return response.data;
};


export const downloadFile = async (fileId: string) => {
    const response = await axiosGet(urls.FILE_DOWNLOAD_URL+`${fileId}`);
    return response.data;
};

export const deleteFile = async (fileId: string) => {
    const response = await axiosDelete(urls.FILE_REMOVE_URL+`${fileId}`);
    return response.data;
};
