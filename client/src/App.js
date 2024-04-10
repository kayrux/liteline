import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ChatPage from "./pages/ChatPage";
import ErrorPage from "./pages/ErrorPage";
import { ErrorBoundary } from "react-error-boundary";
import ProtectedRoute from "./components/authenticator/ProtectedRoute";
import Toast from "./components/toast/Toast";

const App = () => {
  const logError = (error, info) => {
    console.log(error, info);
  };

  return (
    <div className="relative min-h-screen">
      <ErrorBoundary
        FallbackComponent={ErrorPage}
        onReset={(details) => {
          // Reset the state of your app so the error doesn't happen again
        }}
        onError={logError}
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/chatroom/*"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </ErrorBoundary>

      <Toast />
    </div>
  );
};

export default App;
