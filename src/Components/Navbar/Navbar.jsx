import { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import { LightMode, DarkMode } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

export default function Navbar({ setThemeMode }) {
  const navigate = useNavigate();
  const theme = useTheme(); // ⭐ READ CURRENT THEME (light / dark)

  // ==========================
  // Load user from localStorage
  // ==========================
  const getUserFromLocalStorage = () => {
    const name = localStorage.getItem("name")?.trim();
    let profileImage = localStorage.getItem("profileImage")?.trim();

    if (!name) return null;
    if (!profileImage || profileImage === "null" || profileImage === "undefined")
      profileImage = null;

    if (profileImage && !profileImage.startsWith("http")) {
      profileImage = `https://task-manager-backend-te9k.onrender.com/${profileImage}`;
    }

    return { name, profileImage };
  };

  const [user, setUser] = useState(getUserFromLocalStorage());
  const [anchorEl, setAnchorEl] = useState(null);
  const [avatarError, setAvatarError] = useState(false);

  // ==========================
  // THEME MODE HANDLER
  // ==========================
  const getInitialTheme = () => localStorage.getItem("theme") || "light";

  const [themeMode, setLocalTheme] = useState(getInitialTheme());

  const toggleTheme = () => {
    const newTheme = themeMode === "light" ? "dark" : "light";
    setLocalTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    setThemeMode(newTheme); // send to ThemeProvider
  };

  useEffect(() => {
    setThemeMode(themeMode);
  }, []);

  // ==========================
  // User state listeners
  // ==========================
  const updateUser = () => {
    setAvatarError(false);
    setUser(getUserFromLocalStorage());
  };

  useEffect(() => {
    window.addEventListener("user-changed", updateUser);
    return () => window.removeEventListener("user-changed", updateUser);
  }, []);

  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem("name");
    localStorage.removeItem("profileImage");
    setUser(null);
    window.dispatchEvent(new Event("user-changed"));
    setAnchorEl(null);
    navigate("/");
  };

  const getFirstLetter = (name) => (name ? name.charAt(0).toUpperCase() : "");

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor:
          theme.palette.mode === "dark" ? "#111111" : "#1976d2", // ⭐ DARK / LIGHT support
        color: theme.palette.mode === "dark" ? "#ffffff" : "#ffffff",
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 0 10px rgba(255,255,255,0.1)"
            : undefined,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo / Title */}
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            color: theme.palette.mode === "dark" ? "#FFA726" : "#ffffff", // orange in dark mode
          }}
        >
          Task Manager
        </Typography>

        {/* THEME TOGGLE BUTTON */}
        <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 2 }}>
          {theme.palette.mode === "light" ? (
            <DarkMode />
          ) : (
            <LightMode sx={{ color: "#FFA726" }} />
          )}
        </IconButton>

        {/* USER AVATAR */}
        {user && (
          <>
            <Avatar
              src={!avatarError ? user.profileImage : undefined}
              alt={user.name}
              onClick={handleAvatarClick}
              onError={() => setAvatarError(true)}
              sx={{
                width: 40,
                height: 40,
                cursor: "pointer",
                bgcolor:
                  !user.profileImage || avatarError
                    ? theme.palette.mode === "dark"
                      ? "#333"
                      : "#f5f5f5"
                    : "transparent",
                color: theme.palette.mode === "dark" ? "#FFA726" : "#1976d2",
                fontWeight: 700,
              }}
            >
              {(!user.profileImage || avatarError) && getFirstLetter(user.name)}
            </Avatar>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
