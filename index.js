const express = require('express')
const bodyParser = require('body-parser')
const sequelize = require('./util/database')
const http = require('http');
const socketIO = require('socket.io');
const responseMessage = require('./controllers/users/usersContoller')


const app = express()
const port = 3000

//midle ware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
//route
const routes = require('./routes/users/usersRoutes')
const registerRoutes = require('./routes/register/resgisterRoutes');
app.use('/', routes);
app.use('/', registerRoutes);

// Sync Sequelize models with the database
sequelize.sync()
    .then(() => {
        console.log('Database connected and models synchronized.');
    })
    .catch(error => {
        console.error('Database connection failed:', error);
    });

app.get('/', (req, res) => {
    res.send('hello world zaid here')
})

const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: ['http://localhost:8080', 'http://localhost:8081'], // Update with your client's URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  },
});

io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for a message from the client
    socket.on('chat message', async (message) => {
        console.log('Message from client:', message);

        try {
            // Call the generateResponse function with the received message
            const aiResponse = await responseMessage.generateResponse(message);

            // Emit the AI response to the client
            io.emit('chat message', aiResponse);
        } catch (error) {
            console.error('Error generating AI response:', error);
            // Emit an error message to the client if needed
            io.emit('chat message', 'An error occurred while generating the AI response.');
        }
    });

});


server.listen(3000, () => {
    console.log('Server is running on port 3000');
});

