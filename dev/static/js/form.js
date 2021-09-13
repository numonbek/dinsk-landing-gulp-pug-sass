import Inputmask from "inputmask";

// this
class FormManage {
  constructor(el, options) {
    this.form = document.querySelector(el);
    this.options = options;
    this.validateRules = {
      required: "",
    };
  }

  maskInpunt() {
    const masked = this.form.querySelectorAll("[data-mask]");
    for (let i = 0; i < masked.length; i++) {
      if (masked[i].getAttribute("data-mask") === "phone") {
        const im = new Inputmask(this.options.patternMask);
        im.mask(masked[i]);
        if (this.options.usePlaceholder) {
          masked[i].setAttribute("placeholder", this.options.placeholder);
        }
      }
    }
  }

  validateInput() {}

  validate() {
    let value = false
    this.form.querySelectorAll("input").forEach((el) => {
      value = this.checkInputValidate(el);
    });
    return value;
  }
  validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/gmi;
    if (!email.match(re)) {
      console.log(email);
      return false;
    }
    return true;
  }

  checkValidatePhone(phone) {
    // console.log(phone)
    // console.log(phone.match(/^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/))
    if (!phone.match(this.options.regMask)) {
      return false;
    }
    return true;
  }

  setBorderError(input, set) {
      input.classList.add('form-error-border')
  }

  checkInputValidate(input) {

    const isRequired = input.getAttribute("required") && !input.value;
    const typeValidate = input.getAttribute("data-validate");

    if (isRequired) {
      input.nextSibling.innerText = "Заполните поле";
      this.setBorderError(input)
      return false
    } else if (
      typeValidate === "phone" &&
      !this.checkValidatePhone(input.value)
    ) {
      this.setBorderError(input)
      input.nextSibling.innerText = "Введите телефон корректно";
      return false
      // borderError.classList.add("form-error-border");
    }
    else if(!this.validateEmail(input.value) && typeValidate === 'email') {
      input.nextSibling.innerText = "Введите корректный email";
      this.setBorderError(input)
      return false
    }
    else {
      input.nextSibling.innerText = "";
      input.classList.remove('form-error-border')
      return true
    }
  }

  watchInputs() {
    this.form.querySelectorAll("input").forEach((el) => {
      el.addEventListener("input", (e) => {
        this.checkInputValidate(el);
        // this.checkEmail(el);
      });
    });
  }

  submit() {
    const action = this.form.getAttribute("action");
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      console.log(this.validate())
      if(this.validate()) {
        alert('ready to submit')
      }
      else {
        return false;
      }

    });
  }

  init() {
    this.maskInpunt();
    this.validateInput();
    this.watchInputs();
    this.submit();
  }
}

new FormManage(".js-form-main", {
  patternMask: "+7(999) 999-9999",
  placeholder: "+7(___) ___-____",
  usePlaceholder: false,
  regMask: /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/,
}).init();
