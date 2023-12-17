require('dotenv').config()
const providers = require('./providers')
const chat = require('./chat')
const media = require('./media')
const file = require('./utils/file')

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())

app.get('/', function(req, res){
    res.sendStatus(200)
})

app.get('/webhook', function(req, res) {
  if (
    req.query['hub.mode'] == 'subscribe' &&
    req.query['hub.verify_token'] == process.env.FB_VERIFICATION_TOKEN
  ) {
    res.send(req.query['hub.challenge']);
    console.log("Facebook verificou a URL");
  } else {
    res.sendStatus(400);
  }
});

app.post("/webhook", async function (request, response) {
  console.log('Incoming webhook: ' + JSON.stringify(request.body));
  if (
	request.body.entry &&
	request.body.entry[0].changes &&
	request.body.entry[0].changes[0] &&
	request.body.entry[0].changes[0].value.messages &&
	request.body.entry[0].changes[0].value.messages[0]
) {
    let messageType = request.body.entry[0].changes[0].value.messages[0].type;
    let messageFrom = request.body.entry[0].changes[0].value.messages[0].from;
    let messageTimeStamp = request.body.entry[0].changes[0].value.messages[0].timestamp;
    let ourNumberId = request.body.entry[0].changes[0].value.metadata.phone_number_id;
    let status = request.body.entry[0].changes[0].statuses;
    let msgText;
    if(!status){
      if(messageType == "text"){
        let messageContent = request.body.entry[0].changes[0].value.messages[0].text.body;
        console.log(messageContent);
        msgText = await chat.chatGptService.categorize(messageTimeStamp, messageContent)
        chat.text.send(ourNumberId, messageFrom, msgText);
      } else if(messageType == "audio"){
        let mediaId = request.body.entry[0].changes[0].value.messages[0].audio.id;
        let messageContent = await media.mediaService.getFileAndTranscribe(mediaId)
        console.log("MessageContent: ", messageContent)
        msgText = await chat.chatGptService.categorize(messageTimeStamp, messageContent);
        console.log("MessageText: ", msgText)
        let provisorio = "audio recebido"
        chat.text.send(ourNumberId, messageFrom, provisorio);
        chat.text.send(ourNumberId, messageFrom, mediaId);
      } else {
        console.log("API inconsistente")
        msgText = "Ainda estou aprendendo a responder esse tipo de mensagem."
        chat.text.send(ourNumberId, messageFrom, msgText);
      }
    }
    response.sendStatus(200);
} else {
	response.sendStatus(400);
}
});

app.get('/transcreva/:id', async function(req, res) {
  try{
    let mediaId = req.params.id 
    result = await media.mediaService.getFileAndTranscribe(mediaId)
    res.send(result)
  } catch (e){
    res.sendStatus(500)
  }
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});