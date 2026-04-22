import {configureStore} from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import sessionReducer from '../features/sessions/sessionSlice';
import proctoringReducer from '../features/proctoring/proctoringSlice';

const store=configureStore({
    reducer: {
        auth: authReducer,
        sessions: sessionReducer,
        proctoring: proctoringReducer,
    },
    devTools:true,
});

export default store