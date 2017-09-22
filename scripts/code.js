/**
 * Created by josh on 10/21/16.
 */


var $ = utils.lookup;
var pubnub = new PubNub({
    publishKey: 'pub-c-f0f65c4a-c2a6-478d-988f-760c3c6274c8',
    subscribeKey: 'sub-c-0b51cb4e-a24a-11e6-8741-02ee2ddab7fe',
    uuid:PubNub.generateUUID(),
});



var config = utils.params({mode:'view', index:0});
config.channels = {
    slides:'es6-slides',
    questions:'es6-questions'
};
console.log("config = ",config);
var cur = config.index;
if(config.hash && !isNaN(Number.parseInt(config.hash))) {
    cur = Number.parseInt(config.hash);
}
console.log("final cur = ", cur);


var slides = {
    funcs: {},
    findSelected : function(sections) {
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
    },
    resetStyles: function(sections) {
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
                speakerView.updateSpeakerView(sec);
            }
            if (i == cur + 1) {
                sec.classList.add('next');
            }
            if (i > cur + 1) {
                sec.classList.add('after');
            }
        }
    },
    navStart: function() {
        var sections = $("section");
        this.performSlideFunctions(cur,"end");
        cur = 0;//Math.max(0,cur-1);
        this.performSlideFunctions(cur,"start");
        slides.resetStyles(sections);
        history.pushState({index:cur},null,'#'+cur);
    },
    navLeft:function() {
        var sections = $("section");
        this.performSlideFunctions(cur,"end");
        cur = Math.max(0,cur-1);
        this.performSlideFunctions(cur,"start");
        slides.resetStyles(sections);
        history.pushState({index:cur},null,'#'+cur);
    },
    navRight: function() {
        var sections = $("section");
        this.performSlideFunctions(cur,"end");
        cur = Math.min(cur+1,sections.length-1);
        this.performSlideFunctions(cur,"start");
        slides.resetStyles(sections);
        history.pushState({index:cur},null,'#'+cur);
    },
    navEnd: function() {
        var sections = $("section");
        this.performSlideFunctions(cur,"end");
        cur = sections.length -1;
        this.performSlideFunctions(cur,"start");
        slides.resetStyles(sections);
        history.pushState({index:cur},null,'#'+cur);
    },
    navToSlide:function(n){
        this.performSlideFunctions(cur,"end");
        cur = n;
        this.performSlideFunctions(cur,"start");
        slides.resetStyles($("section"));
    },
    performSlideFunctions(cur,suffix) {
        var slide = $("section")[cur];
        if(slide.id) {
            var funcs = this.funcs[slide.id];
            if(funcs && funcs[suffix]) {
                funcs[suffix]();
            }
        }
    },
    addSlideListener(id, funcs) {
        var elem = document.getElementById(id);
        if(!elem) {
            console.log("could not find the slide with the id ",id);
            return;
        }
        this.funcs[id] = funcs;
    }

};

var speakerView = {
    updateSpeakerView: function (section) {
        var asides = section.getElementsByTagName('aside');
        var div = $("#speaker-notes");
        while (div.firstChild) div.removeChild(div.firstChild)
        if (asides.length > 0) {
            var clone = asides[0].cloneNode(true);
            $("#speaker-notes").appendChild(clone);
        }
    },

    toggleSpeakerNotes:function() {
        document.getElementsByTagName('body')[0].classList.toggle('display-speaker-notes');
    },
    turnOn() {
        document.body.classList.add("speaker-display");
    }
};

pubnub.subscribe({channels:[config.channels.slides, config.channels.questions]});

window.addEventListener('popstate',function(e){
    if(e.state && e.state.index) navToSlide(e.state.index);
});

var keybinder = {
    bindings: {},
    keybind:function(key, cb) {
        if(key == 's')      this.bindings[83] = cb;
        if(key == 'q')      this.bindings[81] = cb;
        if(key == 'right')  this.bindings[39] = cb;
        if(key == 'left')   this.bindings[37] = cb;
    },
    setup:function() {
        document.addEventListener('keydown',(e) => {
            //skip events that didn't come from the body, so we don't mess with textareas and inputs
            if(e.target.tagName.toLowerCase() !== 'body') return;
            if(this.bindings[e.keyCode]) this.bindings[e.keyCode]();
        });
    }
};

function sendEvent(payload) {
    if(config.mode === 'edit' || config.mode === 'speaker') {
        console.log("publishing");
        pubnub.publish({channel: config.channels.slides, message: payload});
    }
}
keybinder.keybind('right', function() {
    slides.navRight();
    sendEvent({ dir:'right', index:cur, uuid:pubnub.getUUID()});
});
keybinder.keybind('left', function() {
    slides.navLeft();
    sendEvent({ dir:'left', index:cur, uuid:pubnub.getUUID()});
});

var questions = {
    appendQuestion:function(text) {
        var txt = document.createElement("div");
        txt.innerHTML = "<b>Q</b> " + text;
        $("#questions-view").appendChild(txt);
        utils.scrollToBottom($('#questions-view-wrapper'));
    },
    sendQuestion:function() {
        pubnub.publish({
            channel: config.channels.questions,
            message: {
                text: $("#question-field").value,
                uuid: pubnub.getUUID()
            }
        });
        $("#question-field").value = '';
    },
    toggleQuestions:function() {
        $('#questions-panel').classList.toggle('visible');
        utils.defer(()=>$('#question-field').focus());
    },
    setupChat:function() {
        $("#question-button").addEventListener('click',questions.sendQuestion);
        $('#question-field').addEventListener('keypress',utils.onEnter(questions.sendQuestion));
        $("#questions-show").addEventListener('click',questions.toggleQuestions);
    }
}


pubnub.addListener({
    message: (m) => {
        if(m.subscribedChannel == config.channels.slides) {
            if (pubnub.getUUID() !== m.message.uuid) {
                if (m.message.dir === 'left')  slides.navToSlide(m.message.index);
                if (m.message.dir === 'right') slides.navToSlide(m.message.index);
            }
        }
        if(m.subscribedChannel == config.channels.questions) {
            questions.appendQuestion(m.message.text);
        }
    }
});


utils.defer(function() {
    keybinder.keybind('s',speakerView.toggleSpeakerNotes);
    keybinder.keybind('q',questions.toggleQuestions);
    keybinder.setup();
    questions.setupChat();
    slides.performSlideFunctions(cur,"start");
    slides.resetStyles($('section'));
    //turn on speaker mode
    if(config.mode === 'speaker') {
        speakerView.turnOn();
    }
    $("#to-start").addEventListener("click",function(){
        slides.navStart();
    });
    $("#to-left").addEventListener("click",function(){
        slides.navLeft();
    });
    $("#to-right").addEventListener("click",function(){
        slides.navRight();
    });
    $("#to-end").addEventListener("click",function(){
        slides.navEnd();
    });
});
