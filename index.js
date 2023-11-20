const express = require("express")
const {chats} = require("./data/data")
const dotenv = require("dotenv")
const connectDB = require("./config/db")
const colors = require("colors")
const userRoute= require("./routes/userRoutes")
const chatRoutes = require("./routes/chatRoutes")
const messageRoutes = require("./routes/messageRoutes")
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const cors = require("cors");


dotenv.config() 
connectDB()


const app = express()
app.use(express.json())
app.use(cors());


//Online Status
const connectedUsers = {};

const updateOnlineStatus = (userId, isOnline) => {
    if (userId) {
      connectedUsers[userId] = isOnline;
      io.emit("online status", { userId, isOnline });
    }
  };

app.use('/api/user', userRoute)
app.use('/api/chat',chatRoutes)
app.use('/api/message', messageRoutes)


// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 6000 
const server = app.listen(PORT, console.log(`Server started on ${PORT}`.yellow.bold))

const io= require('socket.io')(server,{
    pingTimeout:60000,
    cors:{
        origin: 'https://simplechat-app007.netlify.app',
    },
})

io.on('connection',(socket)=>{
    console.log("connected to socket.io")
    console.log("User connected:", socket.id);

    socket.on('setup',(userData)=>{
        console.log("User setup:", userData);
        socket.join(userData._id);
        socket.emit('connected');
    })

    socket.on('typing',(room)=>socket.in(room).emit('typing'))
    socket.on('stop typing',(room)=>socket.in(room).emit('stop typing'))
    

    socket.on('join chat',(room)=>{
        console.log("User Joined Room: " + room)
        socket.join(room)
    })

    socket.on('new message',(newMessageRecieved)=>{
      var chat =newMessageRecieved.chat ;


      if(!chat.users){
        return console.log('chat.users not defined')
      }

      chat.users.forEach(user=>{
        if(user._id == newMessageRecieved.sender._id) return;

        socket.in(user._id).emit('message recieved', newMessageRecieved)
      })
    })


    socket.off('setup',()=>{
        console.log("USER DISCONNECTED")
        socket.leave(userData._id);
    })
})