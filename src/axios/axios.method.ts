import { AxiosRequestConfig, AxiosResponse } from "axios"
import instance from "./axios.instance";

// check error handling

export const axiosGet = async<T>(
  url:string | undefined, 
  errorMsg: string,
  config?:AxiosRequestConfig,
): Promise<AxiosResponse<T>> => {
  if (!url)
    throw new Error('URL is undefined')
  
  try {
    const response = await instance.get<T>(url, config);
    return response;
  } catch (error) {
    console.error('Get fail:', errorMsg, error)
    throw error;
  }
}

export const axiosPost = async<T>(
  url:string | undefined , 
  errorMsg: string,
  data?:any,
  config?:AxiosRequestConfig,
): Promise<AxiosResponse<T>> => {
  if (!url)
    throw new Error('URL is undefined')

  try {
    const response = await instance.post<T>(url, data, config);
    console.log(response);
    return response;
  } catch (error) {
    console.error('Post fail:', errorMsg, error)
    throw error;
  }
}

export const axiosPatch = async<T>(
  url:string | undefined, 
  errorMsg: string,
  data?:any,
  config?:AxiosRequestConfig,
): Promise<AxiosResponse<T>> => {
  if (!url)
    throw new Error('URL is undefined')
  
  try {
    const response = await instance.patch<T>(url, data, config);
    return response;
  } catch (error) {
    console.error('Patch fail:', errorMsg, error)
    throw error;
  }
}

export const axiosDelete = async<T>(
  url:string | undefined, 
  errorMsg: string,
  config?:AxiosRequestConfig,
): Promise<AxiosResponse<T>> => {
  if (!url)
    throw new Error('URL is undefined')

  try {
    const response = await instance.delete<T>(url, config);
    return response;
  } catch (error) {
    console.error('Delete fail:', errorMsg, error)
    throw error;
  }
}