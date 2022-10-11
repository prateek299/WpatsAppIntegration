import axios from 'axios';

import {
  GET_MESSAGES,
  MESSAGE_ERROR,
  CLEAR_MESSAGE,
} from './types';


// Get all messages
export const getMessages = () => async (dispatch) => {
    dispatch({ type: CLEAR_MESSAGE });
  
    try {
      const res = await axios.get('/api/message');
      console.log(res)
      dispatch({
        type: GET_MESSAGES,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: MESSAGE_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status }
      });
    }
  };