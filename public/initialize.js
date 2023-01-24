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

function tic tac toe instructions go
push words welcome to tic tac toe go
call speak go
push words it is your turn to move go
call speak go
push words to move choose a number from one to nine representing the cell you choose go
call speak go

function list new go
output a go
eval string a symbol equals symbol bracket open symbol bracket closed

function list with size go
input size go

function tic tac toe go
call tic tac toe instructions go
call listen go
local move go
store move go
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

`)