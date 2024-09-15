const form = document.querySelector("form");
const inputs = document.querySelectorAll("input");
const submitButton = document.querySelector("button[type='submit']");
const iconInputsContainer = document.querySelectorAll(
  "div.icon-group-container",
);
const cardNumberInput = document.querySelector("#card-number");
const expirationDateInput = document.querySelector("#expiration");
const CVVInput = document.querySelector("#cvv");
const cardImgElement = document.querySelector("#card-icon");

const visaIcon = "./icons/visa.svg";
const mastercardIcon = "./icons/mastercard.svg";
const defaultCardIcon = "./icons/credit-card.png";

const cleaveCC = new Cleave(cardNumberInput, {
  creditCard: true,
  delimiter: " ",
  onCreditCardTypeChanged: function (type) {
    switch (type) {
      case "visa":
        cardImgElement.src = visaIcon;
        break;
      case "mastercard":
        cardImgElement.src = mastercardIcon;
        break;
      default:
        cardImgElement.src = defaultCardIcon;
        break;
    }
  },
});

const cleaveExpiration = new Cleave(expirationDateInput, {
  date: true,
  datePattern: ["m", "y"],
});

const cleaveCVV = new Cleave(CVVInput, {
  numeralPositiveOnly: true,
  blocks: [3],
});

inputs.forEach((input) => {
  input.addEventListener("focus", () => {
    input.classList.remove("empty");
    if (input.parentElement.classList.contains("icon-group")) {
      input.parentElement.classList.remove("empty");
      input.parentElement.classList.add("filling");
      input.style.boxShadow = "none";
    }
    input.classList.add("filling");
    checkInputsFilled();
  });
  input.addEventListener("input", () => {
    input.classList.remove("empty");
    if (input.parentElement.classList.contains("icon-group")) {
      input.parentElement.classList.remove("empty");
      input.parentElement.classList.add("filling");
      input.style.boxShadow = "none";
    }
    input.classList.add("filling");

    checkInputsFilled();
  });

  input.addEventListener("focusout", () => {
    if (!input.value) {
      input.classList.remove("filling");
      if (input.parentElement.classList.contains("icon-group")) {
        input.parentElement.classList.remove("filling");
        input.parentElement.classList.add("empty");
      }
      input.classList.add("empty");
    }
    checkInputsFilled();
  });

  input.addEventListener("input", () => {
    if (!input.value) {
      input.classList.remove("filling");
      if (input.parentElement.classList.contains("icon-group")) {
        input.parentElement.classList.remove("filling");
        input.parentElement.classList.add("empty");
      }
      input.classList.add("empty");
    }
  });
});

function checkInputsFilled() {
  let inputsArray = Array.from(inputs);
  let result = inputsArray.map((input) => {
    if (input.value === "") {
      return false;
    } else {
      return true;
    }
  });
  let inputsFilled = result.every((input) => input === true);
  if (inputsFilled) {
    submitButton.classList.remove("disabled");
    submitButton.removeAttribute("disabled");
  } else {
    submitButton.classList.add("disabled");
    submitButton.setAttribute("disabled", "");
  }
}

submitButton.addEventListener("click", (e) => {
  e.preventDefault();
});
