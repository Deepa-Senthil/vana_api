const JewelleryCollectionModel = require("../../database/models/JewelleryCollection");
const JewelleryItemModel = require("../../database/models/JewelleryItems");

exports.getJewelleryItemByID = async (req, res, next) => {
    const jewelleryId = req.params.JewelleryItemId;   
    const JewelleryItem = await JewelleryItemModel.findById(jewelleryId)
    res.json(JewelleryItem)
};

exports.getNewArrivalProducts = async (req, res, next) => {
    try {
        const products = await JewelleryItemModel.aggregate([
            {   
                $project: {
                    _id: 1,
                    title: 1,
                    posterURL: 1,
                    price: 1,
                    createdAt: 1,
                    netWeight: 1,
                    description: 1,
                    posterURL: 1
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $limit: 4,
            },
        ]);


        res.json(products);
    } catch (error) {
        next(error);
    }
};

exports.getJewelleryItemByJewelleryCollectionName = async (req, res, next) => {
    try {
        const JewelleryCollectionName = req.params.JewelleryCollectionName;
        var collection = await JewelleryCollectionModel.findOne({ name: JewelleryCollectionName });

        if (!collection) {
            const error = new Error("Category not found");
            error.statusCode = 452;
            throw error;
        }

        const collectionWithProducts = await JewelleryCollectionModel.aggregate([
            {
                $match: {
                    name: JewelleryCollectionName,
                },
            },
            {
                $lookup: {
                    from: "jewelleryitems",
                    localField: "_id",
                    foreignField: "JewelleryCollection",
                    as: "AllJewelleryitems",
                },
            },
            {
                $unwind: "$AllJewelleryitems",
            },
            {
                $group: {
                    _id: "$_id",
                    JewelleryCollectionName: { $first: "$name" },
                    JewelleryCollectionDescription: { $first: "$description" },

                    jewelleryItems: {
                        $push: {
                            _id: "$AllJewelleryitems._id",
                            title: "$AllJewelleryitems.title",
                            description: "$AllJewelleryitems.description",
                            price: "$AllJewelleryitems.price",
                            netWeight: "$AllJewelleryitems.netWeight",
                            posterURL: "$AllJewelleryitems.posterURL",
                            images:"$AllJewelleryitems.images"
                        },
                    },
                },
            },
            {
                $project: {
                    JewelleryCollectionId: 1,
                    JewelleryCollectionName: 1,
                    JewelleryCollectionDescription: 1,
                    jewelleryItems: 1,
                },
            },
        ]);

        res.json(collectionWithProducts.length > 0 ? collectionWithProducts[0] : {});
    } catch (error) {
        next(error);
    }
};


exports.searchJewelleryCollectionItem = async (req, res) => {
  try {
    let searchTerm = req.query.searchTerm ||"";

   
    if (searchTerm !== undefined) {
    
      searchTerm = searchTerm.toString();

      let data = await JewelleryItemModel.aggregate([
        {
          $match: {
            $or: [
              { title: { $regex: searchTerm, $options: "i" } },
              { price: { $regex: searchTerm, $options: "i" } },
            ],
          },
        },
        {
          $project: {
            title: 1,
            _id: 1,
            images: 1,
            price: 1,
            description: 1,
            netWeight: 1,
            posterURL: 1,
            collection: 1,
          },
        },
      ]);
      res.send(data);
    } else {

      res.status(400).json({ error: "Search term is missing" });
    }
  } catch (error) {
    console.error("Error searching jewellery collection items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
