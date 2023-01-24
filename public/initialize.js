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

function tic tac toe move convert go
input move go
push move go
call string digit go
local move number go
store move number go
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
output converted go
store converted go
push converted go
push string row go
push move row go
call property set go
push converted go
push string column go
push move column go
call property set go

function tic tac toe listen move go
call listen go
local move go
store move go
push move go
call tic tac toe move convert go
output converted go
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

function list each go

function tic tac toe go
call tic tac toe board new go
local board go
store board go
call tic tac toe instructions go
call tic tac toe listen move go
local choice go
store choice go
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
push valid go
push invalid go
call if else go
    inner function valid go
    push board go
    push choice go
    push number 1 go
    call tic tac toe board set go

    back go

    inner function invalid go
    push words that choice is already taken go
    call speak go
    push words please choose another choice one through nine go
    call speak go
`)