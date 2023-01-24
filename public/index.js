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
}

let data = {
    functions: [],
};
let current;

let commands = [
    {
        prefix: 'function',
        exec: function_name => {
            for (let f of data.functions) {
                if (f.name === function_name) {
                    current = f;
                }
            }
            if (!current) {
                current = {
                    type: 'function',
                    name: function_name,
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
        exec: input_name => {
            for (let i of current.inputs) {
                if (i.name === input_name) {
                    audio_speak(`Input ${input_name} already exists for function ${parent_get(data, current)}`);
                }
            }
            if (!current) {
                current = {
                    type: 'function',
                    name: function_name,
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
    }
]

function process_try() {
    for (let c of commands) {
        let prefixes = string_split_by_whitespace(c.prefix);
        console.log({buffer, prefixes})
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