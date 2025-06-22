var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');

var app = express();

const fs = require('fs/promises');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

let db;

(async () => {
    try {
        // Connect to MySQL without specifying a database
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '' // Set your MySQL root password
        });

        // Create the database if it doesn't exist
        await connection.query('CREATE DATABASE IF NOT EXISTS dogwalkservice');
        await connection.end();

        // Now connect to the created database
        db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'dogwalkservice'
        });

        const dogwalksdatabase = await fs.readFile('dogwalks.sql', 'utf-8');
        await db.query(dogwalksdatabase);

/*
        await db.execute(`
insert into Users(username,email,password_hash,role) values('alice123','alice@example.com','hashed123','owner');

insert into Users(username,email,password_hash,role) values('bobwalker','bob@example.com','hashed456','walker');

insert into Users(username,email,password_hash,role) values('carol123','carol@example.com','hashed789','owner');

insert into Users(username,email,password_hash,role) values('frederick','fred@example.com','hashed999','owner');

insert into Users(username,email,password_hash,role) values('emily','emily@example.com','hashed888','walker');




insert into Dogs(name,size,owner_id) values('Max', 'medium', (select user_id from Users where username = 'alice123'));

insert into Dogs(name,size,owner_id) values('Bella', 'small', (select user_id from Users where username = 'carol123'));

insert into Dogs(name,size,owner_id) values('Marty', 'large', (select user_id from Users where username = 'alice123'));

insert into Dogs(name,size,owner_id) values('Clifford', 'large', (select user_id from Users where username = 'frederick'));

insert into Dogs(name,size,owner_id) values('Pinky', 'small', (select user_id from Users where username = 'emily'));




insert into WalkRequests(dog_id,requested_time,duration_minutes,location,status) values((select dog_id from Dogs where name = 'Max'),'2025-06-10 08:00:00',30,'Parklands','open');

insert into WalkRequests(dog_id,requested_time,duration_minutes,location,status) values((select dog_id from Dogs where name = 'Bella'),'2025-06-10 09:30:00',45,'Beachside Ave','accepted');

insert into WalkRequests(dog_id,requested_time,duration_minutes,location,status) values((select dog_id from Dogs where name = 'Marty'),'2025-06-12 05:30:00',42,'Dogpark','accepted');

insert into WalkRequests(dog_id,requested_time,duration_minutes,location,status) values((select dog_id from Dogs where name = 'Clifford'),'2025-06-14 03:30:00',10,'Dogpark','accepted');

insert into WalkRequests(dog_id,requested_time,duration_minutes,location,status) values((select dog_id from Dogs where name = 'Pinky'),'2025-06-15 01:30:00',15,'Dogpark','accepted');
      )
    `);*/


    } catch (err) {
        console.error('Error setting up database. Ensure Mysql is running: service mysql start', err);
    }
})();

// Route to return books as JSON
app.get('/', async (req, res) => {
    try {
        const [books] = await db.execute('SELECT * FROM books');
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;
