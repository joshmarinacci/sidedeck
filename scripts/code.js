/**
 * Created by josh on 10/21/16.
 */



var pubnub = new PubNub({
    publishKey: 'demo',
    subscribeKey: 'demo',
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
    slides:'presso-slides'
};
console.log("config = ",config);
pubnub.subscribe({channels:[config.channels.slides]});


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
});

function navToSlide(n){
    cur = n;
    resetStyles(getSections());
}

setTimeout(()=> resetStyles(getSections()),100);

pubnub.addListener({
    message: (m) => {
        //console.log("message", m.subscribedChannel, m.message, m.message.uuid);
        if(pubnub.getUUID() !== m.message.uuid) {
            if(m.message.dir === 'left') {
                navToSlide(m.message.index);
                //navLeft();
            }
            if(m.message.dir === 'right') {
                navToSlide(m.message.index);
                //navRight();
            }
        }
    }
});
