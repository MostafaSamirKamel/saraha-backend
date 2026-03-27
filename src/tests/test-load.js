try {
    console.log('Attempting to load app...');
    const app = require('./src/app');
    console.log('App loaded successfully!');
} catch (error) {
    console.error('Failed to load app:');
    console.error(error);
}
