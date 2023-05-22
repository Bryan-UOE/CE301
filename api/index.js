import express from "express";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import usersRoutes from "./routes/users.js";
import messagesRoutes from "./routes/messages.js"
import feedRoutes from "./routes/feed.js"
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/feed", feedRoutes);


app.listen(5000,()=>{
    console.log("connected!");
})


function sendEmail(){


    return new Promise((resolve, reject) =>{
        let transporter = NodeMailer.createTransport({
            service: "gmail",
            auth:{
                user:'nodemailercls123@gmail.com',
                pass:'anxemickruvhlrjk'
            } 
        })

        const mail_config={
            from:'nodemailercls123@gmail.com',
            to:'contactbryanchan@gmail.com',
            subject: 'Sign-up Verification',
            text: 'Click here to verify'
        }
        transporter.sendMail(mail_config, function(error, info){
            if(error){
                console.log(error)
                return reject({message:'Error sending email'})
            } 
            return resolve({message:"Email send successfully"})
        })
    })
}

// app.get('/sendVerification', (req, res) =>{
//     sendEmail()
//     .then(response=>res.send (response.message))
//     .catch(error=>res.status(500).send(error.message))
// })



  