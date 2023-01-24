if (annyang) {
    annyang.addCallback('resultNoMatch', result => {
        process_audio(result[0])
    })

    annyang.start();
}

let buffer = [];

function process_audio(input_string) {
    output('processing ' + input_string);
    let non_empty = string_split_by_space(input_string);
    let filtered = list_string_non_empty(non_empty);
    buffer.push(...filtered);

    process_try();
}

let commands = [
    {
        prefix: 'function',
        exec: remaining => {
            console.log(remaining);
        }
    }
]

function process_try() {
    
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

function string_split_by_space(s) {
    return s.split(' ')
}