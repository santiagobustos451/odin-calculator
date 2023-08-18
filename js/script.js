class Entry {
    type;
    content;

    constructor(type,content,isPercent = false){
        this.type = type;
        this.content = content;
        if(isPercent){
            this.isPercent = isPercent;
        }
    }
}

let currentInput = "";
let currentInputNegative = false;
let currentInputPercent = false;
let lastAnswer = "";
let operationHistory = [];
let answer = document.querySelector(".answer");
let operation = document.querySelector(".operation");
let result = "";

let showingResult = false;

numberInputs = document.querySelectorAll("[data-number]");
numberInputs.forEach(number => {
    number.addEventListener('click', inputNumber)
});

operatorInputs = document.querySelectorAll("[data-operator]");
operatorInputs.forEach(number => {
    number.addEventListener('click', inputOperator)
});

function inputNumber(e) {
    if(isLastEquals()) clearHistory();

    if(operationHistory[operationHistory.length - 1]?.type === "number") return;

    if(e.target.innerHTML === "." && currentInput.includes(".")) return;

    if(showingResult) {
        showingResult = false;
        clearHistory();
    }

    currentInput += e.target.innerHTML;

    updateScreen();
}

function inputOperator(e) {
    console.log(operationHistory[operationHistory.length - 1]);

    switch(e.target.innerHTML){
        case "+/-":
            currentInputNegative = !currentInputNegative;

            if(currentInputNegative) currentInputPercent = false;
            break;
        case "%":
            currentInputPercent = !currentInputPercent;

            if(currentInputPercent) currentInputNegative = false;
            break;
        case "+":
        case "-":
        case "*":
        case "/":
            if(currentInput === "" && !showingResult && operationHistory[operationHistory.length - 1].content !== ")" && operationHistory[operationHistory.length - 1]?.type !== "number") return;
            
            if(showingResult) {
                currentInput = result;
                showingResult = false;
            }

            addNumber(currentInput);
            opEntry = new Entry("operator", e.target.innerHTML);
            operationHistory.push(opEntry)

            currentInput = "";

            break;
        case ")":
            if(currentInput === "") return;
            if(findOpenPar()){
                addNumber(currentInput);

                opEntry = new Entry("operator", e.target.innerHTML);
                operationHistory.push(opEntry)

                currentInput = "";
            }
            break;
        case "(":
            opEntry = new Entry("operator", e.target.innerHTML);
            operationHistory.push(opEntry)

            break;
        case "AC":
            clearHistory();
            clearScreen();
            break;
        case "CE":
            if(currentInput === ""){
                operationHistory.pop();
            } else if(operationHistory[operationHistory.length - 1].content === "=") {
                operationHistory = operationHistory.slice(0,operationHistory.length - 2);
                currentInput = "";
            } else {
                currentInput = "";
            }
            break;
        case "=":
            if(currentInput === "" && operationHistory[operationHistory.length - 1].content !== ")") return;

            addNumber(currentInput);

            while(findOpenPar()) {
                operationHistory.push(new Entry("operator", ")"));
            }
            
            opEntry = new Entry("operator", e.target.innerHTML);;
            operationHistory.push(opEntry);

            result = operate(operationHistory);
            currentInput = "";
            showingResult = true;
            break;
    }

    //console.log(currentOperation);

    updateScreen();
}

function isLastEquals(){

    return operationHistory[operationHistory.length - 1]?.operator === "=";
}

function addNumber(input){

    if(currentInputNegative) input = "-" + input;
    if(currentInputPercent) input = input * 0.01;

    numEntry = new Entry("number", input, currentInputPercent);
    if(numEntry.content !== "") operationHistory.push(numEntry);

    currentInputNegative = false;
    currentInputPercent = false;
}

function clearHistory(){
    operationHistory = [];
    currentInput = "";
    currentInputNegative = false;
    result = "";
    showingResult = false;
}

function clearScreen(){
    answer.innerHTML = "";
    operation.innerHTML = "";
}

function updateScreen(){
    clearScreen();

    operationHistory.forEach(step => {
        if(step.type === "number" && parseFloat(step.content) < 0){
            text = ` (- ${-step.content})`;
        } else if(step.type === "number" && step.isPercent){
            text = ` (${step.content*100} %)`;
        } else {
            text = ` ${step.content}`;
        }       

        operation.innerHTML += text;
    })

    answer.innerHTML = showingResult ? result : currentInput;

    if(!showingResult){
        if(currentInputNegative) answer.innerHTML = `(- ${currentInput})`;
        if(currentInputPercent) answer.innerHTML = `(${currentInput} %)`;
    }
}

function findOpenPar(){
    parBeginCount = operationHistory.reduce((accumulator,currentPar) => {
        if(currentPar.content === "(") accumulator ++;
        return accumulator;
    },0)
    parEndCount = operationHistory.reduce((accumulator,currentPar) => {
        if(currentPar.content === ")") accumulator ++;
        return accumulator;
    },0)

    return parBeginCount > parEndCount;
    
}

function operate(history){
    let parsedHistory = history;


    parsedHistory = parseEquals(parsedHistory);

    parsedHistory = parseParenthesis(parsedHistory);

    parsedHistory = parseMultiplication(parsedHistory);

    parsedHistory = parseDivision(parsedHistory);

    parsedHistory = parseAdition(parsedHistory);

    return parsedHistory;
}

function parseEquals(history) {
    reversedHistory = [...history].reverse().slice(1);

    console.log(reversedHistory);

    lastEqualsIndex = reversedHistory.findIndex(entry => entry.content === "=");

    return lastEqualsIndex !== -1 ? history.slice(-(lastEqualsIndex + 1)) : history;
}

function parseParenthesis(history) {
    if(history.every(entry => entry.content != "(" && entry.content != ")")) return history;

    lastBeginParIndex = history.slice(0).reverse().findIndex(entry => entry.content === "(");
    lastBeginParIndex = history.length - lastBeginParIndex - 1;
    nextEndParIndex = history.slice(lastBeginParIndex).findIndex(entry => entry.content === ")") + lastBeginParIndex;

    parResult = operate(history.slice(lastBeginParIndex + 1, nextEndParIndex));
    replacedHistory = [...history.slice(0,lastBeginParIndex), new Entry("number", parResult), ...history.slice(nextEndParIndex + 1, history.length)];

    return parseParenthesis(replacedHistory);
}

function parseMultiplication(history) {
    if(history.every(entry => entry.content != "*")) return history;

    multIndex = history.findIndex(entry => entry.content === "*");

    multResult = history[multIndex -1].content * history[multIndex+1].content;
    replacedHistory = [...history.slice(0,multIndex - 1), new Entry("number", multResult), ...history.slice(multIndex + 2, history.length)];

    return parseMultiplication(replacedHistory);
}

function parseDivision(history) {
    if(history.every(entry => entry.content != "/")) return history;

    divIndex = history.findIndex(entry => entry.content === "/");

    divResult = history[divIndex -1].content / history[divIndex+1].content;
    replacedHistory = [...history.slice(0,divIndex - 1), new Entry("number", divResult), ...history.slice(divIndex + 2, history.length)];

    return parseDivision(replacedHistory);
}

function parseAdition(history) {
    if(history.length === 1) return history[0].content;

    replacedHistory = [...history].reduce((accumulator, number, index) => {

        if(number.type === "operator") return accumulator;

        switch(history[index - 1]?.content){
            case "+":
            case undefined:
                return accumulator + parseFloat(number.content);
            case "-":
                return accumulator - parseFloat(number.content);
        }

        //Treats two numbers together as a multiplication

        return accumulator * number.content;
    }, 0)

    return replacedHistory;
}

/*testHistory = [
    {type: "number", content:"10"},
    {type: "operator", content:"*"},
    {type: "number", content:"-2"},
    {type: "operator", content:"*"},
    {type: "number", content:"2"},
    {type: "operator", content:"+"},
    {type: "number", content:"2"},
]

console.log(testHistory);
console.log(operate(testHistory));*/

