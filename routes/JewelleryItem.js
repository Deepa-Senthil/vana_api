var express = require("express");
const mongoose = require("mongoose");
var router = express.Router();
const multer = require("multer");
const upload = multer();

const JewelleryItemControlleradmin = require("../controllers/admin/JewelleryItemController");
const JewelleryItemControllerUser = require("../controllers/user/JewelleryItem");

const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// admin controller
router.get(
  "/getAllJewelleryItem",
  use(JewelleryItemControlleradmin.getAllJewelleryItems)
);
router.post(
  "/createJewelleryItem",
  upload.any(),
  use(JewelleryItemControlleradmin.createJewelleryItem)
);
router.put(
  "/updateJewelleryItem/:JewelleryItemId",
  upload.any(),
  use(JewelleryItemControlleradmin.updateJewelleryItem)
);
router.delete(
  "/deleteJewelleryItem/:JewelleryItemId",
  use(JewelleryItemControlleradmin.deleteJewelleryItem)
);
router.get(
  "/fetchJewelleryItemsByJewelleryCollectionId/:JewelleryCollectionId",
  use(JewelleryItemControlleradmin.fetchJewelleryItemByJewelleryCollectionId)
);

//user
router.get("/getJewelleryItemById/:JewelleryItemId", use(JewelleryItemControllerUser.getJewelleryItemByID))
router.get("/getNewArrivalProducts", use(JewelleryItemControllerUser.getNewArrivalProducts))
router.get(
  "/getJewelleryItemsByJewelleryCollectionId/:JewelleryCollectionName",
  use(JewelleryItemControllerUser.getJewelleryItemByJewelleryCollectionName)
);
router.get(
  "/searchJewelleryCollectionItem",
  use(JewelleryItemControllerUser.searchJewelleryCollectionItem)
);

module.exports = router;
