let currentInput = "";
let answer = document.querySelector(".answer");

numberInputs = document.querySelectorAll("[data-number]");
numberInputs.forEach(number => {
    number.addEventListener('click', inputNumber)
});

function inputNumber(e) {
    currentInput += e.target.innerHTML
    answer.innerHTML = currentInput
}