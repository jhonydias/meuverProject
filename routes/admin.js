const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Categoria = require("../models/Categoria");
const Postagem = require("../models/Postagem");

router.get('/', (req,res) => {
    res.render("admin/index")
})

router.get('/cursos', (req,res) => {
    res.render("admin/cursos")
})

router.get('/posts', (req,res) => {
    res.send("Página de posts meuver")
})

router.get('/categorias', (req,res)=> {
    Categoria.find().lean().sort({date:"desc"}).then((categorias) => {
        res.render("admin/categorias", {categorias:categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias" + err)
        res.redirect("/admin")
    })

})

router.get('/categorias/add', (req,res)=> {
    res.render("admin/addcategorias")
})

//Mandando categorias pro banco de dados mongodb
router.post('/categorias/nova', (req,res) => {
    //Tratamento de formulário
        const erros = [];
        const nome = String(req.body.nome);
        const slug = String(req.body.slug);
        const date = Date.now();


        if(!nome || typeof nome == undefined || nome == null) {
            erros.push({texto: "Nome inválido"});
        }
        if(!slug || typeof slug == undefined || slug == null) {
            erros.push({texto: "slug inválido"});
        }
        if(nome.length <= 2){
            erros.push({texto: "O nome deve ter mais de 2 caracteres"});
            console.log(nome.length);
        }
        if(erros.length!==0){
            res.render("admin/addcategorias", {erros: erros})
        }else{
            const novaCategoria = {
                nome: nome,
                slug: slug,
                date: date

            }        
            new Categoria(novaCategoria).save().then(() => {
                req.flash("success_msg","Categoria salva com sucesso")
                console.log("Categoria Salva com sucesso!")
                res.redirect("/admin/categorias")
            }).catch((err) => {
                req.flash("error_msg","Não foi possível registrar a categoria.")
                console.log("Erro ao cadastrar categoria" + err)
                res.redirect("/admin")
            });    
        }
})

//Rota de visualização para edição dos dados cadastrados
    //Rota de input dos novos dados e da vizualização dos dados cadastrados 
    router.get("/categorias/edit/:id", (req,res) => {
        Categoria.findOne({_id:req.params.id}).lean().then((categoria) => {
            res.render("admin/editcategoria", {categoria:categoria})
        }).catch((err) => {
            req.flash("error_msg", "Categoria inexistente" + err)
            res.redirect("/admin/categorias")
        })
        
    })
    //Rota de post dos dados editados no banco de dados
    router.post("/categorias/edit", (req,res) => {
        Categoria.findOne({_id:req.body.id}).then((categoria) => {
            //Tratamento de formulário
            const erros = [];
            categoria.nome = String(req.body.nome);
            categoria.slug = String(req.body.slug);
            categoria.date = Date.now();


            if(!categoria.nome || typeof categoria.nome == undefined || categoria.nome == null) {
                erros.push({texto: "Nome inválido"});
            }
            if(!categoria.slug || typeof categoria.slug == undefined || categoria.slug == null) {
                erros.push({texto: "slug inválido"});
            }
            if(categoria.nome.length <= 2){
                erros.push({texto: "O nome deve ter mais de 2 caracteres"});
                console.log(categoria.nome.length);
            }
            if(erros.length!==0){
                res.render("admin/categorias", {erros: erros})
            }else{
                categoria.save().then(() => {
                    req.flash("success_msg","Categoria salva com sucesso")
                    console.log("Categoria editada com sucesso!")
                    res.redirect("/admin/categorias")
                }).catch((err) => {
                    req.flash("error_msg","Não foi possível editar a categoria.")
                    console.log("Erro ao editar a categoria" + err)
                    res.redirect("/admin/categorias")
                });    
            }
        })
    })
    //Rota de delete
    router.post("/categorias/deletar", (req,res) => {
        Categoria.findOneAndRemove({_id: req.body.id}).then(() => {
            req.flash("success_msg", "Categoria deletada com sucesso!")
            res.redirect("/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao deletar essa categoria.")
            res.redirect("/categorias")
        })
    })

router.get("/postagens", (req,res) => {
    Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens)=>{
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao carregar as postagens");
        console.log(err);
        res.redirect("/admin")
    })

})

router.get("/postagens/add", (req,res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagem", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_message","Houve um erro ao carregar as categorias do formulário.")
        res.redirect("/admin")
    })
})

router.post("/postagens/new", (req,res)=>{
    const erros = [];
    //Criar validação para titulo, descrição, conteudo e slug
    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria inválida, registre uma categoria"})
    }

    if(erros.length>0){
        res.render("admin/addpostagem", {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            slug: req.body.slug,
            categoria: req.body.categoria
        }
        new Postagem(novaPostagem).save().then(()=>{
            req.flash("succees_msg", "Postagem criada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao criar a postagem:"+err)
            res.redirect("/admin/postagens")
        })
    }
})

router.get("/postagens/edit/:id", (req,res) => {
    Postagem.findOne({_id:req.params.id}).lean().then((postagem) => {

        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagem", {categorias:categorias, postagem:postagem})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao carregar as categorias")
            res.redirect("/admin/postagens")
        })

    }).catch((err) => {
        req.flash("error_msg", "Post inexistente" + err)
        res.redirect("/admin/postagens")
    })
    
})

router.post("/postagens/edit", (req,res) => {
    Postagem.findOne({_id:req.body.id}).then((postagem) => {
        //Tratamento de formulário
        const erros = [];
        postagem.titulo = String(req.body.titulo);
        postagem.slug = String(req.body.slug);
        postagem.date = Date.now();


        if(!postagem.titulo || typeof postagem.titulo == undefined || postagem.titulo == null) {
            erros.push({texto: "titulo inválido"});
        }
        if(!postagem.slug || typeof postagem.slug == undefined || postagem.slug == null) {
            erros.push({texto: "slug inválido"});
        }
        if(postagem.titulo.length <= 2){
            erros.push({texto: "O titulo deve ter mais de 2 caracteres"});
            console.log(postagem.titulo.length);
        }
        if(erros.length!==0){
            res.render("admin/postagens", {erros: erros})
        }else{
            postagem.save().then(() => {
                req.flash("success_msg","postagem salva com sucesso")
                console.log("postagem editada com sucesso!")
                res.redirect("/admin/postagens")
            }).catch((err) => {
                req.flash("error_msg","Não foi possível editar a postagem.")
                console.log("Erro ao editar a postagem" + err)
                res.redirect("/admin/postagens")
            });    
        }
    })
})

router.post("/postagens/deletar", (req,res) => {
    Postagem.findOneAndRemove({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/postagens")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar essa postagem.")
        res.redirect("/postagens")
    })
})
module.exports = router