import { BrowserRouter, Routes, Route } from "react-router";
import { ShellNavigation } from "./components/ShellNavigation";
import { WelcomeScreen } from "./features/welcome/WelcomeScreen";
import { PlaceholderPanel } from "./features/placeholder/PlaceholderPanel";
import { NotFoundScreen } from "./features/not-found/NotFoundScreen";
import styles from "./app.module.css";

export function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <div className={styles.shell}>
        <ShellNavigation />
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            <Route
              path="/today"
              element={
                <PlaceholderPanel heading="Daily Overview" />
              }
            />
            <Route
              path="/train"
              element={
                <PlaceholderPanel heading="Workouts" />
              }
            />
            <Route
              path="/fuel"
              element={
                <PlaceholderPanel heading="Nutrition" />
              }
            />
            <Route
              path="/coach"
              element={
                <PlaceholderPanel heading="AI Coach" />
              }
            />
            <Route
              path="/grow"
              element={
                <PlaceholderPanel heading="Seasons & Quests" />
              }
            />
            <Route path="*" element={<NotFoundScreen />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}