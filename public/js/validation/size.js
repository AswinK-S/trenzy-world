const sizeRadios = document.getElementsByName('size')

function validateSize(){
    console.log('size')
    let sizeSelected =false
    for(const radio of sizeRadios){
        if(radio.checked){
            sizeSelected=true
            break
        }
    }
 if(!sizeSelected){
    const errorMessage =document.getElementById('sizeError')
    errorMessage.textContent='please select suitable size'
    return false
 }

 return true

}

function validateForm1(){
    if(!validateSize()){
        return false
    }
}