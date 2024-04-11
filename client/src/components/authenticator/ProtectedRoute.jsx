import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.user);

  if (!userInfo) {
    // user is not authenticated
    return <Navigate to="/" replace={true} />;
  }
  return children;
};

export default ProtectedRoute;
