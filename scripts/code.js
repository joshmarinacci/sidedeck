/**
 * Created by josh on 10/21/16.
 */


var $ = utils.lookup;
var pubnub = new PubNub({
    publishKey: 'pub-c-f0f65c4a-c2a6-478d-988f-760c3c6274c8',
    subscribeKey: 'sub-c-0b51cb4e-a24a-11e6-8741-02ee2ddab7fe',
    uuid:PubNub.generateUUID(),
});



var config = utils.params({mode:'editor'});
config.channels = {
    slides:'presso-slides',
    questions:'presso-questions'
};
console.log("config = ",config);

//turn on speaker mode
if(config.mode === 'speaker') {
    document.body.classList.add("speaker-display");
}
pubnub.subscribe({channels:[config.channels.slides, config.channels.questions]});


function findSelected(sections) {
    var found = null;
    sections.forEach((s,i) => {
        if(s.classList.contains("selected")) {
            found = { index: i, element: s};
        }
    });
    if(!found) {
        found = {
            index:0,
            element:sections[0]
        }
    }
    return found;
}

var cur = 0;
function resetStyles(sections) {
    for (var i = 0; i < sections.length; i++) {
        var sec = sections[i];
        sec.classList.remove('before');
        sec.classList.remove('prev');
        sec.classList.remove('active');
        sec.classList.remove('next');
        sec.classList.remove('after');
        if (i < cur - 1) {
            sec.classList.add('before');
        }
        if (i == cur - 1) {
            sec.classList.add('prev');
        }
        if (i == cur) {
            sec.classList.add('active');
            updateSpeakerView(sec);
        }
        if (i == cur + 1) {
            sec.classList.add('next');
        }
        if (i > cur + 1) {
            sec.classList.add('after');
        }
    }
}
function navRight() {
    var sections = $("section");
    cur = Math.min(cur+1,sections.length);
    resetStyles(sections);
}

function navLeft() {
    var sections = $("section")
    cur = Math.max(0,cur-1);
    resetStyles(sections);
}

function toggleSpeakerNotes() {
    document.getElementsByTagName('body')[0].classList.toggle('display-speaker-notes');
}

document.addEventListener('keydown',function(e) {
    var tag = e.target.tagName.toLowerCase();
    if(tag !== 'body') return;

    if(e.code == 'ArrowRight') {
        navRight();
        pubnub.publish({channel:config.channels.slides, message:{ dir:'right', index:cur, uuid:pubnub.getUUID()}});
    }
    if(e.code == 'ArrowLeft')  {
        navLeft();
        pubnub.publish({channel:config.channels.slides, message:{ dir:'left', index:cur, uuid:pubnub.getUUID()}});
    }
    if(e.key == 's') toggleSpeakerNotes();
    if(e.key == 'q') toggleQuestions();
});

function navToSlide(n){
    cur = n;
    resetStyles($("section"));
}

setTimeout(()=> resetStyles($("section")),100);

function appendQuestion(text) {
    var txt = document.createElement("div");
    txt.innerHTML = "<b>Q</b> " + text;
    $("#questions-view").appendChild(txt);
    utils.scrollToBottom($('#questions-view-wrapper'));
}

pubnub.addListener({
    message: (m) => {
        if(m.subscribedChannel == config.channels.slides) {
            if (pubnub.getUUID() !== m.message.uuid) {
                if (m.message.dir === 'left')  navToSlide(m.message.index);
                if (m.message.dir === 'right') navToSlide(m.message.index);
            }
        }
        if(m.subscribedChannel == config.channels.questions) {
            appendQuestion(m.message.text);
        }
    }
});


function sendQuestion() {
    pubnub.publish({
        channel: config.channels.questions,
        message: {
            text: $("#question-field").value,
            uuid: pubnub.getUUID()
        }
    });
    $("#question-field").value = '';
}


function toggleQuestions() {
    $('#questions-panel').classList.toggle('visible');
    setTimeout(()=>$('#question-field').focus(),100);
}

function setupChat() {
    $("#question-button").addEventListener('click',sendQuestion);
    $('#question-field').addEventListener('keypress',utils.onEnter(sendQuestion));
    $("#questions-show").addEventListener('click',toggleQuestions);
}
setupChat();

function updateSpeakerView(section) {
    var asides = section.getElementsByTagName('aside');
    var div = $("#speaker-notes");
    while(div.firstChild) div.removeChild(div.firstChild)
    if(asides.length > 0) {
        var clone = asides[0].cloneNode(true);
        $("#speaker-notes").appendChild(clone);
    }
}



