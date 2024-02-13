// var express = require("express");
// const adminOrderController = require("../controllers/admin/JewelleryOrderController");


// var router = express.Router();

// const use = (fn) => (req, res, next) =>
//     Promise.resolve(fn(req, res, next)).catch(next);
// router.get(
//     "/getAllOrders/:status",
//     use(adminOrderController.getAllOrders)
// );

// router.put(
//     "/updateOrderStatus/:orderId",
//     use(adminOrderController.updateOrderStatus)
// );
// router.get(
//     "/getAllOnlineOrdersForGstByDateWise/:fromDate/:toDate",
//     use(adminOrderController.getAllOnlineOrdersForGstByDateWise)
// );

// router.get(
//     "/getOrderDetailById/:id",
//     use(adminOrderController.getOrderbyOrderId)
// );

// router.get(
//     "/getAcceptedOrders/:fromDate/:toDate",
//     // useAuth,
//     use(adminOrderController.getAcceptedOrders)
// );

// module.exports = router;