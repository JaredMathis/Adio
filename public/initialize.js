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

function double go
input a go
output b go
eval string b symbol equals a symbol plus a go

function tic tac toe go
push words welcome to tic tac toe go
call speak go
push words it is your turn to move go
call speak go
push words to move choose a number from one to nine representing the cell you choose go
call speak go
call listen go
local move go
store move go
push move go
call speak go
`)