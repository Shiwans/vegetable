const User = require('../../models/user')
const bcrypt = require('bcrypt')
const passport = require('passport')

function authController(){
    const _getRedirectUrl = (req) =>{
        return req.user.role === 'admin'?'/admin/orders':'customer/orders'
    }
    return {
        login(req,res){
            res.render('auth/login')
        },
        postLogin(req,res,next){
            const { email,password  } = req.body
            if(!email||!password){
                req.flash('error','All fields are required')
                return res.redirect('/login')
            }
            passport.authenticate('local',(err,user,info)=>{
                if(err){
                    req.flash('error',info.message)
                    return next(err)
                }
                if(!user){
                    req.flash('error',info.message)
                    return res.redirect('/login')
                }
                req.logIn(user,(err)=>{
                    if(err){
                        req.flash('error',info.message)
                        return next(err)
                    }
                    
                    return res.redirect(_getRedirectUrl(req))
                })
            })(req,res,next)
        },
        register(req,res){
            res.render('auth/register')
        },
        async postRegister(req,res){
            const { name,email,password  } = req.body
            if(!name||!email||!password){
                req.flash('error','All fields are required')
                req.flash('name',name)
                req.flash('email',email)
                return res.redirect('/register')
            }

            //check if email exists
            const checkEmail = await User.findOne({ email });
            if (checkEmail) {
                req.flash('error', 'Email already taken');
                return res.redirect('/register');
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);

                // create user
                const user = new User({
                    name,
                    email,
                    password: hashedPassword,
                });
                user.save().then((user)=>{
                    // return res.redirect('/login')
                    return res.redirect('/login')
                }).catch(err =>{
                    req.flash('error','something went wrong')
                        return res.redirect('/register')
                })
            }
        },
        // logout(req,res){
        //     req.logout()
        //     return res.redirect('/login')
        // }
        logout(req, res) {
            req.logout(function(err) {
                if (err) {
                    console.log(err);
                }
                res.redirect('/login');
            });
        }
    }
}

module.exports = authController