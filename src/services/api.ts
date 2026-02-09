import axios from "axios";
import { AuthStore } from "../stores/auth.store";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token de autenticacion
api.interceptors.request.use(
  (request) => {
    const token = AuthStore.getState().token;
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
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
