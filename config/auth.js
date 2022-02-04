const localStrategy = require("passport-local");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//Model de Usuário
require("../models/Usuario");
const Usuario = mongoose.model("usuarios")