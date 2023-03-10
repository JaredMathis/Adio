
function parent_get(root, item) {
    let result;
    let found = false;
    traverse(root, (v) => {
        let {parent, node} = v;
        if (node === item) {
            result = parent;
            found = true;
        }
    })
    assert(found);
    return result;
}

function traverse(root, for_each, stack) {
    if (!stack) {
        stack = [];
    }
    for_each({node:root, parent:stack[stack.length - 1]});
    if (typeof root !== typeof '') {
        stack.push(root);
        for (let key of Object.keys(root)) {
            let node = root[key];
            traverse(node, for_each, stack);
        }
        stack.pop();
    }
}

function list_prefix_is(list, prefix_candidate) {
    for (let i = 0; i < prefix_candidate.length; i++) {
        if (list[i] !== prefix_candidate[i]) {
            return false;
        }
    }
    return true;
}

function list_string_non_empty(s) {
    return s.filter(i => i.length > 0)
}

function string_split_by_whitespace(s) {
    return s.split(/\s/)
}

function identifier_to_string(i) {
    return i.split('_').join(' ')
}

function assert(condition) {
    if (!condition) {
        throw new Error('error assert ');
    }
}