if (annyang) {
    annyang.addCallback('resultNoMatch', result => {
        process_audio(result[0])
    })

    annyang.start();
}

let output_audio_pauses = false

let most_recent;

function audio_speak(words) {
    if (output_audio_pauses)
        output('paused audio')
    annyang.abort();

    var msg = new SpeechSynthesisUtterance();
    msg.text = most_recent = words;

    msg.onend = (event) => {
        if (output_audio_pauses)
            output('finished ' + words);
        if (output_audio_pauses)
            output('starting audio');
        annyang.start();
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
    output('speaking: ' + msg.text)
}

function output(message) {
    let m = document.createElement('div');
    m.innerHTML = message;
    document.body.appendChild(m);
}

let buffer = [];

function process_audio(input_string) {
    let non_empty = string_split_by_whitespace(input_string);
    let filtered = list_string_non_empty(non_empty);
    let trimmed = filtered.map(f => f.trim('\n'));
    let lowered = trimmed.map(f => f.toLowerCase());
    let normalized = lowered.map(l => word_normalize(l))
    output('received: ' + normalized.join(' '));
    buffer.push(...normalized);

    process_try();
    console.log({data})
}

function word_normalize(w) {
    let normies = [
        ['b', 'bee', 'be'],
        ['two', 'to', 'too'],
        ['four', 'for'],
        ['go', 'yo'],
    ];
    for (let n of normies) {
        if (n.includes(w)) {
            return n[0]
        }
    }
    return w;
}

let data = {
    functions: [],
};
let current = {};
let runner = {
    type: 'runner',
}

let commands = [
    {
        prefix: 'info',
        help: `This command says information about how to use the command. For example, to get info about the info command say info info go. You say info twice because the first info calls the command and the second info is the name of the command to get information about.`,
        allowed: () => true,
        exec: remaining => {
            let available = commands_allowed_get();
            available.sort(function (a,b) {
                return a.prefix - b.prefix;
            });

            let target = remaining.join(' ');

            let predicate = a => a.prefix === target;
            let match = list_find(available, predicate);
            let global_match = list_find(commands, predicate);
            if (!match) {
                if (global_match) {
                    error('This command exists, but is not available right now.');
                } else {
                    error('This command does not exist.')
                }
            }

            audio_speak(match.help);
        }
    },
    {
        prefix: 'list commands',
        help: `This command lists the commands that are available right now`,
        allowed: () => true,
        exec: () => {
            let available = commands_allowed_get().map(c => c.prefix);
            available.sort();
            audio_speak(`The following commands are available: ` + available.join(' and '))
        }
    },
    {
        prefix: 'function',
        help: `This command creates a function with the name you say, if it does not yet exist. Then it opens the function.`,
        allowed: () => true,
        exec: name => {
            name = list_to_identifier(name)
            current = function_get(name);
            if (!current) {
                current = {
                    type: 'function',
                    name: name,
                    inputs: [
                    ],
                    steps: [
                    ],
                    inners: [
                    ]
                };
                data.functions.push(current)
            }
        }
    },
    {
        prefix: 'input',
        help:  `This command sets the next input for the function being ran to the value you say`,
        allowed: () => current.type === 'runner',
        exec: args => {
            let input = {
                type: 'input',
                value: args,
            };
            current.inputs.push(input);
            let expect = current.function.inputs.length;
            let actual = current.inputs.length;
            console.log({expect, actual})
            if (expect < actual) {
                error(`Function ${current.function.name} expects ${expect} input; received ${actual}`)
            } else {
                if (expect === actual) {
                    function_run(current.function, current.inputs);
                }
            }
        }
    },
    {
        prefix: 'input',
        help:  `This command creates a function input with the name you say.`,
        allowed: () => current.type === 'function',
        exec: args => {
            let name = list_to_identifier(args);
            let input = {
                type: 'input',
                name,
            };
            for (let i of current.inputs) {
                if (i.name === name) {
                    error(`Input ${name} already exists for function ${parent_get(data, current).name}`);
                }
            }
            current.inputs.push(input);
        }
    },
    {
        prefix: 'output',
        help:  `This command sets the function output with the name you say.`,
        allowed: () => current.type === 'function',
        exec: name => {
            name = list_to_identifier(name)
            if (current.output) {
                error(`Output ${name} already exists for function ${parent_get(data, current).name}`);
            }
            let output = {
                type: 'output',
                name,
            };
            current.output = output;
        }
    },
    {
        prefix: 'eval',
        help:  `This command adds a step. You say the string to evaluate in JavaScript when this step is ran.`,
        allowed: () => current.type === 'function',
        exec: remaining => {
            let eval = {
                type: 'eval',
                value: remaining,
            };
            current.steps.push(eval);
        }
    },
    {
        prefix: 'run function',
        help:  `This command runs the function you say. If the function has inputs you will need to set those, first.`,
        allowed: () => true,
        exec: name => {
            name = list_to_identifier(name)
            current = runner;
            current.function = function_get(name);
            current.inputs = [];
            if (!current) {
                error(`No function named ${name}`);
            }
            if (current.function.inputs.length === 0) {
                function_run(current.function, []);
            }
        }
    },
    {
        prefix: 'say',
        help:  `This command repeats back the words you say. This can be used to test the microphone and speaker.`,
        allowed: () => true,
        exec: remaining => {
            audio_speak(remaining.join(' '));
        }
    }
]

function list_find(available, predicate) {
    let match;
    for (let c of available) {
        if (predicate(c)) {
            match = c;
        }
    }
    return match;
}

function function_run(fn, inputs) {
    let code = code_get(fn);
    output(code);
    eval_global(code)
    const code2 = `${fn.name}(${inputs.map(i => code_expression_get(i.value)).join(', ')})`;
    output(code2);
    let result = eval_global(code2)
    audio_speak(result);
}

function code_get(fn) {
    return `function ${fn.name}(${fn.inputs.map(i => i.name).join(', ')}) {
${ !fn.output ? "" : `let ${fn.output.name};` }
${fn.steps.map(step => code_step_get(step)).join(`;
`)}
${ !fn.output ? "" : `return ${fn.output.name};` }
}`;
}

function code_step_get(step) {
    if (step.type === `eval`) {
        let value = code_expression_get(step.value);
        return `eval(${value})`
    }
}

function code_expression_get(e) {
    let value;
    let remaining = e.slice(1);
    if (e[0] === 'string') {
        let joined = apply_symbols(remaining).join("");
        value = `"${joined}"`;
    } else if (e[0] === 'number') {
        value = remaining.map(r => string_to_digit(r)).join('')
    } else {
        error('Invalid expression type: ' + e[0]);
    }
    return value;
}

function string_to_digit(s) {
    if (/\d+/.test(s)) {
        return parseInt(s, 10);
    }
    let lookup = [
        ['zero'], 
        ['one'], 
        ['two'], 
        ['three'], 
        ['four'], 
        ['five'], 
        ['six'], 
        ['seven'], 
        ['eight'], 
        ['nine']
    ]
    for (let i = 0; i< lookup.length; i++) {
        if (lookup[i].includes(s)) {
            return i;
        }
    }
    error('Invalid digit: ' + s);
}

function apply_symbols(list) {
    let result = [];
    let symbol_is = false;
    for (let item of list) {
        if (item === 'symbol') {
            symbol_is=  true;
            continue;
        }
        let actual;
        if (symbol_is) {
            symbol_is = false;
            actual = {
                "plus": '+',
                "equals": '=',
            }[item]
            if (typeof actual !== typeof '') {
                error(`Symbol is invalid: ${item}`)
            }
        } else {
            actual = item;
        }
        result.push(actual);
    }
    return result;
}

function eval_global(value) {
    return (1, eval)(value);
}

function function_get(name) {
    let result;
    for (let f of data.functions) {
        if (f.name === name) {
            result = f;
        }
    }
    return result;
}

function list_to_identifier(list) {
    return list.join('_');
}

function error(message) {
    buffer.length = 0;
    audio_speak(message);
    throw new Error(message);
}

function assert(condition) {
    if (!condition) {
        throw new Error('error assert ');
    }
}

function process_try() {
    let help_index = buffer.indexOf('help');
    if (help_index >= 0) {
        audio_speak(`Say list commands go to hear a list of commands you can say right now. Use the info command to get information about a command.`);
        buffer.length = 0;
        return;
    }
    for (let c of commands_allowed_get()) {
        let prefixes = string_split_by_whitespace(c.prefix);
        if (list_prefix_is(buffer, prefixes)) {
            let next_go = buffer.indexOf('go');
            if (next_go < 0) {
                return;
            }
            let remaining = buffer.slice(prefixes.length, next_go);
            c.exec(remaining);
            buffer = buffer.slice(next_go + 1);
            process_try();
        }
    }
    if (buffer.length === 0) {
        return;
    }
    console.log(JSON.stringify(buffer))
    error('Invalid command ' + buffer.join(' '))
}

function commands_allowed_get() {
    return commands.filter(c => c.allowed());
}

function parent_get(root, item) {
    let result;
    traverse(root, (v) => {
        let {parent, node} = v;
        if (node === item) {
            result = parent;
        }
    })
    return result;
}

function traverse(root, for_each, stack) {
    if (!stack) {
        stack = [];
    }
    for_each(root, stack[stack.length - 1]);
    stack.push(root);
    for (let key of Object.keys(root)) {
        let node = root[key];
        traverse(node, for_each, stack);
    }
    stack.pop();
}

function list_prefix_is(list, prefix_candidate) {
    for (let i = 0; i < prefix_candidate.length; i++) {
        if (list[i] !== prefix_candidate[i]) {
            return false;
        }
    }
    return true;
}

window.onerror  = function(message, source, lineno, colno, error) {
    output('error ' + message)
}


function list_string_non_empty(s) {
    return s.filter(i => i.length > 0)
}

function string_split_by_whitespace(s) {
    return s.split(/\s/)
}