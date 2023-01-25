
async function function_run(fn, inputs) {
    for (let f of data.functions) {
        let code = code_get(f);
        output(code);
        eval_global(code)
    }
    const code2 = `${fn.name}(${inputs.map(i => code_expression_get(i.value)).join(', ')})`;
    output(code2);
    let result = await eval_global(code2)
    if (result !== undefined) {
        speak(result);
    }
}

function code_get(fn) {
    return `async function ${fn.name}(${fn.inputs.map(i => i.name).join(', ')}) {
let _args = [];
let _result;
${fn.locals.length === 0 ? "" : "let " + fn.locals.map(i => i.name).join(', ') + ";"}
${ !fn.output ? "" : `let ${fn.output.name};` }
${fn.steps.map(step => code_step_get(step)).join(`;
`)}
${ !fn.output ? "" : `return ${fn.output.name};` }
${ fn.inners.length === 0 ? '' : fn.inners.map(i => code_get(i)).join(`
`) }
}`;
}

function code_step_get(step) {
    if (step.type === `eval`) {
        let value = code_expression_get(step.value);
        return `await eval(${value})`
    }
    if (step.type === `push`) {
        let value = code_expression_get(step.value);
        return `_args.push(${value})`
    }
    if (step.type === `call`) {
        return `_result = await ${step.name}(..._args);_args.length = 0;console.log('${step.name}',_result)`
    }
    if (step.type === `store`) {
        return `${step.name} = _result`
    }
    error('invalid step: ' + step);
}

function code_expression_get(e) {
    let value;
    let remaining = e.slice(1);
    if (e[0] === 'string') {
        let joined = apply_symbols(remaining).join("");
        value = `"${joined}"`;
    } else if (e[0] === 'words') {
        let joined = (remaining).join(" ");
        value = `"${joined}"`;
    } else if (e[0] === 'number') {
        let factor;
        if (e[1] === 'negative') {
            factor = -1;
            remaining = remaining.slice(1);
        } else {
            factor = 1;
        }
        value = remaining.map(r => string_digit(r)).join('')
    } else {
        value = list_to_identifier(e)
    }
    return value;
}

function string_digit(s) {
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
    let symbol_prefix;
    let uppercase = false;
    for (let item of list) {
        if (item === 'symbol') {
            symbol_is = true;
            symbol_prefix = [];
            continue;
        }
        if (item === 'uppercase') {
            uppercase = true;
            continue;
        }
        if (item === 'lowercase') {
            uppercase = false;
            continue;
        }
        let actual;
        if (symbol_is) {
            symbol_prefix.push(item);
            
            let partials = [
                'parenthesis',
                'bracket',
                'brace',
            ]
            if (partials.includes(item)) {
                continue;
            }

            actual = {
                "brace open": '{',
                "brace close": '}',
                "bracket open": '[',
                "bracket close": ']',
                "parenthesis open": '(',
                "parenthesis close": ')',
                "plus": '+',
                "percent": '%',
                "divide": '/',
                "minus": '-',
                "equals": '=',
                "dot": '.',
                "space": ' ',
                "underscore": '_',
                "less": '<',
                "greater": '>',
                "semicolon": ';',
                "star": '*',
            }[symbol_prefix.join(' ')]
            if (typeof actual !== typeof '') {
                error(`Symbol is invalid: ${symbol_prefix.join(' ')}`)
            }
            
            symbol_is = false;
        } else {
            actual = item;
        }
        if (uppercase) {
            actual = actual.toUpperCase();
        }
        result.push(actual);
    }
    return result;
}

function eval_global(value) {
    return (1, eval)(value);
}
