import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    // Optional: Show a loading spinner or a blank page while auth state is being determined
    return <div>Loading...</div>; // Or return null; or a spinner component
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
  // Using <Outlet /> allows nested routes to be rendered if this PrivateRoute is used as a layout route.
  // If you are passing a specific component like <Route path="/dashboard" element={<PrivateRoute component={Dashboard} />} />
  // then you would do: 
  // const { component: Component, ...rest } = props; 
  // return isAuthenticated ? <Component {...rest} /> : <Navigate to="/login" replace />;
  // But with React Router v6, using Outlet is more idiomatic for wrapping child routes.
};

export default PrivateRoute; 