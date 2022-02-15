const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Categoria = require("../models/Categoria");
const Postagem = require("../models/Postagem");
require('../models/Usuario');
const Usuario = mongoose.model("usuarios");
const bcrypt = require("bcryptjs");
const passport = require('passport');

router.get("/usuario/login", (req,res)=>{
    res.render("index")
})

router.get("/usuario/entrei", (req,res) => {
    res.render("entrei")
})

router.post("/usuario/login", (req,res, next)=>{
    passport.authenticate("local", {
        successRedirect: "/usuario/entrei",
        failureRedirect: "/usuario/registro",
        failureFlash: true
    })(req,res,next)
})

router.get("/usuario/registro", (req,res)=>{
    res.render("usuarios/registro")
})

router.post("/usuario/registro", (req,res)=>{
    const erros = [];
    const nome = String(req.body.nome);
    const email = String(req.body.email);
    const senha = String(req.body.senha);
    const senha2 = String(req.body.senha2);
    console.log(nome, email, senha, senha2)
    if(!nome || typeof nome == undefined || nome == null){
        erros.push({texto: "Nome inválido"});
    }
    if(!email || typeof email == undefined || email == null){
        erros.push({texto: "Email inválido"});
    }
    if(!senha || typeof senha == undefined || senha == null){
        erros.push({texto: "Senha inválida"})
    }
    if(senha !== senha2){
        erros.push({texto: "As senhas são diferentes!"});
    }
    if(erros.length!==0){
        res.render("usuarios/registro", {erros: erros})
        console.log(erros)
    }
    else{
        Usuario.findOne({email: req.body.email}).then((usuario)=>{
            if(usuario){
                req.flash("error_msg", "Já existe uma conta com esse email.")
                res.redirect("/usuario/registro");
            }else{
                const novoUsuario = new Usuario({
                    nome: nome,
                    email: email,
                    senha: senha
        
                })
                
                bcrypt.genSalt(10, (erro,salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro,hash)=>{
                        if(erro){
                            req.flash("error_msg","Houve um erro ao salvar o usuário.")
                            res.redirect("/usuario/registro");
                        }
                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            req.flash("success_msg","Você foi cadastrado com sucesso!")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg","Não foi possível registrar, tente novamente.")
                            console.log("Erro" + err)
                            res.redirect("/usuario/registro")
                        })    

                    })
                })

                
            }
        })

        
    }
})

module.exports = router