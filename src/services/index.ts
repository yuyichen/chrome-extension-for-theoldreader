import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { message } from "antd";
import api from "./api";
import { HOST } from "../constants";

axios.interceptors.response.use(async (response) => {
  // if ([200].includes(response.status)) {
  //   message.error(response.data || "请求出错");
  //   return Promise.reject(response);
  // }
  return response;
}, message.error);

const services: Partial<
  Record<
    keyof typeof api,
    (config: AxiosRequestConfig) => Promise<AxiosResponse>
  >
> = {};

for (const key in api) {
  services[key] = (config?: AxiosRequestConfig) =>
    axios.get(key, { baseURL: HOST, ...config });
}

export default services;
