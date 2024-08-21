import axios from 'axios';
import moment from 'moment'
import Noty from 'noty';
import { initAdmin } from './admin'
import { error } from 'laravel-mix/src/Log';
import { init } from '../../app/models/order';
import {initStripe} from './stripe'

let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.querySelector('#cartCounter')

let updateCart = (pizza) => {
    axios.post('/update-cart', pizza).then((res) => {
        cartCounter.innerText = res.data.totalQty
        new Noty({
            progressBar: false,
            timeout: 500,
            text: 'Item Added To Cart',
            type: 'success',
            layout: 'topRight'
        }).show()
    }).catch(err => {
        new Noty({
            progressBar: false,
            timeout: 500,
            text: 'SomeThing Went Wrong',
            type: 'error',
            layout: 'topRight'
        }).show()
    })
}

// addToCart.forEach((btn) => {
//     btn.addEventListener('click', (e) => {
//         e.preventDefault()
//         let pizza = JSON.parse(btn.dataset.pizza)
//         console.log(pizza)
//         updateCart(pizza)
//     })
// })

addToCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const pizzaData = btn.dataset.vegetable;
        if (pizzaData) {
            const pizza = JSON.parse(pizzaData);
            updateCart(pizza);
        } else {
            console.error('No pizza data found. Error in app.js');
        }
    });
});

const alertMsg = document.querySelector('#success-alert')
if (alertMsg) {
    setTimeout(() => {
        alertMsg.remove()
    }, 1000)
}


//Change Order Status
let statuses = document.querySelectorAll('.status_line')
let hiddenInput = document.querySelector('#hiddenInput')
let order = hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)
let time = document.createElement('small')

function updateStatus(order) {
    statuses.forEach((status) => {
        status.classList.remove('step-completed')
        status.classList.remove('current')
    })
    let stepCompleted = true;
    statuses.forEach((status) => {
        let dataProp = status.dataset.status
        if (stepCompleted) {
            status.classList.add('step-completed')
        }
        if (dataProp === order.status) {
            stepCompleted = false
            time.innerText = moment(order.updatedAt).format('hh:mm A')
            status.appendChild(time)
            if (status.nextElementSibling) {
                status.nextElementSibling.classList.add('current')
            }
        }
    })

}

updateStatus(order);

initStripe()

let socket = io()
if (order) {
    socket.emit('join', `order_${order._id}`)
}

let adminAreaPath = window.location.pathname
if (adminAreaPath.includes('admin')) {
    initAdmin(socket)
    socket.emit('join', 'adminRoom')
}

socket.on('orderUpdated', (data) => {
    const updatedOrder = { ...order }
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status
    // console.log(data)
    updateStatus(updatedOrder)
    new Noty({
        progressBar: false,
        timeout: 500,
        text: 'Order Updated',
        type: 'success',
        layout: 'topRight'
    }).show()
})
