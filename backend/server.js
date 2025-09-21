const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// Load environment variables if available
try {
    require('dotenv').config({ path: path.join(__dirname, '.env') });
} catch (e) {
    // optional
}

const app = express();
const PORT = process.env.PORT || 3000;
// DB_FILE default now points to /data (for docker) else local backend directory
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'contacts.db');
const DB_DIR = path.dirname(DB_FILE);

if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

// Middleware
app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.url}`);
    next();
});
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Serve static frontend from project root (one level up)
app.use(express.static(path.join(__dirname, '..')));

// Initialize SQLite database
const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log(`Connected to SQLite database at ${DB_FILE}`);
        initializeDatabase();
    }
});

function initializeDatabase() {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            phone TEXT,
            interest TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;
    db.run(createTableSQL, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Contacts table ready');
            // Attempt to add new columns if migrating from older schema
            db.run("ALTER TABLE contacts ADD COLUMN phone TEXT", () => {});
            db.run("ALTER TABLE contacts ADD COLUMN interest TEXT", () => {});
        }
    });
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'contact.html'));
});

function validateAndInsertContact({ firstName, lastName, email, interest, phone, message }) {
    const name = `${(firstName||'').trim()} ${(lastName||'').trim()}`.trim();
    const subject = interest ? `Interés: ${interest}` : 'Contacto';
    const timestamp = new Date().toISOString();
    if (!name || !email || !message) {
        return { error: 'Nombre, correo y mensaje son obligatorios' };
    }
    if (name.length < 2 || name.length > 120) {
        return { error: 'El nombre debe tener entre 2 y 120 caracteres' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { error: 'Correo electrónico inválido' };
    }
    if (message.length < 5 || message.length > 2000) {
        return { error: 'El mensaje debe tener entre 5 y 2000 caracteres' };
    }
    const insertSQL = `
        INSERT INTO contacts (name, email, subject, message, phone, interest, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    return { insertSQL, params: [name, email.trim(), subject, message.trim(), (phone||'').trim(), (interest||'').trim(), timestamp] };
}

// API JSON original
app.post('/api/contact', (req, res) => {
    const { error, insertSQL, params } = validateAndInsertContact(req.body);
    if (error) return res.status(400).json({ success: false, message: error });
    db.run(insertSQL, params, function (err) {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
        res.json({ success: true, message: 'Mensaje enviado exitosamente', id: this.lastID });
    });
});

// Manejo de formulario HTML (POST desde contact.html)
app.post('/good-bye.html', (req, res) => {
    const formMap = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        interest: req.body.interest,
        phone: req.body.phone,
        message: req.body.message
    };
    const { error, insertSQL, params } = validateAndInsertContact(formMap);
    if (error) {
        return res.status(400).send(`<html><body><h1>Error</h1><p>${error}</p><a href=\"/contact.html\">Volver</a></body></html>`);
    }
    db.run(insertSQL, params, function (err) {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send('<h1>Error interno</h1>');
        }
        // Redirigir con 303 para evitar repost al refrescar
        res.redirect(303, '/good-bye.html?id=' + this.lastID);
    });
});

app.get('/api/contacts', (req, res) => {
    const selectSQL = `
        SELECT id, name, email, subject, message, timestamp, created_at
        FROM contacts
        ORDER BY created_at DESC
    `;
    db.all(selectSQL, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ success: false, message: 'Error al obtener contactos' });
        }
        res.json({ success: true, contacts: rows });
    });
});

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
            return res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
        }
        res.json({ success: true, stats: row });
    });
});

app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
