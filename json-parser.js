import * as Constants from "./constant.js";

export function parseData(data) {
    // replace all white spaces
    data = replaceWhiteSpace(data);
    const tokens = generateTokens(data)
    console.log(tokens); 
    try {
        analyzeSyntax(tokens, 0);
        return true;
    }
    catch {
        return false;
    }
};


function replaceWhiteSpace (data) {
    data = data.replace(/\s/g, '');
    data = data.replace(/\t/g, '');
    data = data.replace(/\n/g, '');
    return data;
}

function generateTokens(data) {
    let tokens = [];
    for (let i=0; i< data.length; i++) {
        if (data[i] === Constants.RIGHT_CURLY_BRACKET
            || data[i] === Constants.LEFT_CURLY_BRACKET
            || data[i] === Constants.LEFT_SQUARE_BRACKET
            || data[i] === Constants.RIGHT_SQUARE_BRACKET
            || data[i] === Constants.COLON
            || data[i] === Constants.COMA
        ) {
            tokens.push({type: Constants.SYMBOL, value: data[i]});
        }
        else if (data[i] === '"') {
            let value = '';
            let j = i+1;
            while (j < data.length && data[j] !== '"') {
                if (data[j] === '\\') {
                    j++;
                    continue;
                }
                value = value + data[j];
                j++;
            }
            tokens.push({type: Constants.STRING, value: value});
            i=j;
        }
        else if (data[i] === "'") {
            let value = '';
            let j = i+1;
            while (j < data.length && data[j] !== "'") {
                if (data[j] === '\\') {
                    j++;
                    continue;
                }
                value = value + data[j];
                j++;
            }
            tokens.push({type: Constants.STRING, value: value});
            i=j;
        }
        else if (/^[0-9]*$/.test(data[i])) {
            let number = '';
            let j = i;
            while (
                j < data.length 
                && (/^[0-9]*$/.test(data[j]))
            ) {
                number = number + data[j];
                j++;
            }
            tokens.push({type: Constants.NUMBER, value: number});
            i=j-1;
        }
        else if (data[i] === 't') {
            let value = data.slice(i,i+4);
            if (value === Constants.TRUE) {
                i+=3;
                tokens.push({type: Constants.TRUE, value: Constants.TRUE});
            }
            else {
                throw new Error(`Unexpected string: ${value}`);
            }
        }
        else if (data[i] === 'f') {
            let value = data.slice(i,i+5);
            if (value === Constants.FALSE) {
                i+=4;
                tokens.push({type: Constants.FALSE, value: Constants.FALSE});
            }
            else {
                throw new Error(`Unexpected string: ${value}`);
            }
        }
        else if (data[i] === 'n') {
            let value = data.slice(i,i+4);
            if (value === Constants.KEYWORD_NULL) {
                i+=3;
                tokens.push({type: Constants.KEYWORD_NULL, value: Constants.KEYWORD_NULL});
            }
            else {
                throw new Error(`Unexpected string: ${value}`);
            }
        }
        else {
            throw new Error(`Unexpected character: ${data[i]}`);
        }
    }

    return tokens;
}


function analyzeSyntax(tokens, position) {

    if (tokens[position].value !== Constants.LEFT_CURLY_BRACKET) {
        console.error('Json should start with {');
        throw new Error('Json should start with {');
    }
    position++;

    if (tokens[position].value !== Constants.RIGHT_CURLY_BRACKET) {
        position = parseObject(tokens, position);
    }

    if (tokens[position].value !== Constants.RIGHT_CURLY_BRACKET) {
        console.error('Expected a }');
        throw new Error('Expected a }');
    }
    return position;
}

function  parseObject(tokens, position) {

    if (tokens[position].type !== Constants.STRING) {
        console.error('Expected a string key');
        throw new Error('Expected a string key');
    }
    position++;

    if (tokens[position].value !== Constants.COLON) {
        console.error('Expected a colon :');
        throw new Error('Expected a colon :');
    }

    position++;

    if (tokens[position].value === Constants.LEFT_CURLY_BRACKET) {
        position = analyzeSyntax(tokens,position);
    }
    else if (tokens[position].value === Constants.LEFT_SQUARE_BRACKET) {
        position = parseArray(tokens,position);
    }
    else if (
        tokens[position].type !== Constants.TRUE
        && tokens[position].type !== Constants.FALSE
        && tokens[position].type !== Constants.KEYWORD_NULL
        && tokens[position].type !== Constants.STRING
        && tokens[position].type !== Constants.NUMBER
    ) {
        console.error('Expected a value');
        throw new Error('Expected a value');
    }

    position++;

    if (tokens[position].value === Constants.COMA) {
        position++;
        position = parseObject(tokens, position);
    }

    return position;
}

function parseArray(tokens, position) {
    position = parseArrayValues(tokens, position + 1);
    if (tokens[position].value === Constants.RIGHT_SQUARE_BRACKET) {
        return position;
    }
}

function parseArrayValues(tokens, position) {
    if (tokens[position].value === Constants.RIGHT_SQUARE_BRACKET) {
        return position;
    }
    if (
        tokens[position].type === Constants.TRUE
        || tokens[position].type !== Constants.FALSE
        || tokens[position].type !== Constants.KEYWORD_NULL
        || tokens[position].type !== Constants.STRING
        || tokens[position].type !== Constants.NUMBER
    ) {
        position++;
    }
    else if (tokens[position].type === Constants.LEFT_CURLY_BRACKET) {
        position = analyzeSyntax(tokens, position);
    }
    else if (tokens[position].type === Constants.LEFT_SQUARE_BRACKET) {
        position++;
        position = parseArray(tokens, position);
    }
    else {
        console.error('Unexpected array element');
        throw new Error('Unexpected array element');
    }

    if (tokens[position].type === Constants.COMA) {
        position++;
        parseArrayValues(tokens, position);
    }
}