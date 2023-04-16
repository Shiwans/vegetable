const Menu = require('../../models/menu')

function homeController(){
    return {
        async index(req,res){
            const vegetables = await Menu.find()
            return res.render('home',{vegetables : vegetables})
        }
    }
}

module.exports = homeController