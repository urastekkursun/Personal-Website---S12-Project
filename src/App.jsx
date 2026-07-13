import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ToastContainer } from "react-toastify";
import Hero from "./components/Hero";
import Skills from "./components/Skills";
import Profile from "./components/Profile";
import Projects from "./components/Projects";
import Footer from "./components/Footer";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <main className="page">
          <Hero />
          <Skills />
          <Profile />
          <Projects />
          <Footer />
        </main>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
