const express = require('express');
const router= express.Router();
const Categoria = require("../models/Categoria")

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
    res.render("admin/postagens")
})

router.get("/postagens/add", (req,res) => {
    res.render("admin/addpostagem")
})
module.exports = router