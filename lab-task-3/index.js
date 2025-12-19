const express = require("express");
const path = require("path");
const expressLayouts = require('express-ejs-layouts');

const app = express();
app.set("view engine","ejs")
app.use(expressLayouts);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json())

app.get('/',(req,res)=>{
    res.render('index')
})

const PORT = 5005;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));