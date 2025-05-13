import api from "./axiosInstance";

export interface Category {
    _id: string;
    name: string;
  }

export const listCategories = () => api.get<Category[]>('/categories');