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
store move number go
push move number go
call speak go
`)