if (annyang) {
    annyang.addCallback('resultNoMatch', result => {
        process_audio(result[0])
    })
  
    annyang.start(); 
}

let previous = [];

function process_audio(input_string) {
    let non_empty = string_split_by_space(input_string);
    let filtered = list_string_non_empty(non_empty);
    previous.push(...filtered);
}

function list_string_non_empty(s) {
    return s.filter(i => i.length > 0)
}

function string_split_by_space(s) {
    return s.split(' ')
}