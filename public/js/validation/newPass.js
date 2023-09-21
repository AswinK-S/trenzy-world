
const passwordError = document.getElementById("passwordError")
const cPasswordError = document.getElementById("cPasswordError")


const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/

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

function validateForm(){
    if(!validatePassword() || !confirmPassword)
    return false;
}