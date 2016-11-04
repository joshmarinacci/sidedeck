/**
 * Created by josh on 11/4/16.
 */


var utils = {
    onEnter: function (cb) {
        return function (e) {
            if (e.keyCode == 13) cb();
        }
    },
    scrollToBottom: function (wrapper) {
        wrapper.scrollTop = wrapper.scrollHeight;
    },
    nodeListToArray:function(list) {
        var arr = [];
        for(var i=0; i<list.length; i++) {
            arr[i] = list[i];
        }
        return arr;
    },
    params:function(defs) {
        var query = document.location.search;
        if(query && query[0] === '?') {
            query.substring(1).split('&').map((part)=>{
                var parts = part.split('=');
                defs[parts[0]] = parts[1];
            });
        }
        return defs;
    },
    lookup : function(name) {
        if(name[0] === '#') return document.getElementById(name.substring(1));
        if(name[0] === '.') return utils.nodeListToArray(document.getElementsByClassName(name.substring(1)));
        return utils.nodeListToArray(document.getElementsByTagName(name));
    }

};
