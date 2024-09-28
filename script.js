// Firebase Initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getDatabase, ref, set, push, get, child } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const ms = urlParams.get('ms');
const uid = urlParams.get('uid');

// Function to format the date
const formatDate = (ms) => {
    const date = new Date(ms);
    return date.toLocaleString('default', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Function to update description with readable date
const updateDescription = () => {
    if (ms && uid) {
        const dateRead = formatDate(Number(ms));
        document.getElementById('description').textContent = `This message will be readable at ${dateRead}.`;
    }
};

// Fetch user profile data from Firebase
const loadUserProfile = async () => {
    if (uid) {
        const dbRef = ref(database);
        try {
            const snapshot = await get(child(dbRef, `users/${uid}`));
            if (snapshot.exists()) {
                const profileData = snapshot.val();

                const username = profileData.username || 'Unknown';
                const profilePic = profileData.profile || './assets/profile.png'; // Fallback to default profile

                // Update the DOM with profile data
                document.getElementById('username').textContent = `@${username}`;
                document.getElementById('profile').src = profilePic;
            } else {
                console.log('No profile data available');
                document.getElementById('bg1').style.display = 'none';
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            document.getElementById('bg1').style.display = 'none';
        }
    }
};

// Handle form submission
const handleFormSubmit = async (event) => {
    event.preventDefault();
    const message = document.getElementById('message').value;

    if (ms && uid) {
        const dateSent = formatDate(Date.now());
        const dateRead = formatDate(Number(ms));

        const messageRef = push(ref(database, `users/${uid}/messages`));

        const messageData = {
            message: message,
            ms: ms,
            dateSent: dateSent,
            dateRead: dateRead
        };

        try {
            await set(messageRef, messageData);
            console.log('Message uploaded successfully!');
            // Disable the submit button after successful submission
            document.getElementById('submitButton').disabled = true;
            window.location.href = '/sent';
        } catch (error) {
            console.error('Error uploading message:', error);
        }
    } else {
        console.error('ms or uid parameter is missing.');
    }
};

// Load the profile and update the description when the page loads
if (ms && uid) {
    updateDescription();
    loadUserProfile();
} else {
    document.getElementById('bg1').style.display = 'none';
}

// Attach form submission handler
document.getElementById('messageForm').addEventListener('submit', handleFormSubmit);
