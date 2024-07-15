import { launchImageLibrary } from 'react-native-image-picker';
import { AxiosResponse } from "axios";
import { FileResponse, DownloadFileResponse, FileRequest } from "../interfaces";
import { urls } from '../axios/config';
import { axiosGet, axiosPost } from '../axios/axios.method';
import { Alert } from 'react-native';
import RNFS from 'react-native-fs';
import { getMMKVString, setMMKVString } from './mmkvStorage';
import ImageResizer from 'react-native-image-resizer';
import { shadow } from 'react-native-paper';
import { showModal } from '../context/ModalService';

export interface FileImage {
  uri: string;
  fileName: string;
  fileSize: number;
  type: string;
}

export const handleImagePicker = (): Promise<FileImage|null> => {
  return new Promise((resolve, reject) => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        console.log('이미지 선택 취소');
        resolve(null);
      } else if (response.errorMessage) {
        console.log('ImagePicker error: ', response.errorMessage);
        reject(new Error(response.errorMessage));
      } else {
        const asset = response.assets && response.assets[0];
        if (asset) {
          const image: FileImage = {
            uri: asset.uri,
            fileName: asset.fileName,
            fileSize: asset.fileSize,
            type: asset.type,
          };
          resolve(image);
        } else {
          resolve(null);
        }
      }
    });
  });
};

export const uploadImage = async (image:FileImage, fileType:'IMAGE' |'PROFILEIMAGE'):Promise<{uri:string, fileId:number}> => {
  if (!image) return;
  const { uri, fileName, fileSize, type: contentType } = image;

  try {
    const metadataResponse = await axiosPost<AxiosResponse<FileResponse>>(`${urls.FILE_UPLOAD_URL}`, "파일 업로드", {
      fileName,
      fileSize,
      contentType,
      fileType
    } as FileRequest);
    const {presignedUrl: uploadPresignedUrl, fileId} = metadataResponse?.data?.data;
  
    const resizedImage = await ImageResizer.createResizedImage(
      uri,
      fileType === 'IMAGE' ? 1500 : 500, 
      fileType === 'IMAGE' ? 1500 : 500, 
      'JPEG', 
      80, 
      0, 
      null,
      true,
      { onlyScaleDown: true }
    );
    
    // s3에 업로드
    const file = await fetch(resizedImage.uri);
    const blob = await file.blob();
    await fetch(uploadPresignedUrl, {
      headers: {'Content-Type': contentType},
      method: 'PUT',
      body: blob
    })
    setMMKVString(`image.${fileId}`, resizedImage.uri);
    return {uri: resizedImage.uri, fileId};
  } catch (error) {
    console.error(error);
    return null;
  }
};

const downloadImage = async (url:string, imageId: number) => {
  try {
    const timestamp = new Date().getTime();
    const localFilePath = `${RNFS.CachesDirectoryPath}/cache/${timestamp}.jpg`; 
    const downloadResult = await RNFS.downloadFile({
      fromUrl: url, 
      toFile: localFilePath, // 로컬다운경로 
    }).promise;

    if (downloadResult.statusCode === 200) {   
      const savePath = localFilePath;
      setMMKVString(`image.${imageId}`, savePath);
      return savePath;
    } else {
      console.log('이미지 다운로드 중 실패했습니다.', downloadResult);
      showModal('다운로드 실패', '이미지 다운로드에 실패했습니다.',()=>{},undefined,false)
    }
  } catch (error) {
    console.log('이미지 다운로드 중 오류가 발생했습니다.');
    showModal('다운로드 실패', '이미지 다운로드에 실패했습니다.',()=>{},undefined,false)
  }
};

export const getImageUri = async (imageId: number) => {
  if (!imageId)
    return null;

  const profileImageUri = getMMKVString(`image.${imageId}`);
  if (profileImageUri)
    return profileImageUri;
  
  try {
    const downloadResponse = await axiosGet<AxiosResponse<DownloadFileResponse>>(
          `${urls.FILE_DOWNLOAD_URL}${imageId}`, "이미지 다운로드 url");
    const { presignedUrl } = downloadResponse.data.data;
    // const imgUri = await downloadImage(presignedUrl, imageId);
    setMMKVString(`image.${imageId}`, presignedUrl);
    return presignedUrl
  } catch (error) {
    console.error(error);
    return null;
  }
};
