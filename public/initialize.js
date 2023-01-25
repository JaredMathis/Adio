process_audio(`
function add go
input a go
input b go
output c go
eval string c symbol equals a symbol plus b go

function subtract go
input a go
input b go
output c go
eval string c symbol equals a symbol minus b go

function subtract one go
input a go
output b go
push a go
push number one go
call subtract go
store b go

function mod go
input a go
input b go
output c go
eval string c symbol equals a symbol percent b go

function divide go
input a go
input b go
output c go
eval string c symbol equals a symbol divide b go

function floor go
input a go
output b go
eval string b symbol equals uppercase m lowercase a t h symbol dot floor symbol parenthesis open a symbol parenthesis close go

function divide floor go
input a go
input b go
output c go
push a go
push b go
call divide go
local q go
store q go
push q go
call floor go
store c go

function double go
input a go
output b go
eval string b symbol equals a symbol plus a go

function list new go
output a go
eval string a symbol equals symbol bracket open symbol bracket close go

function object new go
output a go
eval string a symbol equals symbol brace open symbol brace close go

function range each go
input limit go
input lambda go
eval string symbol parenthesis open async symbol parenthesis open symbol parenthesis close symbol equals symbol greater symbol brace open f o r symbol parenthesis open let symbol space symbol underscore i symbol equals zero symbol semicolon symbol underscore i symbol less limit symbol semicolon symbol underscore i symbol plus symbol plus symbol parenthesis close symbol brace open await symbol space lambda symbol parenthesis open symbol underscore i symbol parenthesis close symbol brace close symbol brace close symbol parenthesis close symbol parenthesis open close symbol parenthesis close go

function if else go
input condition go
input lambda if go
input lambda else go
eval string symbol parenthesis open async symbol parenthesis open symbol parenthesis close symbol equals symbol greater symbol brace open if symbol parenthesis open condition symbol parenthesis close symbol brace open await symbol space lambda_if symbol parenthesis open symbol parenthesis close symbol brace close else symbol brace open await symbol space lambda_else symbol parenthesis open symbol parenthesis close symbol brace close symbol brace close symbol parenthesis close symbol parenthesis open close symbol parenthesis close go

function list add go
input list go
input item go
eval string list symbol dot push symbol parenthesis open item symbol parenthesis close go

function property set go
input o go
input name go
input value go
eval string o symbol bracket open name symbol bracket close symbol equals value go

function property get go
input o go
input name go
output value go
eval string value symbol equals o symbol bracket open name symbol bracket close go

function list set go
input list go
input index go
input value go
push list go
push index go
push value go
call property set go

function list get go
input list go
input index go
output value go
push list go
push index go
call property get go
store value go

function list of size go
input size go
output result go
call list new go
store result go
push size go
push lambda go
call range each go
inner function lambda go
push result go
push undefined go
call list add go

function list 2 d new go
input row count go
input column count go
output result go
call list new go
store result go
push row count go
push each row go
call range each go
inner function each row go
push column count go
call list of size go
local row go
store row go
push result go
push row go
call list add go

function list 2 d get go
input list go
input y go
input x go
push list go
push y go
call list get go
local row go
store row go
push row go
push x go
call list get go
output item go
store item go

function list 2 d set go
input list go
input y go
input x go
input value go
push list go
push y go
call list get go
local row go
store row go
push row go
push x go
push value go
call list set go

function tic tac toe board new go
output board go
push number three go
push number three go
call list 2 d new go
store board go

function number is go
input n go
output value go
eval string value symbol equals symbol plus n symbol equals symbol equals symbol equals symbol plus n go

function tic tac toe move convert go
input move go
input on invalid go
output converted go
push move go
push true go
call string digit go
local move number go
store move number go
push move number go
call number is go
local move number valid go
store move number valid go
push move number valid go
push on valid go
    inner function on valid go
    push move number go
    call subtract one go
    local move number less go
    store move number less go
    push move number less go
    push number three go
    call divide floor go
    local move row go
    store move row go
    push move number less go
    push number three go
    call mod go
    local move column go
    store move column go
    call object new go
    store converted go
    push converted go
    push string row go
    push move row go
    call property set go
    push converted go
    push string column go
    push move column go
    call property set go
    back go
push invalid go
    inner function invalid go
    call on invalid go
    store converted go
    back go
call if else go

function tic tac toe listen move go
output converted go
call listen go
local move go
store move go
push move go
push on invalid go
    inner function on invalid go
    output converted go
    call tic tac toe listen move go
    store converted go
    back go
call tic tac toe move convert go
store converted go

function tic tac toe instructions go
push words welcome to tic tac toe go
call speak go
push words it is your turn to move go
call speak go
push words to move choose a number from one to nine representing the cell you choose go
call speak go

function tic tac toe board get go
input board go
input choice go
push choice go
push string row go
call property get go
local choice row go
store choice row go
push choice go
push string column go
call property get go
local choice column go
store choice column go
push board go
push choice row go
push choice column go
call list 2 d get go
output value go
store value go

function tic tac toe board set go
input board go
input choice go
input value go
push choice go
push string row go
call property get go
local choice row go
store choice row go
push choice go
push string column go
call property get go
local choice column go
store choice column go
push board go
push choice row go
push choice column go
push value go
call list 2 d set go

function equals go 
input a go
input b go
output c go
eval string c symbol equals a symbol equals symbol equals b go

function log go
input a go
eval string console symbol dot log symbol parenthesis open a symbol parenthesis close go

function list size get go
input list go
output size go
push list go
push string length go
call property get go
store size go

function list each go
input list go
input on each go
push list go
call list size get go
local size go
store size go
push size go
push lambda go
call range each go
    inner function lambda go
    input index go
    local item go
    push list go
    push index go
    call property get go
    store item go
    push item go
    push index go
    call on each go

function list 2 d each go
input list go
input on each go
push list go
push each row go
call list each go
    inner function each row go
    input row go
    input y go
    push row go
    push each column go
    call list each go
        inner function each column go
        input value go
        input x go
        push value go
        push x go
        push y go
        call on each go
        back go
    back go

function tic tac toe available get go
input board go
output available go
call list new go
store available go
push board go
push on each cell go
call list 2 d each go
    inner function on each cell go
    input value go
    input column go
    input row go
    call object new go
    local a go
    store a go
    push a go
    push string row go
    push row go
    call property set go
    push a go
    push string column go
    push column go
    call property set go
    push board go
    push a go
    push on unoccupied go
    push no operation go
    call tic tac toe if unoccupied go
        inner function on unoccupied go
        push available go
        push a go
        call list add go
        back go
    back go

function random go
output value go
eval string value symbol equals uppercase m lowercase a t h symbol dot random symbol parenthesis open symbol parenthesis close go

function multiply go
output value go
input a go
input b go
eval string value symbol equals a symbol star b go

function list random item go
input list go
local size go
push list go
call list size get go
store size go
local product go
call random go
local r go
store r go
push r go
push size go
call multiply go
store product go
push product go
call floor go
local index go
store index go
push list go
push index go
call list get go
output item go
store item go

function identity go
input a go
output b go
eval string b symbol equals a go

function tic tac toe move deconvert go
input board go
input choice go
output sum go
push number one go
call identity go
store sum go
push choice go
push string row go
call property get go
local row go
store row go
push choice go
push string column go
call property get go
local column go
store column go
local product go
push number three go
push row go
call multiply go
store product go
push product go
push sum go
call add go
store sum go
push sum go
push column go
call add go
store sum go

function list first go
input list go
push list go
push number zero go
call list get go
output value go
store value go

function tic tac toe cpu move go
input board go
local available go
push board go
call tic tac toe available get go
store available go
local a go
push available go
call list first go
store a go
push board go
push a go
push number negative one go
call tic tac toe board set go
push board go
push a go
call tic tac toe move deconvert go
local a n go
store a n go
local message go
push words the computer chose cell go
call identity go
store message go
push message go
push string symbol space go
call add go
store message go
push message go
push a n go
call add go
store message go
push message go
call speak go
push board go
call tic tac toe player move go

function tic tac toe if unoccupied go
input board go
input choice go
input on unoccupied go
input on occupied go
push board go
push choice go
call tic tac toe board get go
local choice value go
store choice value go
push choice value go
push undefined go
call equals go
local unoccupied go
store unoccupied go
push unoccupied go
push on unoccupied go
push on occupied go
call if else go

function no operation go

function tic tac toe player move go
input board go
call tic tac toe listen move go
local choice go
store choice go
push board go
push choice go
push valid go
push invalid go
call tic tac toe if unoccupied go
    inner function valid go
    push board go
    push choice go
    push number one go
    call tic tac toe board set go
    push board go
    push number one go
    call tic tac toe game over check go
    push board go
    call tic tac toe cpu move go
    back go

    inner function invalid go
    push words that choice is already taken go
    call speak go
    push words please choose another choice one through nine go
    call speak go

function tic tac toe draw check go
input board go
push board go
call tic tac toe available get go
local available go
store available go
push available go
call list size go
local available count go
store available count go
push available count go
push number zero go
call equals go
output game over go
store game over go

function tic tac toe board check go
input board go
input include if go
input target sum go
input if sum equals target go
push board go
push include if go
call tic tac toe board sum go
local sum go
store sum go
local sum equals target go
push sum go
push target sum go
call equals go
store sum equals target go
push sum equals target go
push if sum equals target go
push no operation go
call if else go

function tic tac toe winner check go
input board go
input player go
output winner go
push false go
call identity go
store winner go
push number three go
push player go
call multiply go
local target sum go
store target sum go
push number 3 go
push on each horizontal go
    inner function on each horizontal go
    input index go
    push board go
    push include if go
        inner function include if go
        input row go
        input column go
        push row go
        push index go
        call equals go
        output row equals index go
        store row equals index go
        back go
    push target sum go
    push if sum equals target go
        inner function if sum equals target go
        push true go
        call identity go
        store winner go
        push winner go
        call log go
        back go
    call tic tac toe board check go
    back go
call range each go

function debug go
eval string one symbol semicolon debugger go

function tic tac toe game over check go
input board go
input player go
push board go
push player go
call tic tac toe winner check go
local winner go
store winner go
push winner go
call speak go


function tic tac toe board sum go
input board go
input include if go
push number zero go
call identity go
output sum go
store sum go
push board go
push on each go
    inner function on each go
    input value go
    input column go
    input row go
    push row go
    push column go
    call include if go
    local include go
    store include go
    push include go
    push add to sum go
        inner function add to sum go
        push value go
        push sum go
        call add go
        store sum go
        back go
    push no operation go
    call if else go
    back go
call list 2 d each go

function tic tac toe go
call tic tac toe board new go
local board go
store board go
call tic tac toe instructions go
push board go
call tic tac toe player move go

function tic tac toe brief go
call tic tac toe board new go
local board go
store board go
push board go
call tic tac toe player move go

`)