// const Order = require('../../../models/order')

// function orderController() {
//     return {
//         async index(req, res) {
//             await Order.find({ status: { $ne: 'completed' } }, null, { sort: { createdAt: -1 } }).
//                 populate('customerId', '-password').exec()
//                     if (req.xhr) {
//                         return res.json(Order)
//                     }
//                     return res.render('admin/orders')
                
//         }
//     }
// }

// module.exports = orderController


const Order = require('../../../models/order');

function orderController() {
    return {
        async index(req, res) {
            try {
                const orders = await Order.find({ status: { $ne: 'completed' } }, null, { sort: { createdAt: -1 } })
                    .populate('customerId', '-password')
                    .exec();
                if (req.xhr) {
                    return res.json(orders);
                }
                return res.render('admin/orders', { Order });
            } catch (err) {
                console.log(err);
                return res.redirect('/');
            }
        }
    }
}

module.exports = orderController;