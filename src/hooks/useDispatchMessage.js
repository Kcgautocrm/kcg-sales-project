import { useDispatch } from "react-redux";
import { setMessage } from '@/store/slices/notificationSlice';

const useDispatchMessage = () =>{
  const dispatch = useDispatch()

  const dispatchMessage = ({severity = "success", message = ""}) =>{
    dispatch(
      setMessage({
        severity,
        message,
        key: Date.now(),
      })
    );
  }
  
  return dispatchMessage
}

export default useDispatchMessage;