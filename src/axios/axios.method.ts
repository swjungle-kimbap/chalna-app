import { AxiosRequestConfig, AxiosResponse } from "axios"
import instance from "./axios.instance";

// check error handling

export const axiosGet = async<T>(
  url:string | undefined,
  logMsg?: string,
  config?:AxiosRequestConfig,
): Promise<AxiosResponse<T>> => {
  if (!url)
    throw new Error('URL is undefined');

  try {
    const response = await instance.get<T>(url, config);
    if (logMsg)
      console.log('Get Success:', logMsg);
    return response;
  } catch (error) {
    console.error('Get fail:', logMsg, error);
    throw error;
  }
}

export const axiosPost = async<T>(
  url:string | undefined ,
  logMsg?: string,
  data?:any,
  config?:AxiosRequestConfig,
): Promise<AxiosResponse<T>> => {
  if (!url)
    throw new Error('URL is undefined')

  try {
    const response = await instance.post<T>(url, data, config);
    if (logMsg)
      console.log('Post Success:', logMsg);
    return response;
  } catch (error) {
    console.error('Post fail:', logMsg, error)
    throw error;
  }
}

export const axiosPatch = async<T>(
  url:string | undefined,
  logMsg?: string,
  data?:any,
  config?:AxiosRequestConfig,
): Promise<AxiosResponse<T>> => {
  if (!url)
    throw new Error('URL is undefined');

  try {
    const response = await instance.patch<T>(url, data, config);
    if (logMsg)
      console.log('Patch Success:', logMsg);
    return response;
  } catch (error) {
    console.error('Patch fail:', logMsg, error);
    throw error;
  }
}

export const axiosPut = async<T>(
  url:string | undefined,
  logMsg?: string,
  data?:any,
  config?:AxiosRequestConfig,
): Promise<AxiosResponse<T>> => {
  if (!url)
    throw new Error('URL is undefined');

  try {
    const response = await instance.put<T>(url, data, config);
    if (logMsg)
      console.log('Put Success:', logMsg);
    return response;
  } catch (error) {
    console.error('Put fail:', logMsg, error);
    throw error;
  }
}


export const axiosDelete = async<T>(
  url:string | undefined,
  logMsg?: string,
  config?:AxiosRequestConfig,
): Promise<AxiosResponse<T>> => {
  if (!url)
    throw new Error('URL is undefined');

  try {
    const response = await instance.delete<T>(url, config);
    if (logMsg)
      console.log('Delete Success:', logMsg);
    return response;
  } catch (error) {
    console.error('Delete fail:', logMsg, error);
    throw error;
  }
}
