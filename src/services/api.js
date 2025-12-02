import axios from "axios";

// Base URL 
const API = axios.create({
  baseURL: "https://task-manager-backend-te9k.onrender.com/api/auth", 
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// SIGN UP
export const signUp = async (dataToSend) => {
  const response = await API.post("/signup", dataToSend, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};


// SIGN IN
export const signIn = async (credentials) => {
  const res = await API.post("/signin", credentials);
  return res.data;
};


//ADDING TASK
export const createTask = async (taskData) => {
  const res = await API.post("/submit-task", taskData);
  return res.data;
}

//UPDATE TASK

export const updateTask = async (taskId, data) => {
    const res = await API.put(`/update-status/${taskId}`, data);
    return res.data;
};


//GET  TASKS
export const getTasks = async ({ role, userId }) => {
    const res = await API.get("/tasks", {
        params: { role, userId },
    });
    return res.data;
};

//DELETE TASKS
export const deleteTasks=async(taskId,role)=>{
  console.log(taskId,role)
  const res=  await API.delete(`/deleteTask/${taskId}`, { data: { role } });
  return res.data
};

export const getAllUser=async()=>{
  const res=await API.get("/users");
  return res.data
}
