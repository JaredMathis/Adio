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


function list_find(available, predicate) {
    let match;
    for (let c of available) {
        if (predicate(c)) {
            match = c;
        }
    }
    return match;
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


function process_try() {
    let help_index = buffer.indexOf('help');
    if (help_index >= 0) {
        audio_speak(`Say, "list commands go" to hear a list of commands you can say right now. Use the "info" command to get information about a command.`);
        buffer.length = 0;
        return;
    }
    let cancel = buffer.indexOf('cancel');
    if (cancel >= 0) {
        buffer = buffer.slice(cancel + 1);
        alert('canceld')
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
}

function commands_allowed_get() {
    return commands.filter(c => c.allowed());
}

window.onerror  = function(message, source, lineno, colno, error) {
    output('error ' + message)
}

