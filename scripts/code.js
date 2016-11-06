/**
 * Created by josh on 10/21/16.
 */


var $ = utils.lookup;
var pubnub = new PubNub({
    publishKey: 'pub-c-f0f65c4a-c2a6-478d-988f-760c3c6274c8',
    subscribeKey: 'sub-c-0b51cb4e-a24a-11e6-8741-02ee2ddab7fe',
    uuid:PubNub.generateUUID(),
});



var config = utils.params({mode:'editor', index:0});
config.channels = {
    slides:'presso-slides',
    questions:'presso-questions'
};
console.log("config = ",config);
var cur = config.index;
if(config.hash && !isNaN(Number.parseInt(config.hash))) {
    cur = Number.parseInt(config.hash);
}
console.log("final cur = ", cur);


//turn on speaker mode
if(config.mode === 'speaker') {
    document.body.classList.add("speaker-display");
}
pubnub.subscribe({channels:[config.channels.slides, config.channels.questions]});

window.addEventListener('popstate',function(e){
    if(e.state && e.state.index) navToSlide(e.state.index);
});

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
    history.pushState({index:cur},null,'#'+cur);
}

function navLeft() {
    var sections = $("section")
    cur = Math.max(0,cur-1);
    resetStyles(sections);
    history.pushState({index:cur},null,'#'+cur);
}

function toggleSpeakerNotes() {
    document.getElementsByTagName('body')[0].classList.toggle('display-speaker-notes');
}

var bindings = {}
function keybind(key, cb) {
    if(key == 's') bindings[83] = cb;
    if(key == 'q') bindings[81] = cb;
    if(key == 'right') bindings[39] = cb;
    if(key == 'left') bindings[37] = cb;
}
keybind('s',toggleSpeakerNotes);
keybind('q',toggleQuestions);
keybind('right', function() {
    navRight();
    pubnub.publish({channel:config.channels.slides, message:{ dir:'right', index:cur, uuid:pubnub.getUUID()}});
});
keybind('left', function() {
    navLeft();
    pubnub.publish({channel:config.channels.slides, message:{ dir:'left', index:cur, uuid:pubnub.getUUID()}});
});

document.addEventListener('keydown',function(e) {
    //skip events that didn't come from the body, so we don't mess with textareas and inputs
    if(e.target.tagName.toLowerCase() !== 'body') return;
    if(bindings[e.keyCode]) bindings[e.keyCode]();
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



