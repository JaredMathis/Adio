if (annyang) {
    annyang.addCallback('resultNoMatch', result => {
        process_audio(result[0])
    })

    annyang.start();
}

let buffer = [];

function process_audio(input_string) {
    output('processing ' + input_string);
    let non_empty = string_split_by_whitespace(input_string);
    let filtered = list_string_non_empty(non_empty);
    let trimmed = filtered.map(f => f.trim('\n'));
    let lowered = trimmed.map(f => f.toLowerCase());
    buffer.push(...lowered);

    process_try();
    console.log({data})
}

let data = {
    functions: [],
};
let current;
let runner = {
    type: 'runner',
}

let commands = [
    {
        prefix: 'function',
        exec: name => {
            name = list_to_identifier(name)
            function_get(name);
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
        exec: args => {
            if (current.type === 'runner') {
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
            } else {
                let name = list_to_identifier(args);
                let input = {
                    type: 'input',
                    name,
                };
                if (current.type !== 'function') {
                    error(`Cannot add input. Must be in function.`);
                }
                for (let i of current.inputs) {
                    if (i.name === name) {
                        error(`Input ${name} already exists for function ${parent_get(data, current).name}`);
                    }
                }
                current.inputs.push(input);
            }
        }
    },
    {
        prefix: 'output',
        exec: name => {
            name = list_to_identifier(name)
            if (current.type !== 'function') {
                error(`Cannot set output. Must be in function.`);
            }
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
        exec: remaining => {
            if (current.type !== 'function') {
                error(`Cannot add eval. Must be in function.`);
            }
            let eval = {
                type: 'eval',
                value: remaining,
            };
            current.steps.push(eval);
        }
    },
    {
        prefix: 'run function',
        exec: name => {
            name = list_to_identifier(name)
            current = runner;
            current.function = function_get(name);
            current.inputs = [];
            if (!current) {
                error(`No function named ${name}`);
            }
        }
    }
]

function function_run(fn, inputs) {
    let code = code_get(fn);
    console.log('here', code);
    eval_global(code)
    let result = eval_global(`${fn.name}(${inputs.map(i => i.name).join(', ')})`)
    audio_speak(result);
}

function code_get(fn) {
    return `function ${fn.name}(${fn.inputs.map(i => i.name).join(', ')}) {
${fn.steps.map(step => code_step_get(step)).join(`;
`)}
}`;
}

function code_step_get(step) {
    if (step.type === `eval`) {
        let value;
        assert(step.remaining[0] === 'string');
        let remaining = step.remaining.slice(1);
        let joined = apply_symbols(remaining).join("");
        value = `"${joined}"`;
        return `eval(${value})`
    }
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
    throw new Error('message');
}

function assert(condition) {
    if (!condition) {
        throw new Error('error assert ');
    }
}

function process_try() {
    for (let c of commands) {
        let prefixes = string_split_by_whitespace(c.prefix);
        if (list_prefix_is(buffer, prefixes)) {
            let next_go = buffer.indexOf('go');
            let remaining = buffer.slice(prefixes.length, next_go);
            c.exec(remaining);
            buffer = buffer.slice(next_go + 1);
            process_try();
        }
    }
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

let most_recent;

function audio_speak(words) {
    output('paused audio')
    annyang.abort();

    var msg = new SpeechSynthesisUtterance();
    msg.text = most_recent = words;

    msg.onend = (event) => {
        output('finished ' + words);
        output('starting audio');
        annyang.start();
    }
    window.speechSynthesis.speak(msg);
    output('speaking ' + msg.text)

    throw new Error('test error');
}

window.onerror  = function(message, source, lineno, colno, error) {
    output('error ' + message)
}

function output(message) {
    let m = document.createElement('div');
    m.innerHTML = message;
    document.body.appendChild(m);
}

function list_string_non_empty(s) {
    return s.filter(i => i.length > 0)
}

function string_split_by_whitespace(s) {
    return s.split(/\s/)
}