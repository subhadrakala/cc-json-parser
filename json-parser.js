import * as Constants from "./constant.js";

/*
Function to find if a json is valid

Input: 
    data: json string

Output:
    true or false
*/
export function parseData(data) {
    // replace all white spaces
    data = replaceWhiteSpace(data);
    try {
        const tokens = generateTokens(data)
        analyzeSyntax(tokens, 0);
        return true;
    }
    catch {
        return false;
    }
};

/*
Function replace white space and new line

Input: 
    data: json string

Output:
    json string
*/
function replaceWhiteSpace (data) {
    data = data.replace(/\s/g, '');
    data = data.replace(/\t/g, '');
    data = data.replace(/\n/g, '');
    return data;
}

/*
Split a json string to meaningfull
tokens

Input: 
    data: json string

Output:
    array of tokens
*/

export function generateTokens(data) {
    let tokens = [];

    for (let i=0; i< data.length; i++) {

        if (data[i] === Constants.RIGHT_CURLY_BRACKET
            || data[i] === Constants.LEFT_CURLY_BRACKET
            || data[i] === Constants.LEFT_SQUARE_BRACKET
            || data[i] === Constants.RIGHT_SQUARE_BRACKET
            || data[i] === Constants.COLON
            || data[i] === Constants.COMA
        ) {
            tokens.push(data[i]);
        }
        else if (data[i] === '"') {
            // extract string
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
            tokens.push(Constants.STRING);
            i=j;
        }
        else if (/^[0-9]*$/.test(data[i])) {
            // extract number
            let number = '';
            let j = i;
            while (
                j < data.length 
                && (/^[0-9]*$/.test(data[j]))
            ) {
                number = number + data[j];
                j++;
            }
            tokens.push(Constants.NUMBER);
            i=j-1;
        }
        else if (data[i] === 't') {
            // Check keyword true
            let value = data.slice(i,i+4);
            if (value === Constants.TRUE) {
                i+=3;
                tokens.push(Constants.TRUE);
            }
            else {
                console.error(`Unexpected string: ${value}`);
                throw new Error(`Unexpected string: ${value}`);
            }
        }
        else if (data[i] === 'f') {
            // Check keyword false
            let value = data.slice(i,i+5);
            if (value === Constants.FALSE) {
                i+=4;
                //tokens.push({type: Constants.FALSE, value: Constants.FALSE});
                tokens.push(Constants.FALSE);
            }
            else {
                console.error(`Unexpected string: ${value}`);
                throw new Error(`Unexpected string: ${value}`);
            }
        }
        else if (data[i] === 'n') {
            // Check keyword null
            let value = data.slice(i,i+4);
            if (value === Constants.KEYWORD_NULL) {
                i+=3;
                tokens.push(Constants.KEYWORD_NULL);
            }
            else {
                console.error(`Unexpected string: ${value}`);
                throw new Error(`Unexpected string: ${value}`);
            }
        }
        else {
            console.error(`Unexpected character: ${data[i]}`);
            throw new Error(`Unexpected character: ${data[i]}`);
        }
    }

    return tokens;
}

/* 
Analyze if the given set of tokens
has valid json syntax
*/

export function analyzeSyntax(tokens, position) {

    // Json should start with {
    if (tokens[position] !== Constants.LEFT_CURLY_BRACKET) { 
        console.error('Json should start with {');
        throw new Error('Json should start with {');
    }
    position++;

    // parse the contents inside { if its not empty
    if (tokens[position] !== Constants.RIGHT_CURLY_BRACKET) {
        position = parseObject(tokens, position);
    }

    // Json should end with }
    if (tokens[position] !== Constants.RIGHT_CURLY_BRACKET) {
        console.error('Expected a }');
        throw new Error('Expected a }');
    }

    return position;
}

/* 
Parse key : values 
*/
function parseObject(tokens, position) {

    // Inside, we should have key : value format
    if (tokens[position] !== Constants.STRING) {
        console.error('Expected a string key');
        throw new Error('Expected a string key');
    }
    position++;

    if (tokens[position] !== Constants.COLON) {
        console.error('Expected a colon :');
        throw new Error('Expected a colon :');
    }

    position++;

    // nested Json usecase
    if (tokens[position] === Constants.LEFT_CURLY_BRACKET) {
        position = analyzeSyntax(tokens,position);
    }
    else if (tokens[position] === Constants.LEFT_SQUARE_BRACKET) {
        // Array as value
        position = parseArray(tokens,position);
    }
    else if (
        tokens[position] !== Constants.TRUE
        && tokens[position] !== Constants.FALSE
        && tokens[position] !== Constants.KEYWORD_NULL
        && tokens[position] !== Constants.STRING
        && tokens[position] !== Constants.NUMBER
    ) {
        console.error('Expected a value');
        throw new Error('Expected a value');
    }

    position++;

    // We need to again check for key: value if we
    // encounter a coma
    if (tokens[position] === Constants.COMA) {
        position++;
        position = parseObject(tokens, position);
    }

    return position;
}

/* 
Ensures input has proper array format
*/
export function parseArray(tokens, position) {
    position++;
    // Parse array elements if its not empty
    if (tokens[position] !== Constants.RIGHT_SQUARE_BRACKET) {
        position = parseArrayValues(tokens, position);
    }

    // Array ends with right square bracket ]
    if (tokens[position] === Constants.RIGHT_SQUARE_BRACKET) {
        return position;
    }
    else {
        console.error('Expected a right square bracket');
        throw new Error('Expected a right square bracket');
    }
}

function parseArrayValues(tokens, position) {
    
    if (
        tokens[position] === Constants.TRUE
        || tokens[position] === Constants.FALSE
        || tokens[position] === Constants.KEYWORD_NULL
        || tokens[position] === Constants.STRING
        || tokens[position] === Constants.NUMBER
    ) {
        position++;
    }
    else if (tokens[position] === Constants.LEFT_CURLY_BRACKET) {
        // Json objects inside array
        position = analyzeSyntax(tokens, position);
        position++;
    }
    else if (tokens[position] === Constants.LEFT_SQUARE_BRACKET) {
        // Nested arrays
        position = parseArray(tokens, position);
        position++;
    }
    else {
        console.error('Unexpected array element');
        throw new Error('Unexpected array element');
    }

    if (tokens[position] === Constants.COMA) {
        // Array must contain some element if we
        // encounter a coma
        position++;
        position = parseArrayValues(tokens, position);
    }

    return position;
}