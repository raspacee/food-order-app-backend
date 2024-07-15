import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import Order from "../models/order";

const getMyRestaurantOrders = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({
      user: req.userId,
    });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const orders = await Order.find({ restaurant: restaurant._id })
      .populate("restaurant")
      .populate("user");

    return res.json(orders);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error getting your restaurant orders" });
  }
};

const createMyRestaurant = async (req: Request, res: Response) => {
  try {
    const existingRestaurant = await Restaurant.findOne({ user: req.userId });
    if (existingRestaurant) {
      return res.status(409).json({
        message: "User restaurant already exists",
      });
    }

    const imageUrl = await uploadImage(req.file as Express.Multer.File);

    const restaurant = new Restaurant(req.body);
    restaurant.imageUrl = imageUrl;
    restaurant.user = new mongoose.Types.ObjectId(req.userId);
    restaurant.lastUpdated = new Date();
    await restaurant.save();

    return res.status(201).send(restaurant);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error creating restaurant",
    });
  }
};

const getMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    return res.json(restaurant);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error getting restaurant info",
    });
  }
};

const updateMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    restaurant.restaurantName = req.body.restaurantName;
    restaurant.city = req.body.city;
    restaurant.country = req.body.country;
    restaurant.deliveryPrice = req.body.deliveryPrice;
    restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
    restaurant.cuisines = req.body.cuisines;
    restaurant.menuItems = req.body.menuItems;
    restaurant.lastUpdated = new Date();

    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      restaurant.imageUrl = imageUrl;
    }

    await restaurant.save();
    return res.status(200).send(restaurant);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error updating restaurant",
    });
  }
};

const uploadImage = async (file: Express.Multer.File) => {
  const image = file;
  const base64image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64image}`;

  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  return uploadResponse.url;
};

const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const restaurant = await Restaurant.findById(order.restaurant);

    if (restaurant?.user?._id.toString() !== req.userId) {
      return res.status(401).send();
    }

    order.status = status;
    await order.save();

    return res.status(200).json(order);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error while updating order status" });
  }
};

export default {
  getMyRestaurantOrders,
  createMyRestaurant,
  getMyRestaurant,
  updateMyRestaurant,
  updateOrderStatus,
};
