import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getDatabase, ref, set, push, get } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js';

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

const urlParams = new URLSearchParams(window.location.search);
const ms = urlParams.get('ms') * 100000;
const username = urlParams.get('u');

// Helper to show the loading dialog
const showLoadingDialog = () => {
    document.getElementById('loadingDialog').style.display = 'flex';
};

// Helper to hide the loading dialog
const hideLoadingDialog = () => {
    document.getElementById('loadingDialog').style.display = 'none';
};

const formatDate = (ms) => {
    const date = new Date(ms);
    return date.toLocaleString('default', { year: 'numeric', month: 'long', day: 'numeric' });
};

const findUidByUsername = async (username) => {
    const dbRef = ref(database, 'users');
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            const usersData = snapshot.val();
            for (const uid in usersData) {
                if (usersData[uid].username === username) {
                    return uid;
                }
            }
        }
        return null;
    } catch (error) {
        console.error('Error fetching users:', error);
        return null;
    }
};

const updateDescription = (ms) => {
    if (ms) {
        const dateRead = formatDate(Number(ms));
        document.getElementById('description').textContent = `This message will be readable at ${dateRead}.`;
    }
};

const loadUserProfile = async (uid) => {
    if (uid) {
        const dbRef = ref(database, `users/${uid}`);
        try {
            const snapshot = await get(dbRef);
            if (snapshot.exists()) {
                const profileData = snapshot.val();
                const username = profileData.username || 'Unknown';
                const profilePic = profileData.profile || './assets/profile.png';
                document.getElementById('username').textContent = `@${username}`;
                document.getElementById('profile').src = profilePic;
                document.getElementById('bg1').style.display = 'flex';
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

const handleFormSubmit = async (event) => {
    event.preventDefault();
    const message = document.getElementById('message').value;
    const uid = await findUidByUsername(username);

    if (ms && uid) {
        const dateSent = formatDate(Date.now());
        const dateRead = formatDate(Number(ms));
        const messageRef = push(ref(database, `users/${uid}/messages`));

        const messageData = {
            message: message,
            ms: ms.toString(),
            dateSent: dateSent,
            dateRead: dateRead
        };

        try {
            // Show the loading dialog
            showLoadingDialog();

            // Upload the message to Firebase
            await set(messageRef, messageData);
            console.log('Message uploaded successfully!');

            // Disable the submit button after successful submission
            document.getElementById('submitButton').disabled = true;

            // Redirect after submission (you can add a small delay if needed)
            window.location.href = '/main/sent';
        } catch (error) {
            console.error('Error uploading message:', error);
            // Hide the loading dialog if there's an error
            hideLoadingDialog();
        }
    } else {
        console.error('ms or uid parameter is missing.');
    }
};

const init = async () => {
    const uid = await findUidByUsername(username);
    if (ms && uid) {
        updateDescription(ms);
        loadUserProfile(uid);
    } else {
        document.getElementById('bg1').style.display = 'none';
    }
};

// Initialize the profile and form
init();

// Attach form submission handler
document.getElementById('messageForm').addEventListener('submit', handleFormSubmit);
