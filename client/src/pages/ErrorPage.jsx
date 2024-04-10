import { useErrorBoundary } from "react-error-boundary";
import Button from "@mui/material/Button";

const ErrorPage = ({ error, resetErrorBoundary }) => {
  const { resetBoundary } = useErrorBoundary();

  return (
    <div className="flex flex-col h-screen w-full justify-center items-center gap-5">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <h2 className="text-lg text-red-600">detail: {error.message}</h2>
      <Button onClick={resetBoundary} variant="contained" color="error">
        Try again
      </Button>
    </div>
  );
};

export default ErrorPage;
