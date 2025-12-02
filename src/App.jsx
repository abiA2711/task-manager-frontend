import { Box, createTheme, ThemeProvider } from "@mui/material";
import { useState } from "react";
import AppRouter from "./router/appRouter";

function App() {
  const [themeMode, setThemeMode] = useState(
    localStorage.getItem("theme") || "light"
  );

  const theme = createTheme({
    palette: {
      mode: themeMode,
    },
  });

  return (
    <Box
sx={{
width: "100vw",
minHeight: "100vh",
overflowX: "hidden",
margin: 0,
padding: 0,
backgroundColor: "background.default",
}}
>
    <ThemeProvider theme={theme}>
      <AppRouter setThemeMode={setThemeMode} />
    </ThemeProvider>
    </Box>
  );
}

export default App;
  