const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userController = {
    register: async(req,res)=>{
        try{
            const {name,email, password} = req.body;
            const user = await userModel.findOne({email})
            if(user) return res.status(400).json({msg: "Email da ton tai"})

            if(password.length < 6) 
            return res.status(400).json({msg: "Password phai lon hon 6 ki tu"})

            //Ma hoa mat khau
            const passwordHash = await bcrypt.hash(password,10)

            const newUser =new userModel({
                name,email,password: passwordHash
            })

            //Luu vao MongoDB
            await newUser.save()

            //Tao jsonwebtoken xac thuc
            const accestoken = createAccessToken({id: newUser._id})
            const refreshtoken = createRefreshToken({id: newUser._id})

            res.cookie('refreshtoken',refreshtoken,{
                httpOnly:true,
                path: '/user/refresh_token'
                })

            res.json({accestoken})
            // res.json({msg:"Dang ki thanh cong"})
        }   
        catch(err){
            return res.status(500).json({msg:err.message})
        }
    },
    login:async(req,res)=>{
        try {
            const {email,password} = req.body;
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    refreshToken: (req, res) =>{
        try {
            const rf_token = req.cookies.refreshtoken;
            if(!rf_token) return res.status(400).json({msg: "Vui long dang nhap hay dang ki"})

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) =>{
                if(err) return res.status(400).json({msg: "Vui long dang nhap hay dang ki"})

                const accesstoken = createAccessToken({id: user.id})

                res.json({accesstoken})
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
        
    }
}

const createAccessToken = (user)=>{
    return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET, {expiresIn:'1d'})
}

const createRefreshToken = (user)=>{
    return jwt.sign(user,process.env.REFRESH_TOKEN_SECRET, {expiresIn:'7d'})
}


module.exports = userController