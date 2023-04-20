import axios from 'axios'
import Noty from 'noty'
import { initAdmin } from './admin.js'

let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.querySelector('#cartCounter')

function updateCart(vegetable){
    //calling axios for sending data to server/database/cart
    axios.post('/update-cart',vegetable).then(res=>{
        cartCounter.innerText = res.data.totalQty
        new Noty({
            type: 'success',
            timeout: 800,
            text:'Item added to cart',
            progressBar: false,

        }).show();
    }).catch(err=>{
        new Noty({
            type: 'error',
            timeout:800,
            text:'something went wrong',
            progressBar:false,

        }).show();
    })
}

addToCart.forEach((btn)=>{
    btn.addEventListener('click',(e)=>{
        let vegetable = JSON.parse(btn.dataset.vegetable)
        updateCart(vegetable)

    })
})

//remove alert message after x seconds 
const alertMsg = document.querySelector('#success-alert')
if(alertMsg){
    setTimeout(() => {
        alertMsg.remove()
    }, 2000)
}

initAdmin()