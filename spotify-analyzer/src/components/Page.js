import React from 'react';
import { Navigate } from 'react-router-dom';

import { authService } from '../services/auth';

const Page = ({ element}) => {
    return authService.checkAuth() ? element : <Navigate to="/login" />;
};

export default Page;