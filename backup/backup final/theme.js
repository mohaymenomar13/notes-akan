import { createTheme } from "@mui/material";

export default function theme() {
    const theme = createTheme({
        palette: {
          primary: {
            light: '#ff7961',
            main: '#98A77C',
            dark: '#b6c99b',
            contrastText: '#E7F5DC',
          },
          secondary: {
            light: '#728156',
            main: '#98A77C',
            dark: '#728156',
            contrastText: '#728156',
          },
        },
    });
    return theme;
}