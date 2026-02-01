import {configureStore} from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import sessionReducer from '../features/sessions/sessionSlice';

const store=configureStore({
    reducer: {
        auth: authReducer,
        sessions: sessionReducer,
    },
    devTools:true,
});

export default store