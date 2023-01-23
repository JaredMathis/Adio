if (annyang) {
    annyang.addCallback('resultNoMatch', result => {
        process(result[0])
    })
  
    annyang.start(); 
}

function process(input_string) {
    let non_empty = string_split_by_space(input_string);
    let filtered = list_string_non_empty(non_empty);
    alert(filtered);
}

function list_string_non_empty(s) {
    return s.filter(i => i.length > 0)
}

function string_split_by_space(s) {
    return s.split(' ')
}