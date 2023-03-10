if (annyang) {
    annyang.addCallback('resultNoMatch', result => {
        process_audio(result[0])
    })

    annyang.addCallback('start', on_annyang_start)
    annyang.addCallback('end', on_annyang_end)

    annyang.start();
}

let output_audio_pauses = false

let most_recent;

let sound = true;

let on_annyang_start_resolves = [];
function on_annyang_start() {
    output('start event');
    for (let r of on_annyang_start_resolves) {
        r();
    }
    on_annyang_start_resolves.length === 0
}

let on_annyang_end_resolves = [];
function on_annyang_end() {
    output('end event');
    for (let r of on_annyang_end_resolves) {
        r();
    }
    on_annyang_end_resolves.length === 0
}

function annyang_abort() {
    return new Promise(resolve => {
        on_annyang_end_resolves.push(resolve);
        annyang.abort();
    });
}
function annyang_start() {
    return new Promise(resolve => {
        on_annyang_start_resolves.push(resolve);
        annyang.start();
        output('start called');
    });
}

function speak(words) {
    if (!sound) {
        return Promise.resolve();
    }
    return new Promise(async (resolve) => {
        await annyang.abort();
        await sleep(200);

        var msg = new SpeechSynthesisUtterance();
        msg.text = most_recent = words;

        msg.onend = async (event) => {
            await annyang.start();
            await sleep(200);
            resolve();
        }
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(msg);
        output('speaking: ' + msg.text)
    })
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(() => resolve(), ms);
    })
}

function output(message) {
    let m = document.createElement('div');
    m.innerHTML = message;
    document.body.appendChild(m);
}

let buffer = [];

async function process_audio(input_string) {
    let no_specials = input_string.replace('.', '');
    let non_empty = string_split_by_whitespace(no_specials);
    let filtered = list_string_non_empty(non_empty);
    let trimmed = filtered.map(f => f.trim('\n'));
    let lowered = trimmed.map(f => f.toLowerCase());
    let split = words_split(lowered)
    let normalized = split.map(l => word_normalize(l))
    output('received: ' + normalized.join(' '));

    buffer.push(...normalized);

    await process_try();
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

function current_set(value) {
    if (value === undefined) {
        debugger;
    }
    current = value;
}

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

async function error(message) {
    buffer.length = 0;
    await speak(message);
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

let muted = false;

async function process_try() {
    if (muted) {
        let unmute_index = buffer.indexOf('unmute');
        if (unmute_index >= 0) {
            buffer = buffer.slice(unmute_index + 1);
            muted = false;
            await speak('unmuted')
            await process_try();
            return;
        } else {
            buffer.length = 0;
            return;
        }
        
    } else {
        let mute_index = buffer.indexOf('mute');
        if (mute_index >= 0) {
            buffer = buffer.slice(0, mute_index + 1);
            muted = true;
            await speak('muted')
            await process_try();
            return;
        }
    }

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
        await speak(`Say, "list commands go" to hear a list of commands you can say right now. Use the "info" command to get information about a command.`);
        buffer.length = 0;
        return;
    }
    let cancel = buffer.indexOf('cancel');
    if (cancel >= 0) {
        buffer = buffer.slice(cancel + 1);
        await speak("buffer cleared");
    }
    if (await process_command_next(commands_allowed_get())) {
        return;
    }
    if (buffer.length === 0) {
        return;
    }
    error('Invalid command: ' + buffer);
}

async function process_command_next(commands) {
    let complete = false;
    for (let c of commands) {
        let prefixes = string_split_by_whitespace(c.prefix);
        if (list_prefix_is(buffer, prefixes)) {
            let n = next_go(prefixes);
            if (n.next_go < 0) {
                complete = true;
                break;
            }
            // console.log(prefixes.concat(n.remaining).join(' '));
            buffer = buffer.slice(n.next_go + 1);
            await c.exec(n.remaining);
            await process_try();
        }
    }
    return complete;
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

