// Firebase Initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getDatabase, ref, set, push, get, child } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js';

const firebaseConfig = {
    apiKey: "AIzaSyB4d-Qu0es_2LvfteHhVPu7UK82qVy0MSg",
    authDomain: "futurenote-bd84e.firebaseapp.com",
    databaseURL: "https://futurenote-bd84e-default-rtdb.firebaseio.com",
    projectId: "futurenote-bd84e",
    storageBucket: "futurenote-bd84e.appspot.com",
    messagingSenderId: "981854506828",
    appId: "1:981854506828:web:5c18a95d5bf1961895c9e9",
    measurementId: "G-SXX90YNN3C"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const ms = (parseInt(urlParams.get('ms')) * 100000).toString();
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
            window.location.href = '/main/sent';
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
