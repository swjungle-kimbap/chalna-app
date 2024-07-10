import { launchImageLibrary } from 'react-native-image-picker';
import { AxiosResponse } from "axios";
import { FileResponse, DownloadFileResponse } from "../interfaces";
import { urls } from '../axios/config';
import { axiosGet, axiosPatch } from '../axios/axios.method';
import { Alert } from 'react-native';

interface FileImage {
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

export const handleUploadS3 = async (image:FileImage):Promise<FileResponse> => {
  if (!image) return;
  const { uri, fileName, fileSize, type: contentType } = image;

  try {
    const metadataResponse = await axiosPatch<AxiosResponse<FileResponse>>(`${urls.USER_INFO_PROFILEIMG_URL}`, "프로필 업로드", {
      fileName,
      fileSize,
      contentType
    });
    const fileResponse = metadataResponse?.data?.data;
    
    // s3에 업로드
    const file = await fetch(uri);
    const blob = await file.blob();
    const uploadResponse = await fetch(fileResponse.presignedUrl, {
      headers: {'Content-Type': contentType},
      method: 'PUT',
      body: blob
    })

    if (uploadResponse.ok) {
      const downloadResponse = await axiosGet<AxiosResponse<DownloadFileResponse>>(`${urls.FILE_DOWNLOAD_URL}${fileResponse.fileId}`,"프로필 다운로드" );
      const { presignedUrl }= downloadResponse?.data?.data;
      fileResponse.presignedUrl = presignedUrl;
      return fileResponse;
    } else {
      console.log('이미지상태:', uploadResponse.status);
      Alert.alert('실패', '이미지 업로드에 실패했습니다.');
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};
