import {db} from "../db.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const signup = (req,res) =>{
    const SQLquery = "SELECT * FROM users WHERE email = ? OR username = ?"
    db.query(SQLquery,[req.body.email, req.body.username], (err, data)=>{
        if(err) return res.json(err);
        if(data.length) return res.status(409).json("Account already exists !");
        
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        const SQLquery = "INSERT INTO users (username,email,password) VALUES (?)"
        const values = [
            req.body.username,
            req.body.email,
            hash,
        ]

        db.query(SQLquery,[values], (err,data)=>{
            if(err) return req.json(err);
            return res.status(200).json("User sucessfully created");
        });

    });
};

export const login = (req,res) =>{
    const SQLquery = "SELECT * FROM users WHERE username = ?"

    db.query(SQLquery, [req.body.username], (err,data) =>{
        if(err) return res.json(err);
        if(data.length === 0) return res.status(404).json("User does not exists !");
    
        const checkPassword = bcrypt.compareSync(req.body.password, data[0].password);
    
        if(!checkPassword) return res.status(400).json("Username or password is invalid !");

        const token = jwt.sign({id:data[0].id}, "jwtkey");
        const{password, ...other} = data[0] 

        res.cookie("access_token", token,{
            httpOnly:true
        }).status(200).json(data[other])
    });
};

export const logout = (req,res) =>{
    
}