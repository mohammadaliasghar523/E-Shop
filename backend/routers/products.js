const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();
const mongoose = require("mongoose");
const { Product } = require("../models/product");
const multer = require("multer");

const FILE_TYPE_MAP = {
	"image/png": "png",
	"image/jpeg": "jpeg",
	"image/jpg": "jpg",
};

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const isValid = FILE_TYPE_MAP[file.mimetype];
		let uploadError = new Error("invalid image type");

		if (isValid) {
			uploadError = null;
		}
		cb(uploadError, "public/uploads");
	},
	filename: function (req, file, cb) {
		const fileName = file.originalname.split(" ").join("-");
		const extension = FILE_TYPE_MAP[file.mimetype];
		cb(null, `${fileName}-${Date.now()}.${extension}`);
	},
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
	let filter = {};
	try {
		if (req.query.categories) {
			filter = { category: req.query.categories.split(",") };
		}
		const productList = await Product.find(filter).populate("category");

		if (!productList) {
			return res
				.status(500)
				.json({ success: false, message: "No data found." });
		} else {
			return res.status(200).send(productList);
		}
	} catch (err) {
		return res.status(404).json({ sucess: false, error: err });
	}
});

router.get(`/:id`, async (req, res) => {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) {
			return res.status(400).json({
				sucess: false,
				message: "Invalid Product ID.",
			});
		}
		const product = await Product.findById(req.params.id).populate("category");

		if (!product) {
			return res.status(500).json({
				sucess: false,
				message: "The product with the given ID was not found.",
			});
		} else {
			return res.status(200).send(product);
		}
	} catch (err) {
		return res.status(404).json({ sucess: false, error: err });
	}
});

router.post(`/`, uploadOptions.single("image"), async (req, res) => {
	try {
		const category = await Category.findById(req.body.category);
		if (!category) {
			return res
				.status(400)
				.json({ success: false, message: "Invalid Category" });
		}
		const file = req.file;
		if (!file)
			return res
				.json(400)
				.send({ success: false, message: "No image in the request" });

		const fileName = req.file.filename;
		const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
		let product = new Product({
			name: req.body.name,
			description: req.body.description,
			richDescription: req.body.richDescription,
			image: `${basePath}${fileName}`,
			brand: req.body.brand,
			price: req.body.price,
			category: req.body.category,
			countInStock: req.body.countInStock,
			rating: req.body.rating,
			numReviews: req.body.numReviews,
			isFeatured: req.body.isFeatured,
		});
		product = await product.save();
		if (!product) {
			return res
				.status(500)
				.send({ sucess: false, message: "The product cannot be created" });
		} else {
			return res.status(200).send(product);
		}
	} catch (err) {
		return res.status(404).send({ success: false, error: err });
	}
});

router.put("/:id", uploadOptions.single("image"), async (req, res) => {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) {
			return res.status(400).json({
				sucess: false,
				message: "Invalid Product ID.",
			});
		}
		const category = await Category.findById(req.body.category);
		if (!category) {
			return res
				.status(400)
				.send({ success: false, message: "Invalid Category" });
		}
		const file = req.file;
		let imagepath;

		if (file) {
			const fileName = file.filename;
			const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
			imagepath = `${basePath}${fileName}`;
		} else {
			imagepath = product.image;
		}
		const updatedProduct = await Product.findByIdAndUpdate(
			req.params.id,
			{
				name: req.body.name,
				description: req.body.description,
				richDescription: req.body.richDescription,
				image: req.body.image,
				brand: req.body.brand,
				price: req.body.price,
				category: req.body.category,
				countInStock: req.body.countInStock,
				rating: req.body.rating,
				numReviews: req.body.numReviews,
				isFeatured: req.body.isFeatured,
			},
			{ new: true }
		);
		if (!updatedProduct) {
			return res
				.status(500)
				.json({ sucess: false, message: "The product cannot be updated." });
		} else {
			return res.status(200).send(updatedProduct);
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
				message: "Invalid Product ID.",
			});
		}
		const product = await Product.findByIdAndRemove(req.params.id);
		if (!product) {
			return res
				.status(500)
				.json({ sucess: false, message: "Product not found." });
		} else {
			return res
				.status(200)
				.json({ sucess: true, message: "The product is deleted!" });
		}
	} catch (err) {
		return res.status(404).json({ sucess: false, error: err });
	}
});

router.get(`/get/count`, async (req, res) => {
	try {
		const productCount = await Product.countDocuments();

		if (!productCount) {
			return res.status(500).json({
				sucess: false,
				message: "No data found.",
			});
		} else {
			return res.status(200).json({ productCount: productCount });
		}
	} catch (err) {
		return res.status(404).json({ sucess: false, error: err });
	}
});

router.get(`/get/featured/:count`, async (req, res) => {
	const count = req.params.count ? req.params.count : 0;

	try {
		const products = await Product.find({ isFeatured: true }).limit(+count);

		if (!products) {
			return res.status(500).json({
				sucess: false,
				message: "No data found.",
			});
		} else {
			return res.status(200).json(products);
		}
	} catch (err) {
		return res.status(404).json({ sucess: false, error: err });
	}
});

router.put(
	`/gallery-images/:id`,
	uploadOptions.array("images", 10),
	async (req, res) => {
		try {
			if (!mongoose.isValidObjectId(req.params.id)) {
				return res.status(400).json({
					sucess: false,
					message: "Invalid Product ID.",
				});
			}
			const files = req.files;
			let imagesPaths = [];
			const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

			if (files) {
				files.map((file) => {
					imagesPaths.push(`${basePath}${file.filename}`);
				});
			}

			const product = await Product.findByIdAndUpdate(
				req.params.id,
				{
					images: imagesPaths,
				},
				{ new: true }
			);

			if (!product) {
				return res
					.status(500)
					.json({ sucess: false, message: "The gallery cannot be updated!" });
			} else {
				return res.status(200).send(product);
			}
		} catch (err) {
			return res.status(404).json({ sucess: false, error: err });
		}
	}
);
module.exports = router;
