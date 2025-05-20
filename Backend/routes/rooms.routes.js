const express = require("express");
const router = express.Router();
const controller = require("../controllers/index.controller");

// Create Department
router.post("/create-room", controller.rooms.createRooms);

// Get All rooms
router.get("/get-rooms", controller.rooms.getAllRooms);

// Get room by ID
router.get("/get-rooms-by-id/:id", controller.rooms.getroomById)

// Update room by ID
router.put("/update-room/:id", controller.rooms.updateRoomById);

// Delete room by ID
router.delete("/delete-room/:id", controller.rooms.deleteRoom);

module.exports = router;
