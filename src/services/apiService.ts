"use client"

import axios from "axios";
/* import { handleError } from './../error/errorFunctions'; */
import { getToken, deleteToken, getFingerprint } from "./localStorageService";
//local base Url
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// production baseUrl
// const baseUrl = `https://kcg-sales-project.vercel.app/api/v1`

function setHeaders(extraHeaders: any) {
  let token = getToken();
  let fingerprint = getFingerprint();

  let headerData = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token && { "authorization": `Bearer ${token}` }),
    ...(fingerprint && { "SHARED-DID": fingerprint }),
  };
  if (extraHeaders) {
    headerData = { ...headerData, ...extraHeaders };
  }
  return headerData;
}

function setBody(method: any, data: any) {
  if (method === "get" || method === "delete") {
    return { params: data };
  } else {
    return { data: data };
  }
}
function setUrl(url: string) {
  return `${baseUrl}${url}`;
}

function callApi(paramsObject: any) {
  let { url, data, method, extraHeaders, failureCallback } = paramsObject;
  let headers = setHeaders(extraHeaders);
  let body = setBody(method, data);
  let apiUrl = setUrl(url);
  return new Promise((resolve, reject) => {
    axios({ url: apiUrl, ...body, headers: headers, method: method })
      .then((data: any) => {
        resolve({ statusCode: data.status, ...data.data });
      })
      .catch((error: any) => {
        //console.log(error);
        if (error.response) {
          console.log(error.response.status.toString())
          if (error.response.status.toString() === "403" ||  error.response.status.toString() === "401") {
            console.log("forbidden or unauthorized")
            localStorage.removeItem("token");
            localStorage.removeItem("accountType");
            window.location.replace("/login");
          }
          reject({ statusCode: error.response.status, ...error.response.data });
        } else {
          if (navigator.onLine) {
            reject({
              statusCode: 500,
              message: "oops !!! Something went Wrong.",
            });
          } else {
            reject({
              statusCode: 500,
              message: "Something Went Wrong, Check Your internet Connection.",
            });
          }
        }
      });
  });
}
export const apiGet = (paramsObject: any) => {
  let { url, data, failureCallback, extraHeaders } = paramsObject;
  return callApi({ url, data, method: "get", extraHeaders, failureCallback });
};
export const apiPost = (paramsObject: any) => {
  let { url, data, failureCallback, extraHeaders } = paramsObject;
  return callApi({ url, data, method: "post", extraHeaders, failureCallback });
};
export const apiPatch = (paramsObject: any) => {
  let { url, data, failureCallback, extraHeaders } = paramsObject;
  return callApi({ url, data, method: "patch", extraHeaders, failureCallback });
};
export const apiPut = (paramsObject: any) => {
  let { url, data, failureCallback, extraHeaders } = paramsObject;
  return callApi({ url, data, method: "put", extraHeaders, failureCallback });
};
export const apiDelete = (paramsObject: any) => {
  let { url, data, failureCallback, extraHeaders } = paramsObject;
  return callApi({
    url,
    data,
    method: "delete",
    extraHeaders,
    failureCallback,
  });
};
