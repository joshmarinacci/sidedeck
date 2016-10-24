/**
 * Created by josh on 10/21/16.
 */

console.log("in the app");

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
    if(e.code == 'ArrowRight') navRight();
    if(e.code == 'ArrowLeft')  navLeft();
    if(e.key == 's') toggleSpeakerNotes();
});


setTimeout(()=>{
    resetStyles(getSections());
},100);