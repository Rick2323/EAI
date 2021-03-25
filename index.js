var express = require("express");
var app = express();

app.use(express.static(__dirname));
app.set('view engine', 'ejs')

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use('/api', require('./router/api'));

var server = app.listen(8081, function () {
    var host = server.address().address === "::" ? "localhost" :
        server.address().address;
    var port = server.address().port;
    console.log("Example app listening at http://%s:%s/api/corpus", host, port);
});
