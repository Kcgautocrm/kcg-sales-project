import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearMessage, setMessage } from '../store/slices/notificationSlice';
import { millisToMinutesAndSeconds } from '../services/formatTime';
import { Alert, AlertTitle, Stack } from '@mui/material';


const styles = {
  root: {
    width: '400px',
    position: 'fixed',
    top: "50px",
    right: "10px",
    zIndex: 3000,
  }
}

const Toast = ({id, message, severity }) => {
  const dispatch = useDispatch();
  return (
    <>
      <Alert className='w-100' severity={severity} onClose={() => dispatch(clearMessage({ severity: severity, key: id }))}>
        <AlertTitle><span className='text-capitalize'>{severity}</span></AlertTitle>
        {message}
      </Alert>
    </>
  )
}

export default function AlertNotification() {
  const messages = useSelector((state) => state.notificationMessages.messages)
  const { success, error } = messages

  useEffect(() => {
  }, [])

  const dispatch = useDispatch();

  const successMessages = () => {
    return success.map((message, index) => {
      setTimeout(() => {
        dispatch(clearMessage({severity: "success", key: message.key}))
      }, 10000);
      return (
        <Toast key={message.key} id={message.key} message={message.message} severity="success" />
      )
    })
  }

  const errorMessages = () => {
    return error.map((message, index) => {
      setTimeout(() => {
        dispatch(clearMessage({ severity: "error", key: message.key }))
      }, 5000);
      return (
        <Toast key={message.key} id={message.key} message={message.message} severity="error" />
      )
    })
  }

  return (
    <Stack  sx={styles.root} spacing={2}>
      {successMessages()}
      {errorMessages()}
    </Stack>
  );
}