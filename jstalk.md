In my day job I'm the head of developer evangelism at PubNub. We use
Javascript heavily in our new product [BLOCKS](https://www.pubnub.com/products/blocks/), which enables developers
to run massively distributed Javascript code on the edge with very
low latency.  Needless to say, we care a lot about Javascript performance
and features, which is why ES6 is so exciting to us.

The changes in ES6 have been massive, exciting, and confusing. In this
essay I'll introduce five features of the new JavaScript that 
you can use right away to supercharge your code, and what features 
to hold off on. 


JavaScript has had many versions over the years, but overall
the evolution was slow until recently. I think More changes have 
happened in the past two years than in the previous twenty.
ES 6 stands for EcmaScript 6. It's also called EcmaScript 2015,
or ES 2015. These are all different names for the 'new Javascript'.

I'm not entirely sure *why* JS has changed so much recently,
but it seems to be because the owners of the major JavaScript engines
have finally become interested in pushing the language forward.
Also, the advent of transpilers have made it possible to use new
language features *before* they are built into the browsers. These 
two have combined to push JavaScript forward massively.

JS matters because it's the fabric of the web, and increasingly used
in server side apps with Node, and in mobile and desktop apps with Cordova,
React Native, and Electron. In short: JS is everywhere. So it matters
that we push it forward. Languages which don't evolve start to die.
Improving the language means we can improve our code. Our apps can 
have fewer bugs. And some of these features enable the runtimes 
to actually run code faster. So let's dive in, starting with
variables.


## The Problem with Variables

In Javascript when you want to create a variable you use 
the `var` keyword. `var` is great, but it has a couple of problems.
First, variables always *vary*. There is no way to make a true
constant in Javascript. You can sorta fake it by creating an object
with an immutable property. You can override the setter of the
property so that it can't be set by outside code, but it's a lot
of extra typing and requires an entire object instead of
a simple variable.

```
var VARS = {
    foo
        set = function() { }
        get = function() { return 42 }
}
VARS.foo = 42; // now I have a constant
```

Regular Javascript variables also have a scoping problem. Take a look
at this code.

```
function badCode() {
    if(foo) {
        var x = 5;
    }
    if(bar) {
        console.log(x);
    }
}
```

Variables declared with `var` are global to the function they are
defined in, *not the block*. You'd think that the log
statement above wouldn't work because
<b>bar</b> is defined in a different block.
and in a language like java or C# you'd be right, but in
Javascript `var` is global to a function, not a block.

It gets worse when we add in *variable hoisting*. Consider
this code

```
function badCode() {
    console.log("foo is",foo);
    var foo = 'bar';
}
```

I'm using foo before I've defined it. What does this code *even mean*?
Under the hood the javascript engine will hoist the variable 
declaration to the top of the function block. I can sort of see 
why you might want to hoist functions, but variable hoisting 
makes it very easy to introduce subtle bugs that are a pain
to diagnose.

Look at this `for` loop:

```
for(var i=0; i&lt;5; i++) {
    console.log(i);
}
console.log(i);
```

The variable is only used inside the loop, but I can still
reference it outside. This is just tons of bugs waiting to happen.

The good news is we don't have to use var anymore. Instead we can use const and let.

Introducing `const` and `let` 


The new keyword `const` does exactly what the name suggests. 
It makes a real constant. If you try to set the constant you'll 
get a runtime error. Even better, code linting systems can detect 
this kind of bug at compile time now, so you can find bugs earlier 
at development time rather than in production.


The other new kind of variable is created with the `let` keyword.
`let` is just like `var` but it is scoped by block 
instead of function. now it does what we expect.


```
function goodCode() {
    if(foo) {
        let x = 5;
    }
    if(bar) {
        console.log(x); //error
    }
}
```

Let's revisit the `for` loop example:

```
function goodCode() {
    for(let i=0; i&lt;5; i++) {
        console.log(i);
    }
    console.log(i); //error
}

```

Now the `i` variable is restricted to the body of the `for` loop.
There is no way it can be used outside accidentally.
Also, `let` isn't hoisted, so all of those magic moving variables
go away.

The new keywords `const` and `let` are a complete replacement for
`var`. With modern browsers and the newest versions of Node,
there is no reason to use `var` anymore. Good riddance.


## Super Strings

ES6 introduces a new type of string called *Template Literals*. I
prefer to call them *Super Strings*. 
You use a super string just like a regular string, but instead of 
using single or double quotes, you use the back quote.

```
var q  = 'foo';
var qq = "foo";

var bq = `foo`;

var qq = "Sally sells \"sea shells\"";
var bq = `Sally sells "sea shells"`;
```

So far so good, but nothing is very different.  It does have one 
immediate advantage. If you need to use double or single quotes 
inside of a string you don't have to escape them anymore. However,
super strings have a few other tricks up their sleeves.

## Multiline Strings

Finally we can have real multi-line strings. Need to quote several 
lines of something? You don't have to escape newlines or do join 
tricks anymore. Just put in the newlines directly and it works.

```
var qq = "this is a very long"
  + " piece of text that goes over several lines"
  + " and would require silly hacks";

var bq = `this is a very long
    piece of text that goes over several lines
    and would require silly hacks`;
```
    

## Expression escaping

Another new feature is *expression escaping*.
Within a super string you can put `${}` with any valid
Javascript expression inside the brackets. This is much cleaner than
double escaping your quotes, and recent IDEs will
syntax highlight these expressions nicely.


```
var name = "Alice";
var greeting = `Good morning ${name}`;
var amount = 5;
var price = 3;
var sales = `That costs ${amount*price} dollars`;</pre>
```

Combining expression escaping with multiline support gives
us great HTML templates. 

```
var template = `
  <div>
    <h3>Good Morning ${name}</h3>
    <p>
      That item will cost you
      <b>${amount*price}</b>
      dollars.
    </p>
  </div>`
```

## Arrow Functions

So that was strings and variables, but now let's take a look
at functions. If you've heard anything about ES6 before, it was
probably about *arrow functions*. These are a different syntax 
to write regular functions but with a more compact
syntax. They also have one very important difference:
the `this` variable means something different. Let's look at some
code.



Suppose you want to loop over an array to double the values 
within it, producing a new array. You could do it with the
following `for` loop,  but that creates extra variables 
and it can be easy to accidentially break early or get the 
index wrong. plus it's a lot of extra typing.

```
var output = [];
for(var i=0; i<;input.length; i++) {
    output[i] = input[i] * 2;
}
```

Javascript arrays have a method called `map` which calls a
function on every element to generate a new element,
which are then placed into a new array. It works like this:

```
var output = input.map(function(x) {
    return x * 2;
});
```

This looks better but it would be nice to make it smaller.
The `x*2` part is the only thing which actually does any work.
The rest is syntactic overhead. With an arrow function 
we can do it like this:

```
var output = input.map((x)=>x*2);
```

Woah! That's a lot smaller. Let me explain what happened. An
arrow function lets you rewrite a function without the actual
`function` word. Instead you put the `=>` after the parenthesis
containing the function parameters. 

```
//regular
function (x) {
    return x * 2;
}
//arrow style
(x) => {
    return x * 2;
}
```

Arrow functions let us write the same thing smaller. But we can
make it event shorter. Let's remove the whitespace. Same code just shorter.

```
(x) => { return x * 2; }
```

But we can make it *even* shorter still. If the arrow function 
contains only a single expression, we can remove the return and 
the braces and semicolon, resulting in a tiny one line expression
which automatically returns it's value. This is so much cleaner.
            
            
```
(x) => x * 2
var output = input.map((x)=>x*2);
```

Arrow functions can make your code very compact and powerful. But there's
one more trick up it's sleeve. It fixes `this`.


## The Curse of `this`

In Javascript the magic variable `this` always refers to the object
that the function is called on. So code like the following doesn't 
do what you think it does. 


```
function App() {
    this.clicked = false;
    var button = document.getElementById('button');
    button.addEventListener('click', function(evt) {
        this.clicked = true; //won't do what you think
    });
}
```

When you are using other objects the `this` context may be
different than what you expect. When you pass a function to 
somewhere else to be called back, it may call the function 
with a different 'this'. If you add an event
handler to a button the button will be the 'this'. Sometimes
that's what you want, but in the code above it isn't. We want
`this` to be the surrounding App object, not the button.

This is a long standing problem with Javascript. It's so common
that developers have created something known as the *self* pattern
where you save the correct `this` reference using a temporary
variable `self`. It's yucky but it works.

```
function App() {
    this.clicked = false;
    var button = document.getElementById('button');
    <b>var self = this;</b>
    button.addEventListener('click', function(evt) {
        self.clicked = true;
    });
}
```

Another way to solve the problem is to *bind* the function. 
The `bind` method forces the `this` to be a specific object,
regardless of how the function is latter called.


```
function App() {
    this.clicked = false;
    var button = document.getElementById('button');
    var callback = (function(evt) {
        this.clicked = true
    })<b>.bind(this);</b>
    button.addEventListener('click',callback);
}
```


Again, this will *work* but it's not great. We now
have extra code to write, and underneath doing a bind can create
extra overhead. Arrow functions give us a better way to do it.


```
function App() {
    this.clicked = false;
    var button = document.getElementById('button');
    button.addEventListener('click',()=>{
        this.clicked = true;
    });
}
```



Arrow functions automatically capture the `this` var from the surrounding
context of where the function *is defined*, 
not from where the function *is used*.
This means you can pass the function to some other place and absolutely
know that right version of `this` will be used.
In the code above everything works perfectly without any yucky hacks.


In short, arrow functions are really awesome. I try to use them
everywhere I can. They make your code shorter, easier to
read, and `this` becomes sensible again.


## Promises

Another great feature of arrow functions is that they work well
with Promises. A Promise is a new kind of object in Javascript
designed to help with things that take a long time to execute.
Javascript doesn't have threads so if you want to do something that
might take a long time then you have to use callbacks.

For example, in Node you might want to load a file, parse it,
make a database request, then write a new file. These must all be
done in order, but they are all asynchronous so you have to start
nesting your callbacks. This produces what JS hackers like to
call *The Pyramid of Doom*. You get massively nested code.

```
fs.readFile("file.txt", function(err, file) {
    db.fetchNames(function(err, names) {
        processFile(file, names, function(err, outfile) {
            fs.writeFile('file.txt',outfile, function(err, status) {
                console.log("we are done writing the file");
            })
        });
    })
});
```


This code is ugly, hard to reason about, and has lots of nasty corners
for bugs to hide. Promises help us defeat the pyramid of doom.



A Javascript `Promise` is an object that represents a value which may not be
available yet. It *promises* to have the value in the future.
You can add a callback to be invoked when the final value is ready
using the `then` function.


```
var prom = makeSomePromise();
//value not ready yet
prom.then((value)=>{
    //do something with the value
})
```


Promises with `then` callbacks are much like traditional callbacks, 
but promises add an extra twist: they can be *chained*.  Let's revisit 
our code from before. Each of the functions must be called in order, 
and each depends on the result of the previous one. Using promises 
we can do it like this instead. 

```
    fs.readFile("file.txt")
        .then((file) => {
            return db.fetchNames().then((names)=>{
                return processFile(file,names)
            })
        })
        .then((outfile)=>{
            return fs.writeFile('file.txt',outfile);
        })
        .then(()=>{
            console.log("we are done writing the file");
        });
```

Notice how the arrow functions make this nice and clean.
Each `then()` callback returns a value. This value is passed 
to the next one so all of our functions can be easily chained.

Now you'll notice that the `processFile` command needs the result 
of the previous *two* values however a promise only passes one value. 
We also don't care what order `readFile` and `fetchNames` happens 
in. We just want to know when both are completed. Promise can do this
too.


Suppose want to load each file from an array of filenames and be
be notified when they are all done. We can do that with `Promise.all()`.
`all` is a utility method on `Promise` which takes an array of promises and returns a new promise that resolves when all of the sub-promises complete.
Here's how we would load all of the files with `Promise.all`. (assume that
`readFile` is a function which returns a promise to read the file).

```
var proms = filenames.map((name)=> readFile(name));
Promise.all(proms).then((files)=>{
    console.log(`we have ${files.length} files`);
});
```

Now we can rewrite our original Node example like this:

```
Promise.all([
    fs.readFile("file.txt"),
    db.fetchNames()
])
.then((vals) => processFile(vals[0],vals[1]))
.then((outfile)=> fs.writeFile('file.txt',outfile))
.then(()=> console.log("we are done writing the file"));
```

I've combined the read file and database calls into a 
single promise using `Promise.all`. The value it will
return is an array containing the results of both sub-promises, 
so I can then put them into `processFile`. Notice that I've 
also used the abbreviated arrow syntax to make the code smaller 
and cleaner.

## Handling Failure

Now consider what happens if one of these Promises fails?  To
handle the first one failing we could put in a try / catch block,
but the next `then` will still be called. Really we want everything
to stop if the first one fails. Promises have another trick up
their sleeves: the catch callback.

In the new version below if anything fails it will immediately jump to the
catch callback at the end, skipping the rest. After the catch we
can still add more then clauses.
        
```
Promise.all([
    fs.readFile("file.txt"),
    db.fetchNames()
])
.then((vals) => processFile(vals[0],vals[1]))
.then((outfile)=> fs.writeFile('file.txt',outfile))
.then(()=> console.log("we are done writing the file"))
.catch((e) => {
    console.log("some error happened");
});
```


## Making your own Promises

Of course promises only work if the APIs we call actually use them.
Lots of libraries are starting to switch over to
promises, but while we wait we can make our own promises too.
We do it with the `Promise` constructor.

```
function makePromise(foo,bar) {
    return new Promise((resolve, reject) => {
        try {
            //do long stuff
            resolve(value);
        } catch {
            reject(error);
        }
    });
}
```

It takes two values: `resolve` and `reject`. Each of these are
callback functions. Inside you do whatever you need to do that
takes a long time, even if it involves multiple callbacks.
When you are completely done invoke `resolve()` with the final
value. This will then be sent the to the first `then` 
clause of whatever uses your promise.</p>

If something bad happens and you want to reject the value,
instead of throwing an error use the `reject()`, passing
whatever alternate value you want.

Here's a real-life example. I use AJAX calls all the 
time but they can be ugly, like this.



```
var url = "http://api.silly.io/api/list/e3da7b3b-976d-4de1-a743-e0124ce973b8?format=json";

var xml = new XMLHttpRequest();
xml.addEventListener('load', function() {
    var result = JSON.parse(this.responseText);
    console.log(result);
});
xml.addEventListener('error',function(error) {
    console.log("something bad happened");
});
xml.open("GET",url);
xml.send();
```

Let's wrap this code up in a promise.

```
function doGet(url) {
    return new Promise((resolve,rej)=>{
        var xml = new XMLHttpRequest();
        xml.addEventListener('load', function() {
            var result = JSON.parse(this.responseText);
            resolve(result);
        });
        xml.addEventListener('error',function(error) {
            reject(error);
        });
        xml.open("GET",url);
        xml.send();
    });
}
```

This is still the same basic code, but I can call it like this instead.

```
var url = "someapi.com/dostuff?foo=bar";
doGet(url).then((obj)=>{
    console.log(obj);
});
```
 
Wow, that's *so* much cleaner. In reality I don't need make my own
AJAX Promise wrapper because there is a new web standard called 
Fetch which already does this for me. Fetch isn't quite supported in 
all browsers yet, so we can use our own until then.


Promises can be a bit tricky to wrap your head around at
first, but once you start using them I think you'll really like
them. They make it very easy to pull multiple functions together
into a single workflow that makes logical sense, and to
properly catch all errors along the way.


## Arrays

Finally I want to show you a bunch of new Array features. 
Most of these aren't exactly *new* for ES6, and in fact some of 
them are quite old. However, they are finally supported everywhere
and play nicelly with Arrow Functions and Promises, so I think of them
as new.


Suppose you want to do something to every element of an array. Instead
of using a for loop, use the `forEach` or `map` functions.

```
var values = [1,2,3,4,5,6,7,8,9,10];
values.forEach((x)=>console.log(x));
var doubled = values.map((x) => x*2);
```

The `forEach` function runs the callback on every element of the 
array. The `map` function also runs on each element, but it stores the
results of each callback into a new array.

If you want to transform an array by including only certain values, 
use the `filter` function.

```
//find all values that match the filter
var evens = values.filter((x)=>x%2==0);
```

Array also has functions to find single values within the array based
on some criteria.

```
//find the first that matches
var six = values.find((x) =>  x >= 6);
//find the index of the first that match
var index = values.findIndex((x) =>  x >= 6);
//true if at least one item matches
var any = values.some((x) => x > 10);
```

Finally arrays can be reduced to a single value with the `reduce` function.
`reduce` is very powerful and can be used to do lots of things like
summing an array or flattening nested arrays

```
//reduce the array to a single value
var sum = values.reduce((a,b) => a+b, 0);
//flatten nested arrays
var list1 = [[0, 1], [2, 3], [4, 5]];
var list2 = [0, [1, [2, [3, [4, [5]]]]]];
const flatten = arr => arr.reduce(
  (acc, val) => acc.concat(
    Array.isArray(val) ? flatten(val) : val
  ),
  []
);
flatten(list1); // returns [0, 1, 2, 3, 4, 5]
flatten(list2); // returns [0, 1, 2, 3, 4, 5]
```


To loop over the properties in an object you can use the `Object.keys`
to get an array of property names, then loop over it with `forEach`

```
var obj = {
    first:'Alice',
    middle:'N',
    last:'Wonderland',
    age:8,
    height:45,
}
Object.keys(obj).forEach((key)=>{
    console.log("key = ", key);
    console.log("value = ", obj[key]);
});
```


# Things to Avoid


The five features I've shown you can be used today, but there's
a lot of other things in ES6 that you should avoid for time being;
either because they don't provide much value or aren't well supported
yet. These include:


* Destructuring
* Modules
* Default Parameters
* Spread Operator
* Symbols
* Generators and Iterators
* Weak Maps and Weak Sets
* Proxies


Destructuring allows you to pull values out of an object by name.
It can be useful in a few situations, but the best use I've found is
extracting functions from modules. Unfortunately modules are still a
mess and don't work the same everywhere, so avoid them for now. 

Along with destructuring you can do without tricks like default
parameters, and the spread operator. I find these to be more
trouble than they are worth, at least for now.


Symbols, generators, iterators, weak maps and sets, and proxies
are genuinely useful but they aren't supported everywhere yet so I
suggest you wait a while before using them.

There is also a new class syntax. It still uses JavaScript's 
prototypical inheritance, but it makes the syntax of defining a 
class cleaner and consistent. However, it is also not as valuable 
without the new module support so I suggest waiting a bit longer.

```
class Foo extends Bar {
    constructor(stuff) {
        super(stuff);
        this.first = "first name"
    }
    doStuff() {
    }
    doMoreStuff() {
    }
}
```

  
Most desktop and mobile browsers support everything I've shown you.
However, depending on your audience you may have older
browsers / older mobile OSes that don’t.  Whenever you want to know
if something is ready, go to [caniuse.com](http://caniuse.com). It 
will tell you what versions of each browser support what.

So that is five awesome new features of ES6 that you can start
using right away. More stuff is coming, but you don't need to wait to
use these. Get to codin'. And if you want go use them in
low latency data stream driven Javascript code, go check out
[PubNub BLOCKS](https://www.pubnub.com/products/blocks/). We've
created [a catalog of example code](https://www.pubnub.com/blocks-catalog/) that uses Arrow Functions and Promises
to communicate with lots of useful realtime webservices like 
on-the-fly language translation, geo-coding, and chatbot apis.

