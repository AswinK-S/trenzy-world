const fnameError = document.getElementById("fnameError")
const lnameError = document.getElementById("lnameError")
const mobileError = document.getElementById("phoneError")
const emailError = document.getElementById("emailError")
const passwordError = document.getElementById("passwordError")
const cPasswordError = document.getElementById("cPasswordError")

const nameRegex = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;
const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/

//fname
function validateName1() {
    let name = document.getElementById("name").value

    if (name.length === 0) {
        fnameError.innerHTML = "Name required!";
        return false;
    }
    if (!name.match(nameRegex)) {
        fnameError.innerHTML = "Only letters are allowed";
        return false;
    }
    fnameError.innerHTML = "";
    return true;
}
//lname
function validateName2() {
    let name = document.getElementById("lastName").value
    if (name.length === 0) {
        lnameError.innerHTML = "Last Name required!";
        return false;
    }
    if (!name.match(nameRegex)) {
        lnameError.innerHTML = "Only letters are allowed";
        return false;
    }
    lnameError.innerHTML = "";
    return true;
}

function validateEmail() {
    let email = document.getElementById("email").value;
    if (email.length === 0) {
        emailError.innerHTML = "Email required!";
        return false;
    }
    if (!email.match(emailRegex)) {
        emailError.innerHTML = "Enter a valid email";

        return false;
    }
    emailError.innerHTML = "";
    return true;
}

function validateMobile() {
    let mobile = document.getElementById('phone').value

    if (mobile.length === 0) {
        mobileError.innerHTML = "Mobile required!";
        return false;
    }
    if (!mobile.match(phoneRegex)) {
        mobileError.innerHTML = 'Enter a valid mobile no.'
        return false
    }
    mobileError.innerHTML = ""
    return true
}

function validatePassword() {
    let password = document.getElementById("password").value
    if (password.length === 0) {
        passwordError.innerHTML = "Password required!";
        return false;
    }
    if (!password.match(passwordRegex)) {
        passwordError.innerHTML = 'Invalid password'
        return false
    }
    passwordError.innerHTML = ''
    return true
}
function confirmPassword() {
    let password = document.getElementById("password").value
    let cPassword = document.getElementById("confirmPassword").value
    if (cPassword.length === 0) {
        cPasswordError.innerHTML = "Password required!";
        return false;
    }
    if (password !== cPassword) {

        cPasswordError.innerHTML = `Passwords doesn't match`
        return false
    }
    cPasswordError.innerHTML = ""
    return true
}



function validateForm() {
    if (!validateName1() || !validateName2() || !validateEmail() || !validateMobile() || !validatePassword()||!confirmPassword()) {
        return false;
    }
}
