const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./')); // Serve static files from current directory

// Initialize SQLite database
const db = new sqlite3.Database('./contacts.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Create contacts table if it doesn't exist
function initializeDatabase() {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    db.run(createTableSQL, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Contacts table ready');
        }
    });
}

// Routes

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve contact page
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

// API endpoint to submit contact form
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message, timestamp } = req.body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
        return res.status(400).json({
            success: false,
            message: 'Todos los campos son obligatorios'
        });
    }
    
    // Additional validation
    if (name.length < 2 || name.length > 100) {
        return res.status(400).json({
            success: false,
            message: 'El nombre debe tener entre 2 y 100 caracteres'
        });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Correo electrónico inválido'
        });
    }
    
    if (subject.length < 5 || subject.length > 200) {
        return res.status(400).json({
            success: false,
            message: 'El asunto debe tener entre 5 y 200 caracteres'
        });
    }
    
    if (message.length < 10 || message.length > 1000) {
        return res.status(400).json({
            success: false,
            message: 'El mensaje debe tener entre 10 y 1000 caracteres'
        });
    }
    
    // Insert into database
    const insertSQL = `
        INSERT INTO contacts (name, email, subject, message, timestamp)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    const params = [
        name.trim(),
        email.trim(),
        subject.trim(),
        message.trim(),
        timestamp || new Date().toISOString()
    ];
    
    db.run(insertSQL, params, function(err) {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
        
        console.log(`New contact saved with ID: ${this.lastID}`);
        res.json({
            success: true,
            message: 'Mensaje enviado exitosamente',
            id: this.lastID
        });
    });
});

// API endpoint to get all contacts (for admin purposes)
app.get('/api/contacts', (req, res) => {
    const selectSQL = `
        SELECT id, name, email, subject, message, timestamp, created_at
        FROM contacts
        ORDER BY created_at DESC
    `;
    
    db.all(selectSQL, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener contactos'
            });
        }
        
        res.json({
            success: true,
            contacts: rows
        });
    });
});

// API endpoint to get contact statistics
app.get('/api/stats', (req, res) => {
    const statsSQL = `
        SELECT 
            COUNT(*) as total_contacts,
            COUNT(CASE WHEN date(created_at) = date('now') THEN 1 END) as today_contacts,
            COUNT(CASE WHEN date(created_at) >= date('now', '-7 days') THEN 1 END) as week_contacts
        FROM contacts
    `;
    
    db.get(statsSQL, [], (err, row) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas'
            });
        }
        
        res.json({
            success: true,
            stats: row
        });
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Catch-all handler for SPA routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop');
});

module.exports = app;