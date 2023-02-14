const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

require("dotenv/config");

router.get(`/`, async (req, res) => {
	try {
		const userList = await User.find().select("-passwordHash");

		if (!userList) {
			return res.status(500).json({ sucess: false, message: "No data found." });
		} else {
			return res.status(200).send(userList);
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
				message: "Invalid User ID.",
			});
		}
		const user = await User.findById(req.params.id).select("-passwordHash");
		if (!user) {
			return res.status(500).json({
				sucess: false,
				message: "The user with the given ID was not found.",
			});
		} else {
			return res.status(200).send(user);
		}
	} catch (err) {
		return res.status(404).json({ sucess: false, error: err });
	}
});

router.post("/", async (req, res) => {
	try {
		const salt = process.env.SALT;
		let user = new User({
			name: req.body.name,
			email: req.body.email,
			passwordHash: bcrypt.hashSync(req.body.passwordHash, +salt),
			phone: req.body.phone,
			isAdmin: req.body.isAdmin,
			street: req.body.street,
			apartment: req.body.apartment,
			zip: req.body.zip,
			city: req.body.city,
			country: req.body.country,
		});
		user = await user.save();

		if (!user) {
			return res
				.status(500)
				.json({ sucess: false, message: "The user cannot be created." });
		} else {
			return res.status(200).send(user);
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
				message: "Invalid User ID.",
			});
		}
		const userExist = await User.findById(req.params.id);
		let newPassword;
		if (req.body && req.body.password) {
			const salt = process.env.SALT;
			newPassword = bcrypt.hashSync(req.body.password, +salt);
		} else {
			newPassword = userExist.password;
		}
		const user = await User.findByIdAndUpdate(
			req.params.id,
			{
				name: req.body.name,
				email: req.body.email,
				passwordHash: newPassword,
				phone: req.body.phone,
				isAdmin: req.body.isAdmin,
				street: req.body.street,
				apartment: req.body.apartment,
				zip: req.body.zip,
				city: req.body.city,
				country: req.body.country,
			},
			{ new: true }
		);
		if (!user) {
			return res
				.status(500)
				.json({ sucess: false, message: "The user cannot be updated." });
		} else {
			return res.status(200).send(user);
		}
	} catch (err) {
		return res.status(404).json({ sucess: false, error: err });
	}
});

router.post("/login", async (req, res) => {
	try {
		const secret = process.env.SECRET_KEY;

		const user = await User.findOne({ email: req.body.email });

		if (!user) {
			return res.status(500).json({
				sucess: false,
				message: "The user not found.",
			});
		} else {
			if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
				const token = jwt.sign(
					{
						userId: user.id,
						isAdmin: user.isAdmin,
					},
					secret,
					{ expiresIn: "1d" }
				);
				return res.status(200).json({
					user: user.email,
					token: token,
				});
			} else {
				return res.status(400).json({
					sucess: false,
					message: "Password is wrong.",
				});
			}
		}
	} catch (err) {
		return res.status(404).json({ sucess: false, error: err });
	}
});

router.post("/register", async (req, res) => {
	try {
		const salt = process.env.SALT;
		let user = new User({
			name: req.body.name,
			email: req.body.email,
			passwordHash: bcrypt.hashSync(req.body.passwordHash, +salt),
			phone: req.body.phone,
			isAdmin: req.body.isAdmin,
			street: req.body.street,
			apartment: req.body.apartment,
			zip: req.body.zip,
			city: req.body.city,
			country: req.body.country,
		});
		user = await user.save();

		if (!user) {
			return res
				.status(500)
				.json({ sucess: false, message: "The user cannot be created." });
		} else {
			return res.status(200).send(user);
		}
	} catch (err) {
		return res.status(404).json({ sucess: false, error: err });
	}
});

router.get(`/get/count`, async (req, res) => {
	try {
		const userCount = await User.countDocuments();

		if (!userCount) {
			return res.status(500).json({
				sucess: false,
				message: "No data found.",
			});
		} else {
			return res.status(200).json({ userCount: userCount });
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
				message: "Invalid User ID.",
			});
		}
		const user = await User.findByIdAndRemove(req.params.id);
		if (!user) {
			return res
				.status(500)
				.json({ sucess: false, message: "User not found." });
		} else {
			return res
				.status(200)
				.json({ sucess: true, message: "The user is deleted!" });
		}
	} catch (err) {
		return res.status(404).json({ sucess: false, error: err });
	}
});

module.exports = router;
