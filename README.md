(Work in progress)

Live site: http://adioscript.web.app/

Purpose is to create accesible programming language for the visually-impaired

For example, saying the following...

```
function double go
input a go
output b go
eval string b symbol equals a symbol plus a go
```

...defines a new function (the program uses the microphone to record the user speaking)

Then, to run the function say:

```
run function double go
input number seven go
```

Then the computer verbalizes the output of 14

This is equivalent to the following JavaScript code:

```
function double(a) { let b; eval("b=a+a") return b; }
double(7);
```

For more examples see: https://github.com/JaredMathis/Adio/blob/main/public/initialize.js

Adio
