import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import cors from 'cors'

import AuthRoute from './Routes/AuthRoute.js'
import UserRoute from './Routes/UserRoute.js'
import PostsRoute from './Routes/PostsRoute.js'
import UploadRoute from './Routes/UploadRoute.js'

const app = express();

//to serve images for public
//route to make images accessible for client
app.use(express.static('public'))
app.use('/images',express.static("images"))


//body parser is a middleware which checks routes
app.use(bodyParser.json({limit:'30mb' , extended:true}))
app.use(bodyParser.urlencoded({limit:'30mb' , extended:true}))
app.use(cors())

dotenv.config();
mongoose.connect(process.env.MONGO_DB)



app.use('/auth', AuthRoute)
app.use('/user',UserRoute)
app.use('/post',PostsRoute)
app.use('/upload',UploadRoute)

const PORT = process.env.PORT || 5000
app.listen(PORT,()=>console.log(`App running on port ${PORT}`))