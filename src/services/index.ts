import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { message, Modal } from "antd";
import api from "./api";
import { HOST } from "../constants";

axios.interceptors.response.use(async (response) => {
  return response;
}, error => {
  if ([401].includes(error?.response?.status)) {
    Modal.error({
      title: "登录已失效",
      content: "请先登录",
      onOk: () => {
        chrome.tabs.create({ url: "https://theoldreader.com/users/sign_in" });
      }
    });
  }
});

const services: Partial<
  Record<
    keyof typeof api,
    (config?: AxiosRequestConfig) => Promise<AxiosResponse>
  >
> = {};

for (const key in api) {
  services[key] = (config?: AxiosRequestConfig) =>
    axios.request({ url: api[key], baseURL: HOST, method: "get", ...(config || {}) });
}

export default services;
