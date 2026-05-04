import api from './httpServices';

// Admin login
export const adminLogin = (email, password) => {
    return api.post('/auth/login', { email, password });
};

// Admin register
export const adminRegister = (username, email, password) => {
    return api.post('/auth/register', { username, email, password });
};

// User login
export const userLogin = (email, password) => {
    return api.post('/auth/user/login', { email, password });
};

export const getAdminCakesAndIngredients = () => {
    return api.get('/admin/recipe-ingredients');
}


// User register
export const userRegister = (firstName, lastName, gender, email, phone, password, street, city, postalCode, dietaryRestrictions) => {
    return api.post('/auth/user/register', { 
        firstName, 
        lastName, 
        gender, 
        email, 
        phone, 
        password, 
        street, 
        city, 
        postalCode, 
        dietaryRestrictions 
    });
};

// Verify email OTP after registration
export const verifyEmail = (email, otp) => {
    return api.post('/auth/user/verify-email', { email, otp });
};

// Logout
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Token utilities
export const saveToken = (token) => {
    localStorage.setItem('token', token);
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export default {
    adminLogin,
    adminRegister,
    userLogin,
    userRegister,
    verifyEmail,
    logout,
    saveToken,
    getToken
};
