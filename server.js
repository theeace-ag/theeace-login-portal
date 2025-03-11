const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { parse } = require('csv-parse');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

// Initialize users.json if it doesn't exist
const usersFilePath = path.join(__dirname, 'users.json');
if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([]));
}

// Add error logging middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: err.message });
});

// Helper function to read users
function readUsers() {
    try {
        const data = fs.readFileSync(usersFilePath);
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading users:', error);
        return [];
    }
}

// Helper function to write users
function writeUsers(users) {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error writing users:', error);
        throw error;
    }
}

// Get all users
app.get('/api/users', (req, res) => {
    try {
        const users = readUsers();
        console.log('Current users:', users);
        res.json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ message: 'Error reading users' });
    }
});

// Add single user
app.post('/api/users', (req, res) => {
    try {
        console.log('Received user data:', req.body);
        const { username, userId, passkey } = req.body;
        
        // Validate input
        if (!username || !userId || !passkey) {
            console.log('Missing fields:', { username, userId, passkey });
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        const users = readUsers();
        
        // Check if user already exists
        if (users.some(u => u.username === username || u.userId === userId)) {
            console.log('User already exists:', username);
            return res.status(400).json({ message: 'Username or User ID already exists' });
        }
        
        // Add new user
        const newUser = {
            username,
            userId,
            passkey,
            createdAt: new Date().toISOString(),
            lastLogin: null
        };
        
        users.push(newUser);
        writeUsers(users);
        console.log('User added successfully:', username);
        
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Error adding user' });
    }
});

// Bulk import users via CSV
app.post('/api/users/bulk-import', upload.single('csv'), (req, res) => {
    console.log('Starting CSV import');
    if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ message: 'No file uploaded' });
    }
    
    console.log('File received:', req.file);
    const results = [];
    const users = readUsers();
    
    fs.createReadStream(req.file.path)
        .pipe(parse({ columns: true, trim: true }))
        .on('data', (row) => {
            try {
                console.log('Processing row:', row);
                // Validate row data
                if (!row.username || !row.userId || !row.passkey) {
                    console.log('Missing fields in row:', row);
                    results.push({
                        success: false,
                        username: row.username,
                        error: 'Missing required fields'
                    });
                    return;
                }
                
                // Check for duplicates
                if (users.some(u => u.username === row.username || u.userId === row.userId)) {
                    console.log('Duplicate user found:', row.username);
                    results.push({
                        success: false,
                        username: row.username,
                        error: 'Username or User ID already exists'
                    });
                    return;
                }
                
                // Add new user
                const newUser = {
                    username: row.username,
                    userId: row.userId,
                    passkey: row.passkey,
                    createdAt: new Date().toISOString(),
                    lastLogin: null
                };
                
                users.push(newUser);
                console.log('User added from CSV:', row.username);
                results.push({
                    success: true,
                    username: row.username
                });
            } catch (error) {
                console.error('Error processing row:', error);
                results.push({
                    success: false,
                    username: row.username,
                    error: 'Invalid data format'
                });
            }
        })
        .on('end', () => {
            try {
                // Save all valid users
                writeUsers(users);
                console.log('CSV import completed. Results:', results);
                
                // Clean up uploaded file
                fs.unlinkSync(req.file.path);
                
                res.json({
                    message: 'Import completed',
                    results
                });
            } catch (error) {
                console.error('Error finalizing import:', error);
                res.status(500).json({
                    message: 'Error saving imported users',
                    error: error.message
                });
            }
        })
        .on('error', (error) => {
            console.error('CSV parsing error:', error);
            res.status(500).json({
                message: 'Error processing CSV file',
                error: error.message
            });
        });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    try {
        const { username, userId, passkey } = req.body;
        const users = readUsers();
        
        const user = users.find(u => 
            u.username === username && 
            u.userId === userId && 
            u.passkey === passkey
        );
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Update last login
        user.lastLogin = new Date().toISOString();
        writeUsers(users);
        
        res.json({ message: 'Login successful', user });
    } catch (error) {
        res.status(500).json({ message: 'Error during login' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
}); 