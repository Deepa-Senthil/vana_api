var express = require("express");
var router = express.Router();

const categoryControlleradmin = require("../controllers/admin/JewelleryCollectionController");
const { uploadByMulterS3 } = require("../config/s3Config");

const use = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);



// admin controller
router.get(
    "/getJewelleryCollection",
    use(categoryControlleradmin.getJewelleryCollection)
);

router.post(
    "/createJewelleryCollection",uploadByMulterS3.single("image"),
    use(categoryControlleradmin.createJewelleryCollection)
);

router.put(
    "/updateJewelleryCollection/:JewelleryCollectionId",uploadByMulterS3.single("image"),
    use(categoryControlleradmin.updateJewelleryCollection)
);
router.delete(
    "/deleteJewelleryCollection/:JewelleryCollectionId",
    use(categoryControlleradmin.deleteJewelleryCollection)
);

router.get(
    "/fetchProductsByJewelleryCollectionId/:JewelleryCollectionId",
    use(categoryControlleradmin.fetchProductsByJewelleryCollectionId)
);

module.exports = router;