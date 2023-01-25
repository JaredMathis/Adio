
let commands = [
    {
        prefix: 'info',
        help: `This command says information about how to use the command. For example, to get info about the info command say info info go. You say info twice because the first info calls the command and the second info is the name of the command to get information about.`,
        allowed: () => true,
        exec: async remaining => {
            let available = commands_allowed_get();
            available.sort(function (a,b) {
                return a.prefix - b.prefix;
            });

            let target = remaining.join(' ');

            let predicate = a => a.prefix === target;
            let match = list_find(available, predicate);
            let global_match = list_find(commands, predicate);
            if (!match) {
                if (global_match) {
                    await error('This command exists, but is not available right now.');
                } else {
                    await error('This command does not exist.')
                }
            }

            await speak(match.help);
        }
    },
    {
        prefix: 'list commands',
        help: `This command lists the commands that are available right now`,
        allowed: () => true,
        exec: async () => {
            let available = commands_allowed_get().map(c => c.prefix);
            available.sort();
            await speak(`The following commands are available: ` + available.join('. '))
        }
    },
    {
        prefix: 'list all functions',
        help: `This command lists the functions that exist`,
        allowed: () => true,
        exec: async () => {
            data.functions.sort((a,b) => a.name - b.name);
            await speak(`The following functions exist: ` + data.functions.map(f => f.name).join('. '))
        }
    },
    {
        prefix: 'list all inner functions',
        help: `This command lists the inner functions of the current function that exist`,
        allowed: () => current.type === 'function',
        exec: async () => {
            current.inners.sort((a,b) => a.name - b.name);
            await speak(`The following inner functions exist: ` + current.inners.map(f => f.name).join('. '))
        }
    },
    {
        prefix: 'current output',
        help: `This command lists the ouptut of the current function`,
        allowed: () => current.type === 'function',
        exec: async () => {
            if (!current.output) {
                await speak('There is no output.');
            } else {
                await speak(`The output is: ` + current.output.name)
            }
        }
    },
    {
        prefix: 'steps count',
        help: `This command says the number of steps of the current function`,
        allowed: () => current.type === 'function',
        exec: async () => {
            await speak(`The steps count is: ` + current.steps.length)
        }
    },
    {
        prefix: 'step',
        help: `This command says the specified step`,
        allowed: () => current.type === 'function',
        exec: async (remaining) => {
            let n = await string_digit(remaining.join(' '));
            let s = current.steps[n - 1];
            if (!s) {
                await speak(`There is no step ${n}.`);
            } else {
                await speak(`Step ${n} is ${s.type} ${s.value || s.name}`);
            }
        }
    },
    {
        prefix: 'list all inputs',
        help: `This command lists the inputs of the current function`,
        allowed: () => current.type === 'function',
        exec: async () => {
            if (current.inputs.length === 0) {
                await speak('There are no inputs.');
            } else {
                await speak(`The following inputs exist: ` + current.inputs.map(i => i.name).join('. '))
            }
        }
    },
    {
        prefix: 'list all locals',
        help: `This command lists the locals of the current function`,
        allowed: () => current.type === 'function',
        exec: async () => {
            if (current.locals.length === 0) {
                await speak('There are no locals.');
            } else {
                await speak(`The following locals exist: ` + current.locals.map(i => i.name).join('. '))
            }
        }
    },
    {
        prefix: 'function',
        help: `This command creates a function with the name you say, if it does not yet exist. Then it opens the function.`,
        allowed: () => true,
        exec: async name => {
            let before = name;
            name = list_to_identifier(name);
            let next = function_get(name);
            if (!next) {
                await speak(`Function does not exist. Creating.`);
                next = function_new(name);
                data.functions.push(next);
            }
            current_set(next);
            await speak(`Opened function: ` + before);
        }
    },
    {
        prefix: 'inner function',
        help: `This command creates an inner function with the name you say, if it does not yet exist. Then it opens the function. You must be in a function to create an inner function.`,
        allowed: () => current.type === 'function',
        exec: async name => {
            let before = name;
            name = list_to_identifier(name);
            let previous = current;
            let next = function_inner_get(name);
            if (!next) {
                await speak(`Inner function does not exist. Creating.`);
                next = function_new(name);
                previous.inners.push(next)
            }
            await speak(`Opened inner function: ` + before);
            current_set(next);
        }
    },
    {
        prefix: 'back',
        help: `This command changes the current to the parent object`,
        allowed: () => current.type === 'function',
        exec: async () => {
            do {
                let before = current;
                current_set(parent_get(data, current));
            } while (Array.isArray(current))

            if (current.type === 'function') {
                await speak(`Back to function: ` + identifier_to_string(current.name));
            } else {
                await speak(`Back to home`);
            }
        }
    },
    {
        prefix: 'input',
        help:  `This command sets the next input for the function being ran to the value you say`,
        allowed: () => current.type === 'runner',
        exec: async args => {
            let input = {
                type: 'input',
                value: args,
            };
            current.inputs.push(input);
            await speak(`Input set to ` + args);
            let expect = current.function.inputs.length;
            let actual = current.inputs.length;
            console.log({expect, actual})
            if (expect < actual) {
                error(`Function ${current.function.name} expects ${expect} input; received ${actual}`)
            } else {
                if (expect === actual) {
                    function_run(current.function, current.inputs);
                }
            }
        }
    },
    {
        prefix: 'input',
        help:  `This command creates a function input with the name you say.`,
        allowed: () => current.type === 'function',
        exec: async args => {
            let before = args;
            let name = list_to_identifier(args);
            let input = {
                type: 'input',
                name,
            };
            for (let i of current.inputs) {
                if (i.name === name) {
                    await error(`Input ${name} already exists for function ${parent_get(data, current).name}`);
                }
            }
            current.inputs.push(input);
            await speak(`Added input: ` + before)
        }
    },
    {
        prefix: 'local',
        help:  `This command creates a local variable with the name you say.`,
        allowed: () => current.type === 'function',
        exec: async args => {
            let name = list_to_identifier(args);
            let input = {
                type: 'local',
                name,
            };
            for (let i of current.locals) {
                if (i.name === name) {
                    await error(`Local ${name} already exists for function ${parent_get(data, current).name}`);
                }
            }
            current.locals.push(input);
        }
    },
    {
        prefix: 'push',
        help:  `This command sets the next argument for the next function call with the value you say.`,
        allowed: () => current.type === 'function',
        exec: value => {
            let step = {
                type: 'push',
                value,
            };
            current.steps.push(step);
        }
    },
    {
        prefix: 'call',
        help:  `This command calls the function you say with any arguments you've supplied from push.`,
        allowed: () => current.type === 'function',
        exec: name => {
            name = list_to_identifier(name)
            let step = {
                type: 'call',
                name,
            };
            current.steps.push(step);
        }
    },
    {
        prefix: 'store',
        help:  `This command sets the variable you say to the value of the most recently called function in this function.`,
        allowed: () => current.type === 'function',
        exec: name => {
            name = list_to_identifier(name)
            let step = {
                type: 'store',
                name,
            };
            current.steps.push(step);
        }
    },
    {
        prefix: 'output',
        help:  `This command sets the function output with the name you say.`,
        allowed: () => current.type === 'function',
        exec: name => {
            name = list_to_identifier(name)
            if (current.output) {
                error(`Output ${name} already exists for function ${parent_get(data, current).name}`);
            }
            let output = {
                type: 'output',
                name,
            };
            current.output = output;
        }
    },
    {
        prefix: 'eval',
        help:  `This command adds a step. You say the string to evaluate in JavaScript when this step is ran.`,
        allowed: () => current.type === 'function',
        exec: remaining => {
            let eval = {
                type: 'eval',
                value: remaining,
            };
            current.steps.push(eval);
        }
    },
    {
        prefix: 'run function',
        help:  `This command runs the function you say. If the function has inputs you will need to set those, first.`,
        allowed: () => true,
        exec: async name => {
            let before = name;
            name = list_to_identifier(name)
            current_set(runner);
            current.function = function_get(name);
            if (!current.function) {
                await error(`No function named: ${before}`);
            }
            current.inputs = [];
            if (current.function.inputs.length === 0) {
                await function_run(current.function, []);
            } else {
                await speak(`Input count is: ${current.function.inputs.length}`);
            }
        }
    },
    {
        prefix: 'say',
        help:  `This command repeats back the words you say. This can be used to test the microphone and speaker.`,
        allowed: () => true,
        exec: async remaining => {
            await speak(remaining.join(' '));
        }
    }
]

function function_new(name) {
    return {
        type: 'function',
        name: name,
        inputs: [],
        locals: [],
        steps: [],
        inners: []
    };
}

function function_inner_get(name) {
    let result;
    for (let f of current.inners) {
        if (f.name === name) {
            result = f;
        }
    }
    return result;
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
