import { RouterProvider } from "react-router";
import { Router } from "./Router";
import { ThemeProvider } from "./components/theme-provider";

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={Router}/>
    </ThemeProvider>
  )
}