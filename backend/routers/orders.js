const express = require("express");
const router = express.Router();
const { Order } = require("../models/order");
const { OrderItem } = require("../models/order-item");
const mongoose = require("mongoose");

router.get(`/`, async (req, res) => {
	try {
		const orderList = await Order.find()
			.populate("user", "name")
			.sort({ dateOrdered: -1 });
		if (!orderList) {
			return res.status(500).json({ sucess: false, message: "No data found." });
		} else {
			return res.status(200).send(orderList);
		}
	} catch (err) {
		return res.status(404).json({ sucess: false, error: err });
	}
});

router.get("/:id", async (req, res) => {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) {
			return res.status(400).json({
				sucess: false,
				message: "Invalid Order ID.",
			});
		}
		const order = await Order.findById(req.params.id)
			.populate("user", "name")
			.populate({
				path: "orderItems",
				populate: {
					path: "product",
					populate: "category",
				},
			});
		if (!order) {
			return res.status(500).json({
				sucess: false,
				message: "The order with the given ID was not found.",
			});
		} else {
			return res.status(200).send(order);
		}
	} catch (err) {
		return res.status(404).json({ sucess: false, error: err });
	}
});

router.post("/", async (req, res) => {
	try {
		const orderItemsIds = Promise.all(
			req.body.orderItems.map(async (orderItem) => {
				let newOrderItem = new OrderItem({
					quantity: orderItem.quantity,
					product: orderItem.product,
				});

				newOrderItem = await newOrderItem.save();
				return newOrderItem._id;
			})
		);
		const orderItemsIdsResolved = await orderItemsIds;

		const totalPrices = await Promise.all(
			orderItemsIdsResolved.map(async (orderItemId) => {
				const orderItem = await OrderItem.findById(orderItemId).populate(
					"product",
					"price"
				);
				const totalPrice = orderItem.product.price * orderItem.quantity;
				return totalPrice;
			})
		);

		const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
		let order = new Order({
			orderItems: orderItemsIdsResolved,
			shippingAddress1: req.body.shippingAddress1,
			shippingAddress2: req.body.shippingAddress2,
			city: req.body.city,
			zip: req.body.zip,
			country: req.body.country,
			phone: req.body.phone,
			status: req.body.status,
			totalPrice: totalPrice,
			user: req.body.user,
		});
		order = await order.save();

		if (!order) {
			return res
				.status(500)
				.json({ sucess: false, message: "The order cannot be created." });
		} else {
			return res.status(200).send(order);
		}
	} catch (err) {
		return res.status(404).json({ sucess: false, error: err });
	}
});

router.put("/:id", async (req, res) => {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) {
			return res.status(400).json({
				sucess: false,
				message: "Invalid Order ID.",
			});
		}
		const order = await Order.findByIdAndUpdate(
			req.params.id,
			{
				status: req.body.status,
			},
			{ new: true }
		);
		if (!order) {
			return res
				.status(500)
				.json({ sucess: false, message: "The order cannot be updated." });
		} else {
			return res.status(200).send(order);
		}
	} catch (err) {
		return res.status(404).json({ sucess: false, error: err });
	}
});

router.delete("/:id", async (req, res) => {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) {
			return res.status(400).json({
				sucess: false,
				message: "Invalid Order ID.",
			});
		}
		const order = await Order.findByIdAndRemove(req.params.id);
		if (!order) {
			return res
				.status(500)
				.json({ sucess: false, message: "order not found." });
		} else {
			await order.orderItems.map(async (orderItem) => {
				await OrderItem.findByIdAndRemove(orderItem);
			});
			return res
				.status(200)
				.json({ sucess: true, message: "The order is deleted!" });
		}
	} catch (error) {
		return res.status(404).json({ sucess: false, error: err });
	}
});

router.get("/get/totalsales", async (req, res) => {
	try {
		const totalSales = await Order.aggregate([
			{ $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
		]);

		if (!totalSales) {
			return res.status(500).json({
				sucess: false,
				message: "The order sales cannot be generated",
			});
		} else {
			return res.status(200).json({ totalsales: totalSales.pop().totalsales });
		}
	} catch (err) {
		return res.status(404).json({ sucess: false, error: err });
	}
});

router.get(`/get/count`, async (req, res) => {
	try {
		const orderCount = await Order.countDocuments();

		if (!orderCount) {
			return res.status(500).json({
				sucess: false,
				message: "No data found.",
			});
		} else {
			return res.status(200).json({ orderCount: orderCount });
		}
	} catch (err) {
		return res.status(404).json({ sucess: false, error: err });
	}
});

router.get(`/get/userorders/:userid`, async (req, res) => {
	try {
		if (!mongoose.isValidObjectId(req.params.userid)) {
			return res.status(400).json({
				sucess: false,
				message: "Invalid Order ID.",
			});
		}
		const userOrderList = await Order.find({ user: req.params.userid })
			.populate({
				path: "orderItems",
				populate: {
					path: "product",
					populate: "category",
				},
			})
			.sort({ dateOrdered: -1 });

		if (!userOrderList) {
			res.status(500).json({ success: false, message: "No data found." });
		} else {
			return res.status(200).send(userOrderList);
		}
	} catch (err) {
		return res.status(404).json({ sucess: false, error: err });
	}
});
module.exports = router;
