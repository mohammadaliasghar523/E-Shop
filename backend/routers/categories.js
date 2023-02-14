const express = require("express");
const router = express.Router();
const { Category } = require("../models/category");
const mongoose = require("mongoose");

router.get(`/`, async (req, res) => {
	try {
		const categoryList = await Category.find();
		//for specific field to get -(minus) _id will neglect
		// const categoryList = await Category.find().select("name icon -_id");

		if (!categoryList) {
			return res.status(500).json({ sucess: false, message: "No data found." });
		} else {
			return res.status(200).send(categoryList);
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
				message: "Invalid Category ID.",
			});
		}
		const category = await Category.findById(req.params.id);
		if (!category) {
			return res.status(500).json({
				sucess: false,
				message: "The category with the given ID was not found.",
			});
		} else {
			return res.status(200).send(category);
		}
	} catch (err) {
		return res.status(404).json({ sucess: false, error: err });
	}
});

router.post("/", async (req, res) => {
	try {
		let category = new Category({
			name: req.body.name,
			icon: req.body.icon,
			color: req.body.color,
		});
		category = await category.save();

		if (!category) {
			return res
				.status(500)
				.json({ sucess: false, message: "The category cannot be created." });
		} else {
			return res.status(200).send(category);
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
				message: "Invalid Category ID.",
			});
		}
		const category = await Category.findByIdAndUpdate(
			req.params.id,
			{
				name: req.body.name,
				icon: req.body.icon,
				color: req.body.color,
			},
			{ new: true }
		);
		if (!category) {
			return res
				.status(500)
				.json({ sucess: false, message: "The category cannot be updated." });
		} else {
			return res.status(200).send(category);
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
				message: "Invalid Category ID.",
			});
		}
		const category = await Category.findByIdAndRemove(req.params.id);
		if (!category) {
			return res
				.status(500)
				.json({ sucess: false, message: "Category not found." });
		} else {
			return res
				.status(200)
				.json({ sucess: true, message: "The category is deleted!" });
		}
	} catch (error) {
		return res.status(404).json({ sucess: false, error: err });
	}
});

module.exports = router;
