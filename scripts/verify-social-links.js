const axios = require('axios');

const BASE_URL = 'http://localhost:5050/api';
let TOKEN = ''; // Set this after login

async function testSocialLinks() {
    try {
        console.log('--- Starting Social Links Verification ---');

        // 1. Update Profile with social links
        console.log('1. Updating profile with social links...');
        const updateRes = await axios.patch(`${BASE_URL}/profile/update`, {
            socialLinks: {
                instagram: 'https://instagram.com/testbrand',
                tiktok: 'https://tiktok.com/@testbrand',
                facebook: 'https://facebook.com/testbrand'
            }
        }, {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });

        if (updateRes.data.success) {
            console.log('Update successful!');
            console.log('Social Links:', updateRes.data.profile.socialLinks);
        } else {
            console.log('Update failed:', updateRes.data.message);
            return;
        }

        // 2. Fetch Profile to verify
        console.log('\n2. Fetching profile to verify...');
        const fetchRes = await axios.get(`${BASE_URL}/profile/me`, {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });

        const socialLinks = fetchRes.data.profile.socialLinks;
        if (socialLinks.instagram === 'https://instagram.com/testbrand' &&
            socialLinks.tiktok === 'https://tiktok.com/@testbrand' &&
            socialLinks.facebook === 'https://facebook.com/testbrand') {
            console.log('Verification successful! All social links retrieved correctly.');
        } else {
            console.log('Verification failed! Social links mismatch.');
            console.log('Expected:', {
                instagram: 'https://instagram.com/testbrand',
                tiktok: 'https://tiktok.com/@testbrand',
                facebook: 'https://facebook.com/testbrand'
            });
            console.log('Received:', socialLinks);
        }

    } catch (error) {
        console.error('Test failed with error:', error.response ? error.response.data : error.message);
    }
}

// Note: This script requires a valid token. Since I cannot create one without a user account,
// I am providing this as a template for the user or for me to run if I had a test user.
// testSocialLinks();
