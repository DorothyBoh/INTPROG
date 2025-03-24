// Base URL for the API
const baseURL = 'https://reqres.in/api/users';

// Response output element
const responseOutput = document.getElementById('response-output');
const namePreview = document.querySelector('.name-preview');
const emailPreview = document.querySelector('.email-preview');
const responseCardsContainer = document.getElementById('response-cards');

// Update preview
function updatePreview() {
    const name = document.getElementById('name').value || 'Name';
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('email').value || 'Email';
    
    // If name is provided, use it, otherwise use first and last name if available
    let displayName = name;
    if (!name && (firstName || lastName)) {
        displayName = `${firstName} ${lastName}`.trim();
    }
    
    namePreview.textContent = displayName;
    emailPreview.textContent = email;
}

// Add input event listeners for preview update
document.getElementById('name').addEventListener('input', updatePreview);
document.getElementById('first-name').addEventListener('input', updatePreview);
document.getElementById('last-name').addEventListener('input', updatePreview);
document.getElementById('email').addEventListener('input', updatePreview);

// Display response as a user card
function displayResponse(data) {
    responseOutput.textContent = ''; // Clear JSON response output
    responseCardsContainer.innerHTML = ''; // Clear previous cards

    if (data && data.data) {
        const users = Array.isArray(data.data) ? data.data : [data.data];
        displayResponseCards(users);
    } else if (data && data.id) {
        displayResponseCards([data]);
    }
}

// Function to create user cards
function displayResponseCards(users) {
    responseCardsContainer.innerHTML = '';

    users.forEach(user => {
        const card = document.createElement('div');
        card.classList.add('user-card');
        card.innerHTML = `
            <img src="${user.avatar || 'https://via.placeholder.com/150'}" alt="${user.first_name}">
            <p><strong>${user.first_name} ${user.last_name}</strong></p>
            <p>${user.email}</p>
        `;
        responseCardsContainer.appendChild(card);
    });
}



// Display error
function displayError(error) {
    responseOutput.textContent = `Error: ${error.message}`;
    responseCardsContainer.innerHTML = '<p class="error-message">An error occurred</p>';
}

// GET - Fetch user(s)
function handleGet() {
    const userId = document.getElementById('user-id').value;
    const url = userId ? `${baseURL}/${userId}` : baseURL;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayResponse(data);
            
            // If a single user is fetched, update the form
            if (userId && data.data) {
                document.getElementById('name').value = `${data.data.first_name} ${data.data.last_name}`;
                document.getElementById('first-name').value = data.data.first_name;
                document.getElementById('last-name').value = data.data.last_name;
                document.getElementById('email').value = data.data.email;
                updatePreview();
            } else if (data.data) {
                // Display all users
                displayUsers(data.data);
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            displayError(error);
        });
}

function handlePost() {
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const avatar = "https://via.placeholder.com/150"; // Default avatar

    if (!firstName || !lastName || !email) {
        displayError(new Error('First Name, Last Name, and Email are required for POST request'));
        return;
    }

    const userData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        avatar: avatar // Add avatar for user
    };

    fetch(baseURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        displayResponse(data);
        displayResponseCards([userData]); // Ensure UI updates
    })
    .catch(error => displayError(error));
}



// PUT - Update an existing user (replace entire resource)
function handlePut() {
    const userId = document.getElementById('user-id').value;
    const name = document.getElementById('name').value;
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('email').value;
    
    if (!userId) {
        displayError(new Error('User ID is required for PUT request'));
        return;
    }
    
    // Parse name into first and last if first/last aren't provided
    let parsedFirstName = firstName;
    let parsedLastName = lastName;
    
    if (!firstName && !lastName && name) {
        const nameParts = name.split(' ');
        if (nameParts.length > 1) {
            parsedFirstName = nameParts[0];
            parsedLastName = nameParts.slice(1).join(' ');
        } else {
            parsedFirstName = name;
        }
    }
    
    const userData = {
        first_name: parsedFirstName || '',
        last_name: parsedLastName || '',
        email: email || ''
    };
    
    fetch(`${baseURL}/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayResponse(data);
            handleGet(); // Refresh user list
        })
        .catch(error => {
            console.error('Error updating user:', error);
            displayError(error);
        });
}

// PATCH - Partially update an existing user
function handlePatch() {
    const userId = document.getElementById('user-id').value;
    const name = document.getElementById('name').value;
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('email').value;
    
    if (!userId) {
        displayError(new Error('User ID is required for PATCH request'));
        return;
    }
    
    // Only include fields that have been filled
    const userData = {};
    
    // Handle name parsing for patch
    if (name) {
        const nameParts = name.split(' ');
        if (nameParts.length > 1) {
            userData.first_name = nameParts[0];
            userData.last_name = nameParts.slice(1).join(' ');
        } else {
            userData.first_name = name;
        }
    } else {
        if (firstName) userData.first_name = firstName;
        if (lastName) userData.last_name = lastName;
    }
    
    if (email) userData.email = email;
    
    if (Object.keys(userData).length === 0) {
        displayError(new Error('At least one field must be filled for PATCH request'));
        return;
    }
    
    fetch(`${baseURL}/${userId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayResponse(data);
            handleGet(); // Refresh user list
        })
        .catch(error => {
            console.error('Error patching user:', error);
            displayError(error);
        });
}

// DELETE - Remove a user
function handleDelete() {
    const userId = document.getElementById('user-id').value;
    
    if (!userId) {
        displayError(new Error('User ID is required for DELETE request'));
        return;
    }
    
    fetch(`${baseURL}/${userId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok && response.status !== 204) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            // For DELETE, often there is no content returned
            if (response.status === 204) {
                displayResponse({ status: 'Success', message: `User ${userId} deleted successfully` });
            } else {
                return response.json();
            }
        })
        .then(data => {
            if (data) displayResponse(data);
            handleGet(); // Refresh user list
        })
        .catch(error => {
            console.error('Error deleting user:', error);
            displayError(error);
        });
}

// Display users in the list
function displayUsers(users) {
    if (!users || users.length === 0) {
        document.querySelector('.list-container').innerHTML = '<p>No users to display</p>';
        return;
    }
    
    const markup = users.map(user => {
        return `
        <li class="card-container" data-id="${user.id}">
            <img class="round" src="${user.avatar || 'https://reqres.in/img/faces/1-image.jpg'}">
            <div class="name-container">
                <span>${user.first_name} ${user.last_name}</span>
            </div>
            <p class="email">${user.email}</p>
        </li>
        `;
    });
    
    document.querySelector('.list-container').innerHTML = markup.join('');
    
    // Add click event to user cards to load user details
    document.querySelectorAll('.list-container .card-container').forEach(card => {
        card.addEventListener('click', () => {
            const userId = card.getAttribute('data-id');
            document.getElementById('user-id').value = userId;
            handleGet();
        });
    });
}

// Clear form fields
function clearForm() {
    document.getElementById('user-id').value = '';
    document.getElementById('name').value = '';
    document.getElementById('first-name').value = '';
    document.getElementById('last-name').value = '';
    document.getElementById('email').value = '';
    updatePreview();
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    handleGet(); // Load users when page loads
});
