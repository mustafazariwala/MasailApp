const express = require("express");
// const compression = require('compression')
const bodyParser = require("body-parser");
const path = require('path')
const driveRoutes = require('./routes/drive')


const app = express();
// app.use(cors())
// app.use(compression())


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
// app.use("/", express.static(path.join(__dirname, "angular")))



app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "*"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "*"
  );
  next();
});

// app.use((req,res,next)=> {
//   res.sendFile(path.join(__dirname ,"angular", "index.html"))
// })

app.use('/api/drive', driveRoutes)



module.exports = app;
