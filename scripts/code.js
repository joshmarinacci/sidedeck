/**
 * Created by josh on 10/21/16.
 */



var pubnub = new PubNub({
    publishKey: 'pub-c-f0f65c4a-c2a6-478d-988f-760c3c6274c8',
    subscribeKey: 'sub-c-0b51cb4e-a24a-11e6-8741-02ee2ddab7fe',
    uuid:PubNub.generateUUID(),
});


function params(defs) {
    var query = document.location.search;
    if(query && query[0] === '?') {
        query.substring(1).split('&').map((part)=>{
            var parts = part.split('=');
            defs[parts[0]] = parts[1];
        });
    }
    return defs;
}

var config = params({mode:'speaker'});
config.channels = {
    slides:'presso-slides',
    questions:'presso-questions'
};
console.log("config = ",config);
pubnub.subscribe({channels:[config.channels.slides, config.channels.questions]});


function hlistToArray(hlst) {
    var arr = [];
    for(var i=0; i<hlst.length; i++) {
        arr[i] = hlst[i];
    }
    return arr;
}
function getSections() {
    return hlistToArray(document.getElementsByTagName('section'));
}
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
    var sections = getSections();
    cur = Math.min(cur+1,sections.length);
    resetStyles(sections);
}

function navLeft() {
    var sections = getSections();
    cur = Math.max(0,cur-1);
    resetStyles(sections);
}

function toggleSpeakerNotes() {
    document.getElementsByTagName('body')[0].classList.toggle('display-speaker-notes');
}

document.addEventListener('keydown',function(e) {
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
    resetStyles(getSections());
}

setTimeout(()=> resetStyles(getSections()),100);

function $(text) {
    return document.getElementById(text);
}
function scrollToBottom(wrapper) {
    wrapper.scrollTop = wrapper.scrollHeight;
}
function appendQuestion(text) {
    var txt = document.createElement("div");
    txt.innerHTML = "<b>Q</b> " + text;
    $("questions-view").appendChild(txt);
    scrollToBottom($('questions-view-wrapper'));
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
            text: $("question-field").value,
            uuid: pubnub.getUUID()
        }
    });
    $("question-field").value = '';
}

function onEnter(cb) {
    return function(e) {
        if(e.keyCode == 13) cb();
    }
}

function toggleQuestions() {
    $('questions-panel').classList.toggle('visible');
}

function setupChat() {
    $("question-button").addEventListener('click',sendQuestion);
    $('question-field').addEventListener('keypress',onEnter(sendQuestion));
    $("questions-show").addEventListener('click',toggleQuestions);
}
setupChat();


