const express = require("express")
const { protect } = require("../middleware/authMiddleware")
const { sendMessage, allMessages } = require("../controller/messageControllers")



const router = express.Router()

router.post("/", protect,  sendMessage)
router.get("/:chatId",protect, allMessages)



module.exports =router