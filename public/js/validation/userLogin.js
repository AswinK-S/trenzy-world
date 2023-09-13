const emailError = document.getElementById("emailError")
const passwordError = document.getElementById("passwordError")



const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/

function validateEmail(){
    let email = document.getElementById('email').value
    if(email.length ===0){
        emailError.innerHTML = "please enter the email"
        return false
    }
    if(!email.match(emailRegex)){
        emailError.innerHTML ="please enter the correct format email"
        return false
    }
    emailError.innerHTML = ""
    return true
}

function validatePassword(){
    let password = document.getElementById('password').value

    if(password.length<8 || password.length==0){
        passwordError.innerHTML = "password must be 8 characters"
        return false
    }
    passwordError.innerHTML =""
    return true
}

function validateForm(){
    if(!validateEmail() || !validatePassword()){
        return false
    }
}