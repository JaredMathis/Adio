if (annyang) {
    annyang.addCallback('resultNoMatch', result => {
        process_audio(result[0])
    })

    annyang.start();
}

let output_audio_pauses = false

let most_recent;

function speak(words) {
    return new Promise((resolve) => {
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
            resolve();
        }
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(msg);
        output('speaking: ' + msg.text)
    })
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
    let split = words_split(lowered)
    let normalized = split.map(l => word_normalize(l))
    output('received: ' + normalized.join(' '));

    buffer.push(...normalized);

    process_try();
    console.log({data})
}

function words_split(words) {
    let result= [];
    for (let w of words) {
        let r = w.split('-');
        result.push(...r);
    }
    return result;
}

function word_normalize(w) {
    let normies = [
        ['b', 'bee', 'be'],
        ['go', 'yo'],
        ['0', 'zero'],
        ['1', 'one', 'won'],
        ['2', 'two', 'to', 'too'],
        ['4', 'four', 'for'],
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


function list_to_identifier(list) {
    return list.join('_');
}

function error(message) {
    buffer.length = 0;
    speak(message);
    throw new Error(message);
}

let listen_resolves = [];
function listen() {
    return new Promise(resolve => listen_resolves.push(resolve));
}

function list_first_remove(list) {
    let first = list[0];
    list.splice(0, 1);
    return first;
}

function process_try() {
    if (listen_resolves.length > 0) {
        let n = next_go();
        if (n.next_go < 0) {
            return;
        }
        buffer = buffer.slice(n.next_go + 1);
        let first = list_first_remove(listen_resolves);
        first(n.remaining.join(' '));
        return;
    }

    let help_index = buffer.indexOf('help');
    if (help_index >= 0) {
        speak(`Say, "list commands go" to hear a list of commands you can say right now. Use the "info" command to get information about a command.`);
        buffer.length = 0;
        return;
    }
    let cancel = buffer.indexOf('cancel');
    if (cancel >= 0) {
        buffer = buffer.slice(cancel + 1);
    }
    let complete = false;
    for (let c of commands_allowed_get()) {
        let prefixes = string_split_by_whitespace(c.prefix);
        if (list_prefix_is(buffer, prefixes)) {
            let n = next_go(prefixes);
            if (n.next_go < 0) {
                complete = true;
                break;
            }
            console.log(prefixes.concat(n.remaining).join(' '));
            c.exec(n.remaining);
            buffer = buffer.slice(n.next_go + 1);
            process_try();
        }
    }
    if (complete) {
        return;
    }
    if (buffer.length === 0) {
        return;
    }
    error('Invalid command: ' + buffer);
}

function next_go(prefixes) {
    let result = {};
    result.next_go = buffer.indexOf('go');
    if (result.next_go < 0) {
        return result;
    }
    result.remaining = buffer.slice((prefixes || []).length, result.next_go);
    return result;
}

function commands_allowed_get() {
    return commands.filter(c => c.allowed());
}

window.onerror  = function(message, source, lineno, colno, error) {
    output('error ' + message)
}

