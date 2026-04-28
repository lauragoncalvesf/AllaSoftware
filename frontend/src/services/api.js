import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:3000"
})

// Interceptor → adiciona token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")

  if (token) {
    // Adicionar "Bearer" no início se não estiver
    config.headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`
  }

  return config
})

export default api