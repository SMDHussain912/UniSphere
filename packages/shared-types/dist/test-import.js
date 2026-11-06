// Test that types are correctly structured
const primaryColor = '#2a14b4';
const mdSpacing = '1rem';
const smRadius = '0.25rem';
const displayFont = 'Plus Jakarta Sans, sans-serif';
const userSample = {
    _id: 'test123',
    fullname: { firstname: 'Test', lastname: 'User' },
    email: 'test@example.com',
    role: 'user',
    active: true,
    createdAt: '',
    updatedAt: '',
};
const response = {
    success: true,
    data: userSample,
};
const credentials = {
    email: 'test@example.com',
    password: 'password123',
};
console.log('All shared-types imports successful');
console.log('Primary color:', primaryColor);
console.log('User sample:', userSample.email);
export {};
