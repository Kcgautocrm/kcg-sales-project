import { configureStore } from "@reduxjs/toolkit";
import notificationMessagesReducer from './slices/notificationSlice';
import userDataReducer from './slices/userDataSlice'


export default configureStore({
  reducer: {
    notificationMessages: notificationMessagesReducer,
    userData: userDataReducer
  },
})