import {
    MESSAGE_ERROR,
    CLEAR_MESSAGE,
    GET_MESSAGES
  } from '../actions/types';
  
  const initialState = {
    message: null,
    messages: [],
    loading: true,
    error: {}
  };
  
  function messageReducer(state = initialState, action) {
    const { type, payload } = action;
  
    switch (type) {
      case GET_MESSAGES:
        return {
          ...state,
          messages: payload,
          loading: false
        };
      case MESSAGE_ERROR:
        return {
          ...state,
          error: payload,
          loading: false,
          message: null
        };
      case CLEAR_MESSAGE:
        return {
          ...state,
          message: null,
        };
      default:
        return state;
    }
  }
  
  export default messageReducer;
  