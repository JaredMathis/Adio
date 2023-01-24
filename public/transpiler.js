
async function function_run(fn, inputs) {
    let code = code_get(fn);
    output(code);
    eval_global(code)
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
}`;
}

function code_step_get(step) {
    if (step.type === `eval`) {
        let value = code_expression_get(step.value);
        return `eval(${value})`
    }
    if (step.type === `push`) {
        let value = code_expression_get(step.value);
        return `_args.push(${value})`
    }
    if (step.type === `call`) {
        return `result = await ${step.name}(..._args);_args.length = 0`
    }
    if (step.type === `store`) {
        return `${step.name} = result`
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
        value = remaining.map(r => string_to_digit(r)).join('')
    } else {
        value = list_to_identifier(e)
    }
    return value;
}

function string_to_digit(s) {
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
                "minus": '-',
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
