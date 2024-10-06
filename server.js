const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');

app.use(express.json());
app.use(cors());
dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

console.log('Sending message to the browser...');
db.connect((error) => {
    if (error) {
        console.log('Error connecting to MySQL');
    } else {
        console.log('Connected to MySQL as id: ', db.threadId);
    }
});

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Route for fetching patients
app.get('/data/all', (req, res) => {
    const queryPatients = 'SELECT * FROM patients';
    const queryProviders = 'SELECT * FROM providers';

    db.query(queryPatients, (errPatients, patients) => {
        if (errPatients) {
            console.error(errPatients);
            res.status(500).send('Error retrieving patients data');
        } else {
            db.query(queryProviders, (errProviders, providers) => {
                if (errProviders) {
                    console.error(errProviders);
                    res.status(500).send('Error retrieving providers data');
                } else {
                    res.render('data', { providers: providers, patients: patients });
                }
            });
        }
    });
});

app.get('/patients', (req, res) => {
    const firstName = req.query.firstName;

    // Query to select patients by their first name
    const query = 'SELECT * FROM patients WHERE first_name = ?';

    db.query(query, [firstName], (err, patients) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving patients data');
        } else {
            res.render('patients', { patients: patients });
        }
    });
});

app.get('/providers', (req, res) => {
    const specialty = req.query.specialty;

    // Query to select providers by their specialty
    const query = 'SELECT * FROM providers WHERE provider_specialty = ?';

    db.query(query, [specialty], (err, providers) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving providers data');
        } else {
            res.render('providers', { providers: providers });
        }
    });
});


app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);

    app.get('/', (req, res) => {
        res.send('Server started successfully!');
    });
});
