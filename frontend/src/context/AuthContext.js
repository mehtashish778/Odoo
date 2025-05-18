import React, { createContext, useState, useEffect, useReducer } from 'react';
import api from '../services/api'; // Import the api service

export const AuthContext = createContext();

// Reducer function to manage auth state
const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload
      };
    case 'SIGNUP_SUCCESS':
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        ...action.payload, // token and user
        isAuthenticated: true,
        loading: false
      };
    case 'AUTH_ERROR':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on initial component mount if token exists
  useEffect(() => {
    const tryLoadUser = async () => {
      if (state.token) {
        try {
          // The api.get function needs to be adapted or a new one created if it expects a token directly
          // For now, let's assume the token is set in axios defaults or passed appropriately
          const user = await api.get('/api/auth/user', state.token); // Pass token to API call
          dispatch({ type: 'USER_LOADED', payload: user });
        } catch (err) {
          console.error('Load user error:', err);
          dispatch({ type: 'AUTH_ERROR' });
        }
      } else {
        dispatch({ type: 'AUTH_ERROR' }); // No token, so not authenticated
      }
    };
    tryLoadUser();
  }, [state.token]); // Reload if token changes, though usually it's set once on login

  // Signup User
  const signup = async (formData) => {
    try {
      const res = await api.post('/api/auth/signup', formData);
      dispatch({ type: 'SIGNUP_SUCCESS', payload: res }); // res should contain { token, user }
      // loadUser(); // Optionally load user again or trust the response
    } catch (err) {
      console.error('Signup error:', err);
      dispatch({ type: 'AUTH_ERROR' });
      throw err; // Re-throw to be handled in the component
    }
  };

  // Login User
  const login = async (formData) => {
    try {
      const res = await api.post('/api/auth/login', formData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: res }); // res should include { token, user }
      // loadUser(); // Optionally load user again or trust the response
    } catch (err) {
      console.error('Login error:', err);
      dispatch({ type: 'AUTH_ERROR' });
      throw err; // Re-throw to be handled in the component
    }
  };

  // Logout User
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{
      token: state.token,
      isAuthenticated: state.isAuthenticated,
      loading: state.loading,
      user: state.user,
      signup,
      login,
      logout
      // loadUser is internal to the context usually, triggered by token presence
    }}>
      {!state.loading && children} 
    </AuthContext.Provider>
  );
}; 