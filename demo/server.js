var fs = require('fs');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();

const PORT=8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var sampleData = [
  { console: 'Nintendo', title: 'Super Mario Bros' },
  { console: 'Master System', title: 'Alex Kidd' },
  { console: 'Mega Drive', title: 'Sonic the Hedgehog' },
  { console: 'SNES', title: 'Super Mario World' },
  { console: 'Playstation', title: 'Resident Evil' },
  { console: 'PC', title: 'Doom' },
  { console: 'Atari', title: 'Enduro' },
  { console: 'N64', title: 'Mario Party' },
  { console: 'Playstation 2', title: 'GTA San Andreas' },
  { console: 'GameCube', title: 'Metroid' },
  { console: 'Playstation 3', title: 'Uncharted' },
  { console: 'Playstation 4', title: 'The Last of Us Remastered' },
  { console: 'Nintendo', title: 'Mega Man' },
  { console: 'Mega Drive', title: 'Road Rash' },
  { console: 'PC', title: 'Duke Nukem 3D' },
  { console: 'SNES', title: 'Street Fighter II' },
  { console: 'Playstation 3', title: 'Red Dead Redemption' }
];

app.use(express.static('src'));

app.get('/', function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  var index = fs.readFileSync('demo/index.html');
  res.end(index);
});

app.get('/datasource', function(req, res) {

  var results = sampleData.filter(function(item) {
    return item.console.toLowerCase().indexOf(req.query.title.toLowerCase()) !== -1
      || item.title.toLowerCase().indexOf(req.query.title.toLowerCase()) !== -1
  });
  res.json({
    data: results.slice(parseInt(req.query.start), parseInt(req.query.start) + parseInt(req.query.length)),
    recordsTotal: results.length
  });
});

app.listen(PORT, function () {
  console.log("Server listening on: http://localhost:%s", PORT);
});
