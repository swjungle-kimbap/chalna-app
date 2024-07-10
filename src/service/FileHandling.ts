import { launchImageLibrary } from 'react-native-image-picker';
import { AxiosResponse } from "axios";
import { FileResponse, DownloadFileResponse } from "../interfaces";
import { urls } from '../axios/config';
import { axiosGet, axiosPatch } from '../axios/axios.method';
import { Alert } from 'react-native';

export const handleImagePicker = async () => {
  launchImageLibrary({ mediaType: 'photo' }, (response) => {
    if (response.didCancel) {
      console.log('이미지 선택 취소');
    } else if (response.errorMessage) {
      console.log('ImagePicker error: ', response.errorMessage);
    } else {
      const image = response.assets[0];
      return image;
    }
    return null;
  });
  return null;
};

export const handleUploadS3 = async (image) => {
  if (!image) return;
  const { uri, fileName, fileSize, type: contentType } = image;

  try {
    const metadataResponse = await axiosPatch<AxiosResponse<FileResponse>>(`${urls.USER_INFO_PROFILEIMG_URL}`, "프로필 업로드", {
      fileName,
      fileSize,
      contentType
    });
    const { fileId, presignedUrl } = metadataResponse?.data?.data;

    // s3에 업로드
    const file = await fetch(uri);
    const blob = await file.blob();
    const uploadResponse = await fetch(presignedUrl, {
      headers: {'Content-Type': contentType},
      method: 'PUT',
      body: blob
    })

    if (uploadResponse.ok) {
      return metadataResponse?.data?.data;
    } else {
      console.log('이미지상태:',uploadResponse.status);
      Alert.alert('실패', '이미지 업로드에 실패했습니다.');
    }
  } catch (error) {
    console.error(error);
  }
};
