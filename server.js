const express = require("express")
const bodyparser = require("body-parser")
const passport = require("passport")
const methodoverride = require("method-override")
const session = require("express-session")
const passportlocalmongoose = require("passport-local-mongoose")
const mongoose = require("mongoose")

const app = express()
const port = process.env.PORT || 4000 ;
app.set("view engine","ejs")
app.use(bodyparser.urlencoded({extended:true}))
app.use(methodoverride("_method"))
mongoose.set('strictQuery',false)
app.use(express.static("public"))

app.use(
    session({
        secret:"AS@710",
        resave:true,
        saveUninitialized:false
    })
)

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect(
    "mongodb+srv://sibi:arunsibi@hospital-systems.wgqwd8m.mongodb.net/hms-admin-db2?retryWrites=true&w=majority&appName=hospital-systems"
)

const userSchema = new mongoose.Schema({
    email:String,
    passport:String
})

userSchema.plugin(passportlocalmongoose)
const user = new mongoose.model("users",userSchema)

passport.use(user.createStrategy())

passport.serializeUser(user.serializeUser()) // logged user data session store
passport.deserializeUser(user.deserializeUser()) // logout user data session delete

const patients = mongoose.model("patients",{
    patient_id : Number,
    patient_name:String,
    patient_age:Number,
    patient_address : String,
    patient_moblie:Number,
    patient_disease:String
})

app.post("/",(req,res)=>{

    // user.register({username:req.body.username},req.body.password,(err,user)=>{
    //     if(err){
    //         console.log(err);
            
    //     }
    //     else{
    //         console.log(user);

            
    //     }
    // })

    const users = new user({
        username:req.body.username,
        password:req.body.password
    })

    req.logIn(users,(err)=>{
        if(err){
            console.log(err);
            
        }
        else {
            passport.authenticate("local")(req,res,()=>{
                // const users = localStorage.getItem("data",user)
                // console.log(users,"users");
                
                res.redirect("/admin")

            })
        }
    })

   
})

app.get("/logout",(req,res)=>{
    req.logOut((err)=>{
        if(err){
            console.log(err);
            
        }
        res.redirect("/")
    })
})

app.get("/",(req,res)=>{
    res.render("index")
})
app.get("/admin",(req,res)=>{
    res.render("admin")
})

app.get("/addpatient",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("addpatient")
    }
    else{
        res.redirect("/")
    }
})

app.get("/update/:id",(req,res)=>{
    if (req.isAuthenticated()) {
        patients.findOne({ patient_id:req.params.id }).then((data) => {
            res.render("update", { data })
        }).catch((err) => {
            console.log(err);

        })
    }
})

app.get("/dashboard",(req,res)=>{
    
    if(req.isAuthenticated()){
        patients.find({}).then((data)=>{
            if(data){
                res.render("dashboard",{data})
            }
            else{
                res.render("dashboard","no data")
            }
        }).catch((err)=>{
            console.log(err);
            
        })
    }else{
        res.redirect("/")
    }
})

app.get("/delete/:id",(req,res)=>{
    if(req.isAuthenticated()){
        
        patients.deleteOne({patient_id:req.params.id}).then((data)=>{
            res.redirect("/dashboard")
        }).catch((err)=>{
            console.log(err);
            
        })
    }else{
        res.redirect("/")
    }
})

app.post("/addpatient",(req,res)=>{
    const newpatient = new patients(req.body)
    
    newpatient.save().then(()=>{
            res.render("addpatient")
    }).catch((err)=>{
        console.log(err);
        
    })

    // newpatient.save(()=>{
    //     res.render("addpatient")
    // })
})

app.put("/update/:id",(req,res)=>{

    patients.updateOne({patient_id:req.params.id},{
        $set:{
            patient_id:req.body.patient_id,
            patient_name:req.body.patient_name,
            patient_age:req.body.patient_age,
            patient_address:req.body.patient_address,
            patient_moblie:req.body.patient_moblie,
            patient_disease:req.body.patient_disease
        }
    }).then((data)=>{
        res.redirect("/dashboard")
    }).catch((err)=>{
        console.log(err); 
    })
})
app.listen(port,()=>{
    console.log(`server is up and running on port ${port}`);
    
} )