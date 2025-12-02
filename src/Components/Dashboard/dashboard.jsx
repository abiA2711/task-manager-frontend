import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Paper,
    Chip,
    Select,
    MenuItem,
    IconButton,
    useTheme,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import pandaImg from "../../assets/panda.jpeg";
import {
    createTask,
    deleteTasks,
    getAllUser,
    getTasks,
    updateTask,
} from "../../services/api";

const Dashboard = () => {
    const theme = useTheme(); // detect dark/light mode
    const [open, setOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const [taskForm, setTaskForm] = useState({
        id: "",
        title: "",
        description: "",
        status: "Pending",
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
    });

    const [taskList, setTaskList] = useState([]);
    const [role, setRole] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedUserName, setSelectedUserName] = useState("");

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchUsers = async () => {
        if (role === "Admin") {
            const data = await getAllUser();
            setUsers(data?.data || []);
        }
    };

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good Morning 🌅";
        if (h < 17) return "Good Afternoon ☀️";
        return "Good Evening 🌙";
    };

    const handleChange = (field, value) => {
        setTaskForm((prev) => ({ ...prev, [field]: value }));
    };

    const fetchTasks = async () => {
        const roleStored = localStorage.getItem("role") || "User";
        const userId = localStorage.getItem("userId");
        setRole(roleStored);


        const data = await getTasks({ role: roleStored, userId });
        setTaskList(data || []);


    };

    const handleAddTask = async () => {
        if (!taskForm.title.trim() || !taskForm.description.trim()) return;


        try {
            let payload;
            if (role === "Admin") {
                const adminName = localStorage.getItem("name");
                payload = {
                    title: taskForm.title,
                    description: taskForm.description,
                    status: "Pending",
                    userId: selectedUserId,
                    userName: selectedUserName,
                    role,
                    adminName,
                };
            } else {
                payload = {
                    title: taskForm.title,
                    description: taskForm.description,
                    status: "Pending",
                    userId: localStorage.getItem("userId"),
                    userName: localStorage.getItem("name"),
                };
            }

            await createTask(payload);
            await fetchTasks();
            setOpen(false);
            setTaskForm({ title: "", description: "", status: "Pending" });
        } catch (error) {
            console.error("Task creation failed:", error);
        }


    };

    const handleEdit = (task) => {
        setIsEdit(true);
        setTaskForm({
            id: task._id,
            title: task.title,
            description: task.description,
            status: task.status,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
        });
        setOpen(true);
    };

    const handleUpdateTask = async () => {
        try {
            await updateTask(taskForm.id, {
                title: taskForm.title,
                description: taskForm.description,
            });
            await fetchTasks();
            setOpen(false);
        } catch (error) {
            console.log("Update failed:", error);
        }
    };

    const handleStatusChange = async (_id, newStatus) => {
        try {
            await updateTask(_id, { status: newStatus });
            setTaskList((prev) =>
                prev.map((task) => (task._id === _id ? { ...task, status: newStatus } : task))
            );
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            const roleStored = localStorage.getItem("role") || "Admin";
            await deleteTasks(taskId, roleStored);
            await fetchTasks();
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    const columns = [
        { field: "serial", headerName: "S.No", width: 80 },
        { field: "title", headerName: "Title", width: 200, flex: 1 },
        { field: "description", headerName: "Description", width: 300, flex: 2 },
        {
            field: "createdAtFormatted",
            headerName: "Created At",
            width: 180,
            renderCell: (params) => {
                const created = new Date(params.row.createdAt);
                return (
                    <div style={{ textAlign: "center" }}> <div>{created.toLocaleDateString()}</div>
                        <div style={{ fontSize: "0.85rem", color: "#555" }}>
                            {created.toLocaleTimeString()} </div> </div>
                );
            },
        },
        {
            field: "updatedAtFormatted",
            headerName: "Updated At",
            width: 180,
            renderCell: (params) => {
                const updated = params.row.createdAt !== params.row.updatedAt
                    ? new Date(params.row.updatedAt)
                    : null;
                return updated ? (
                    <div style={{ textAlign: "center" }}> <div>{updated.toLocaleDateString()}</div>
                        <div style={{ fontSize: "0.85rem", color: "#555" }}>
                            {updated.toLocaleTimeString()} </div> </div>
                ) : (
                    <div style={{ color: "#888", fontStyle: "italic", textAlign: "center" }}>
                        Not updated </div>
                );
            },
        },
        {
            field: "status",
            headerName: "Status",
            width: 140,
            renderCell: (params) =>
                params.value === "Completed" ? (
                    <Chip label="Completed" color="success" sx={{ fontWeight: 600 }} />
                ) : (
                    <Select
                        value={params.value}
                        onChange={(e) => handleStatusChange(params.row._id, e.target.value)}
                        size="small"
                        sx={{ minWidth: 120, fontWeight: 600 }}
                    > <MenuItem value="Pending">Pending</MenuItem> <MenuItem value="Completed">Completed</MenuItem> </Select>
                ),
        },
        {
            field: "assignedInfo",
            headerName: role === "Admin" ? "Assigned To" : "Assigned By",
            width: 180,
            renderCell: (params) => {
                const row = params.row;
                const loggedUserId = localStorage.getItem("userId");
                const assignedToId = row.userId;
                const assignedToName = row.userName;
                const assignedBy = row.assignedBy;


                if (role === "Admin") {
                    if (assignedToId === loggedUserId) {
                        return <Chip label="Self" color="info" variant="outlined" sx={{ fontWeight: 600 }} />;
                    } else if (!assignedBy) {
                        return <Chip label={`${assignedToName}[self assigned]`} color="primary" sx={{ fontWeight: 600 }} />;
                    }
                    return <Chip label={assignedToName} color="primary" sx={{ fontWeight: 600 }} />;
                }

                if (!assignedBy) {
                    return <Chip label="Self" color="info" variant="outlined" sx={{ fontWeight: 600 }} />;
                }
                return <Chip label={assignedBy} color="secondary" sx={{ fontWeight: 600 }} />;
            },
        },
        {
            field: "action",
            headerName: "Action",
            width: role === "Admin" ? 150 : 100,
            renderCell: (params) => (
                <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                        color="primary"
                        onClick={() => handleEdit(params.row)}
                        disabled={params.row.status === "Completed" || (params.row.assignedBy && role !== "Admin")}
                    >
                        <EditIcon />
                    </IconButton>
                    {role === "Admin" && (
                        <IconButton color="error" onClick={() => handleDeleteTask(params.row._id)}>
                            <DeleteIcon />
                        </IconButton>
                    )}
                </Box>
            ),
        },


    ];

    const rows = taskList.map((task, index) => ({
        ...task,
        id: task._id,
        serial: index + 1,
    }));

    return (
        <Box
            sx={{
               minHeight: "100vh",
                width: "100%",
                backgroundColor: theme.palette.mode === "dark" ? "#121212" : "#f5f5f5",
                pt: 10,
            }}
        >
            <Paper
                sx={{
                    p: 4,
                    mx: "auto",
                    mt: 3,
                    width: "95%",
                    maxWidth: 1200,
                    borderRadius: 4,
                    backgroundColor: theme.palette.mode === "dark" ? "#1a1a1a" : "rgba(241,225,225,0.2)",
                    backdropFilter: "blur(10px)",
                    boxShadow: 3,
                    position: "relative",
                }}
            >
                <Box
                    component="img"
                    src={pandaImg}
                    alt="panda"
                    sx={{
                        width: 120,
                        position: "absolute",
                        top: -10,
                        right: -10,
                        opacity: 0.9,
                        pointerEvents: "none",
                        transform: "rotate(-10deg)",
                    }}
                />


                <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.text.primary }}>
                    {`${getGreeting()} ${localStorage.getItem("name")}`}
                </Typography>

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, alignItems: "center" }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        Task List
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setIsEdit(false);
                            setTaskForm({
                                id: null,
                                title: "",
                                description: "",
                                status: "Pending",
                                createdAt: new Date().toLocaleString(),
                            });
                            fetchUsers();
                            setOpen(true);
                        }}
                        sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            background: "linear-gradient(45deg, #ff8c00, #ffca28)",
                            fontWeight: 600,
                        }}
                    >
                        Add Task
                    </Button>
                </Box>

                <Box sx={{ height: "auto", width: "100%" }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 5, page: 0 },
                            },
                        }}
                        pageSizeOptions={[5, 10, 15]}
                        disableSelectionOnClick
                        autoHeight
                        getRowHeight={() => "auto"}
                        components={{ Toolbar: GridToolbar }}
                        sx={{
                            fontFamily: "Roboto, sans-serif",
                            fontSize: 14,
                            "& .MuiDataGrid-columnHeaders": {
                                backgroundColor: theme.palette.mode === "dark" ? "#222" : "rgba(193,187,183,0.5)",
                                color: theme.palette.text.primary,
                                fontWeight: 700,
                                borderBottom: "1px solid #ccc",
                            },
                            "& .MuiDataGrid-cell": {
                                borderBottom: "1px solid #ccc",
                                borderRight: "1px solid #eee",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                                lineHeight: 1.5,
                                padding: "10px 8px",
                            },
                        }}
                    />
                </Box>
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 700 }}>{isEdit ? "Edit Task" : "Add New Task"}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Task Title"
                        value={taskForm.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        sx={{ mt: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={3}
                        value={taskForm.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        sx={{ mt: 2 }}
                    />
                    <TextField fullWidth label="Status" value={taskForm.status} disabled sx={{ mt: 2 }} />
                    <TextField fullWidth label="Created Date" value={taskForm.createdAt} disabled sx={{ mt: 2 }} />
                    <TextField fullWidth label="Updated Date" value={taskForm.updatedAt} disabled sx={{ mt: 2 }} />
                    {role === "Admin" && (
                        <>
                            <Typography sx={{ mt: 2, fontWeight: 600 }}>Assign Task To</Typography>
                            <Select
                                fullWidth
                                value={selectedUserId}
                                onChange={(e) => {
                                    setSelectedUserId(e.target.value);
                                    const user = users.find((u) => u.userId === e.target.value);
                                    setSelectedUserName(user?.fullName || "");
                                }}
                                sx={{ mt: 2 }}
                                displayEmpty
                            >
                                <MenuItem value="" disabled>
                                    Select User
                                </MenuItem>
                                {users.map((u) => (
                                    <MenuItem key={u.userId} value={u.userId}>
                                        {`${u.fullName} (${u.userId})`}
                                    </MenuItem>
                                ))}
                            </Select>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    {isEdit ? (
                        <Button variant="contained" onClick={handleUpdateTask} sx={{ borderRadius: 2 }}>
                            Update
                        </Button>
                    ) : (
                        <Button variant="contained" onClick={handleAddTask} sx={{ borderRadius: 2 }}>
                            Add
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>


    );
};

export default Dashboard;
