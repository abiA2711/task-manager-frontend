import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import calenderImage from "../../assets/calender.avif";
import { signUp, signIn } from "../../services/api";

export default function Register() {
  const theme = useTheme(); // ⭐ detect dark/light
  const navigate = useNavigate();

  const [isSignIn, setIsSignIn] = useState(true);
  const [profile, setProfile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    rePassword: "",
  });

  const fileInputRef = useRef(null);

  // Clear alerts
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const switchMode = (mode) => {
    setIsSignIn(mode);
    setError("");
    setSuccess("");
    setFormData({
      fullName: "",
      email: "",
      password: "",
      rePassword: "",
    });
    setProfile(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;


    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "password" || name === "rePassword") {
        setPasswordMatch(updated.password === updated.rePassword);
      }
      return updated;
    });


  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setProfile(file);

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");


    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email || !formData.password) {
      setError("Please enter Email and Password!");
      return;
    }
    if (!emailPattern.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      if (isSignIn) {
        const data = await signIn({
          email: formData.email,
          password: formData.password,
        });

        localStorage.setItem("token", data.token);
        localStorage.setItem("_id", data.user.id);
        localStorage.setItem("userId", data.user.userId);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("name", data.user.fullName);
        localStorage.setItem("email", data.user.email);
        const profileImage = data.user.profileImage
          ? `https://task-manager-backend-te9k.onrender.com${data.user.profileImage}`
          : null;

        localStorage.setItem("profileImage", profileImage);

        setSuccess(data.message);

        setTimeout(() => {
          window.dispatchEvent(new Event("user-changed"));
          navigate("/dashboard");
        }, 2000);
      } else {
        if (!formData.fullName || !formData.rePassword) {
          setError("All fields are required to create an account!");
          return;
        }
        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters.");
          return;
        }
        if (formData.password !== formData.rePassword) {
          setError("Passwords do not match!");
          return;
        }

        const dataToSend = new FormData();
        dataToSend.append("fullName", formData.fullName);
        dataToSend.append("email", formData.email);
        dataToSend.append("password", formData.password);
        dataToSend.append("role", "User");
        if (profile) dataToSend.append("profileImage", profile);

        const data = await signUp(dataToSend);
        setSuccess(data.message);

        setFormData({ fullName: "", email: "", password: "", rePassword: "" });
        setProfile(null)
        setTimeout(() => {
          setIsSignIn(true);
        }, 8000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }


  };

  return (

    <Box
  sx={{
    display: "flex",
    flexDirection: { xs: "column", md: "row" },  
    height: "auto",
    minHeight:"100vh",
    backgroundColor: theme.palette.mode === "dark" ? "#0d0d0d" : "#ffffff",
    color: theme.palette.text.primary,
    // mt: 7,
  }}
>

      {/* LEFT SIDE IMAGE */}
     <Box
  sx={{
    width: { xs: "100%", md: "50%" },
    // height: { xs: "40vh", md: "100%" },
    height: { xs: "auto", md: "100%" },
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:
      theme.palette.mode === "dark" ? "#1a1a1a" : "#f5f5f5",
    borderRight:
      theme.palette.mode === "dark"
        ? { md: "1px solid #333" }
        : { md: "1px solid #ddd" },
  }}
>

        <img
          src={calenderImage}
          alt="calendar"
          style={{
            width: "90%",
            height: "auto",
            borderRadius: "10px",
            filter: theme.palette.mode === "dark" ? "brightness(0.8)" : "none",
          }}
        /> </Box>


      {/* RIGHT SIDE FORM */}
      <Box
  sx={{
    width: { xs: "100%", md: "50%" },
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    p: { xs: 2, md: 3 },
  }}
>

        <Box
          sx={{
            width: "80%",
            p: 4,
            borderRadius: 2,
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 0 20px rgba(255,255,255,0.08)"
                : 3,
            backgroundColor:
              theme.palette.mode === "dark" ? "#111111" : "#ffffff",
            border:
              theme.palette.mode === "dark"
                ? "1px solid #333"
                : "1px solid #ddd",
            textAlign: "center",
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {isSignIn ? (
            <>
              <Typography variant="h5" mb={2}>
                Sign In
              </Typography>

              <form onSubmit={handleSubmit}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  sx={{ mb: 2, width: "70%" }}
                  value={formData.email}
                  onChange={handleChange}
                  InputLabelProps={{
                    style: {
                      color:
                        theme.palette.mode === "dark" ? "#ccc" : undefined,
                    },
                  }}
                />

                <TextField
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  sx={{ mb: 2, width: "70%" }}
                  value={formData.password}
                  onChange={handleChange}
                  InputLabelProps={{
                    style: {
                      color:
                        theme.palette.mode === "dark" ? "#ccc" : undefined,
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowPassword(!showPassword)
                          }
                        >
                          {showPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  variant="contained"
                  sx={{
                    mt: 1,
                    width: "70%",
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "#FFA726"
                        : undefined,
                    color:
                      theme.palette.mode === "dark"
                        ? "#000"
                        : "#fff",
                    fontWeight: 600,
                  }}
                  type="submit"
                >
                  Sign In
                </Button>
              </form>

              <Typography mt={2}>
                Don't have an account?{" "}
                <Link component="button" onClick={() => switchMode(false)}>
                  Create Account
                </Link>
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="h5" mb={2}>
                Create Account
              </Typography>

              {/* Profile Image */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <Box
                  onClick={() => fileInputRef.current.click()}
                  sx={{
                    width: 90,
                    height: 90,
                    borderRadius: "50%",
                    border:
                      theme.palette.mode === "dark"
                        ? "2px dashed #555"
                        : "2px dashed #aaa",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    overflow: "hidden",
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "#1a1a1a"
                        : "#fafafa",
                  }}
                >
                  {profile ? (
                    <img
                      src={URL.createObjectURL(profile)}
                      alt="preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      color={
                        theme.palette.mode === "dark"
                          ? "#888"
                          : "text.secondary"
                      }
                    >
                      Add Photo
                    </Typography>
                  )}
                </Box>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
              </Box>

              <form onSubmit={handleSubmit}>
                <TextField
                  label="Full Name"
                  name="fullName"
                  sx={{ mb: 2, width: "90%" }}
                  value={formData.fullName}
                  onChange={handleChange}
                  InputLabelProps={{
                    style: {
                      color:
                        theme.palette.mode === "dark" ? "#ccc" : undefined,
                    },
                  }}
                />

                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  sx={{ mb: 2, width: "90%" }}
                  value={formData.email}
                  onChange={handleChange}
                  InputLabelProps={{
                    style: {
                      color:
                        theme.palette.mode === "dark" ? "#ccc" : undefined,
                    },
                  }}
                />

                <TextField
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  sx={{ mb: 2, width: "90%" }}
                  value={formData.password}
                  onChange={handleChange}
                  InputLabelProps={{
                    style: {
                      color:
                        theme.palette.mode === "dark" ? "#ccc" : undefined,
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowPassword(!showPassword)
                          }
                        >
                          {showPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Re-Type Password"
                  name="rePassword"
                  type={showRePassword ? "text" : "password"}
                  sx={{ mb: 1, width: "90%" }}
                  value={formData.rePassword}
                  onChange={handleChange}
                  InputLabelProps={{
                    style: {
                      color:
                        theme.palette.mode === "dark" ? "#ccc" : undefined,
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowRePassword(!showRePassword)
                          }
                        >
                          {showRePassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {!passwordMatch && (
                  <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                    Passwords do not match!
                  </Typography>
                )}

                <Button
                  variant="contained"
                  sx={{
                    mt: 1,
                    width: "90%",
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "#FFA726"
                        : undefined,
                    color:
                      theme.palette.mode === "dark"
                        ? "#000"
                        : "#fff",
                    fontWeight: 600,
                  }}
                  type="submit"
                >
                  Create Account
                </Button>
              </form>

              <Typography mt={2}>
                Already have an account?{" "}
                <Link component="button" onClick={() => switchMode(true)}>
                  Sign In
                </Link>
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </Box>


  );
}
