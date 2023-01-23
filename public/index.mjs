let paused = false;

if (annyang) {
    annyang.addCallback('resultNoMatch', result => {
        process_audio(result[0])
    })

    annyang.start();
}

let previous = [];

function process_audio(input_string) {
    console.log('processing ' + input_string);
    let non_empty = string_split_by_space(input_string);
    let filtered = list_string_non_empty(non_empty);
    previous.push(...filtered);

    audio_speak(filtered);
}

function audio_speak(words) {
    console.log('paused')
    annyang.abort();

    var msg = new SpeechSynthesisUtterance();
    msg.text = words.join(' ');
    window.speechSynthesis.speak(msg);
    console.log(msg.text)

    msg.onend = (event) => {
        console.log('finished ' + words);
        annyang.start();
    }

}

function list_string_non_empty(s) {
    return s.filter(i => i.length > 0)
}

function string_split_by_space(s) {
    return s.split(' ')
}