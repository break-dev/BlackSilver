import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (request) => {
    console.log(
      `[API] Solicitud - ${request.method} a: ${request.url}`,
      request.data,
    );
    return request;
  },
  (error) => {
    console.error("[API] Error en la solicitud", error);
    return Promise.reject(error);
  },
);

// interceptor para imprimir respuestas y errores globalmente
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Respuesta de ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    console.log("[API] Error en la respuesta:", error);
    return Promise.reject(error);
  },
);

export { api };
