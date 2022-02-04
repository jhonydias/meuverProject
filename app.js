//Carregando modulos
    const express = require('express');
    const handlebars = require('express-handlebars');
    const mongoose = require('mongoose');
    const bodyParser = require('body-parser');
    const app = express();
    const admin = require('./routes/admin')
    const usuarios = require('./routes/usuario')
    const path = require("path");
    const { Mongoose } = require('mongoose');
    const session = require("express-session");
    const flash = require("connect-flash")
    require("./models/Postagem");
    const Postagem = mongoose.model("postagens");
    require("./models/Categoria");
    const Categoria = mongoose.model("categorias");
    require("./models/Usuario")
    const Usuario = mongoose.model("usuarios")
//Configurações 
    //Session
    app.use(session({
        secret: "cursodenode",
        resave: true,
        saveUninitialized: true
    }))
    app.use(flash());
    //Middleware: usando o res.locals.nomedavariavel criamos uma variável global
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg");
        res.locals.error_msg = req.flash("error_msg");
        next();
    })    
    //Body Parser
        app.use(bodyParser.urlencoded({extended: false}))
        app.use(bodyParser.json())
    
    //Handlebars
        app.engine('handlebars', handlebars.engine({
            defaultLayout: 'main'
        }))
        app.set("view engine", "handlebars")
        app.set('views', './views');
    //Mongose
        mongoose.connect("mongodb://localhost/meuverapp").then(() => {
            console.log("Conectado ao mongo com sucesso!")
        }).catch((err) => {
            console.log('Erro ao se conectar ao mongo:'+err)
        })
    //Public
        app.use(express.static(path.join(__dirname,"public")))
    
//Rotas
    app.use('/', usuarios)
    app.use('/admin', admin)
    app.use('/usuarios', usuarios)
//Outros
const PORT = 8081
app.listen(PORT,() => {
    console.log("Servidor rodadando: localhost:8081")
});
app.use(express.static('public'));