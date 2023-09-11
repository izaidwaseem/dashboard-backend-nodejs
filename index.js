const express = require('express')
const bodyParser = require('body-parser')
const sequelize = require('./util/database')
// const server =  require('./sockets/socket')
const http = require('http');

const app = express()
const server = http.createServer(app);


//midle ware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

//routes
const userRoutes = require('./routes/users/usersRoutes')
const registerRoutes = require('./routes/register/resgisterRoutes');
const fileRoutes = require('./routes/file/fileRoutes');
const seederRoutes = require('./routes/seeders/seederRoutes')

app.use('/users', userRoutes);
app.use('/register', registerRoutes);
app.use('/file', fileRoutes);
app.use('/seeders', seederRoutes);

// Sync Sequelize models with the database
sequelize.sync()
    .then(() => {
        console.log('Database connected and models synchronized.');
    })
    .catch(error => {
        console.error('Database connection failed:', error);
    });

const port = 3000
server.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});

