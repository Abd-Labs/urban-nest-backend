const express = require('express')
const app = express();
const cors = require("cors");
const dotenv = require('dotenv')
dotenv.config();
const connectDB = require('./mongodb/connect.js')
const cookieParser = require('cookie-parser')
const PropertyRoutes = require('./routes/v1/PropertyRoutes.js')
const UserRoutes = require('./routes/v1/UserRoutes.js')
const authRoute = require('./routes/auth-route.js')
const authenticateToken = require('./middlewares/validatejwt');

const PORT = process.env.PORT || 5000;
const passport = require('passport');
require('./passport');

app.use(
  cors({
    origin: ['http://localhost:3000', 'https://urban-nest-d9wj.vercel.app'],
    credentials:true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// app.use(
//   session({
//     secret: 'MySecretKey',
//     resave: true,
//     saveUninitialized: true,
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());
// Define a route to serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use('/auth',authRoute)
app.use(authenticateToken);
app.use('/api/users',UserRoutes);
app.use('/api/properties',PropertyRoutes);
const startServer = async()=>{
  try {
    connectDB(process.env.MONGODB_URL);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

startServer()


