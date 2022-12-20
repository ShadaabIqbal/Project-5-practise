let productModel = require('../models/productModel');
const validation = require('../validations/validation');
const aws = require('../aws/aws');
const userModel = require('../models/userModel');



const createProduct = async function (req, res) {
  try {
    let data = req.body;

    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: false, message: "Please provide details" });
    }

    let { title, description, price, currencyId, currencyFormat, installments, isFreeShipping, productImage, style, availableSizes, ...rest } = { ...data };

    if (Object.keys(rest).length != 0) {
      return res.status(400).send({
        status: false,
        message: "Data required are title description price currencyId currencyFormat image style availableSizes installments isFreeShipping"
      });
    }

    let files = req.files;

    if (!title)
      return res.status(400).send({ status: false, message: "title is required" });
    if (!description) return res.status(400).send({ status: false, message: "description is required" });
    if (!price) return res.status(400).send({ status: false, message: "price is required" });
    if (!currencyId) return res.status(400).send({ status: false, message: "currencyId is required" });
    if (!currencyFormat) return res.status(400).send({ status: false, message: "currencyFormat is required" });

    if (files.length === 0) return res.status(400).send({ status: false, message: "productImage is required" });

    if (!availableSizes) return res.status(400).send({ status: false, message: "availableSizes is required" });


    if (!validation.validSize(availableSizes)) return res.status(400).send({ status: false, message: "Size not avilable" })

    const isTitleAlreadyUsed = await productModel.findOne({
      title: req.body.title,
    });

    if (isTitleAlreadyUsed)
      return res.status(404).send({ status: false, message: "Title is already used" });

    if (currencyId != 'INR') return res.status(400).send({ status: false, message: "currencyId must be INR " })

    if (currencyFormat != '₹') return res.status(400).send({ status: false, message: "currencyFormat must be ₹ " })

    let uploadedFileURL;

    if (req.files && req.files.length > 0) {
      if (!validation.validImage(files[0].originalname))
        return res.status(400).send({ status: false, message: "productImage must be of extention .jpg,.jpeg,.bmp,.gif,.png" });

      uploadedFileURL = await aws.uploadFile(req.files[0]);
    } else {
      res.status(400).send({ message: "No file found" });
    }
    data.productImage = uploadedFileURL;

    const savedData = await productModel.create(data);
    return res.status(201).send({ status: true, message: "Success", data: savedData });

  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

const getProductByQuery = async function (req, res) {
  try {
    if (!validation.requiredInput(req.query)) return res.status(400).send({ status: false, message: "Input is required" })
    const { size, name, priceGreaterThan, priceLessThan, priceSort } = req.query

    let obj = { isDeleted: false }

    if (size) {
      obj.availableSizes = size
    }
    if (name) {
      obj.title = name
    }
    if (priceGreaterThan) {
      obj.price = { $gt: priceGreaterThan }
    }
    if (priceLessThan) {
      obj.price = { $lt: priceLessThan }
    }
    if (priceSort) {
      if (!(priceSort == -1 || priceSort == 1)) return res.status(400).send({ status: false, message: "Price sort can only be 1 or -1" })
    }

    let allProduct = await productModel.find(obj).sort({ price: priceSort })
    if (!allProduct.length > 0) return res.status(404).send({ status: false, message: "Product not found" })
    return res.status(200).send({ status: true, data: allProduct })

  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
}


const getProductById = async function (req, res) {
  try {
    const productId = req.params._id

    const getProduct = await userModel.findById({ isDeleted: false, _id: productId })
    if (!getProduct) return res.status(404).send({ status: false, message: 'Product not found' })
    return res.status(200).send({ status: true, data: getProduct })


  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
}

const updateProduct = async function (req, res) {
  try {
    let productId = req.params.productId
    let productExist = await productModel.findOne({ _id: productId, isDeleted: false })
    if (!productExist) return res.status(400).send({ status: false, message: "Product does not exist" })

    let data = req.body;
    let files = req.files
    if (!validation.requiredInput(data)) { return res.status(400).send({ status: false, message: "Data is required" }) };

    let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments } = data;

    if (title || title == "") {
      if (!validation.isEmpty(title)) return res.status(400).send({ status: false, message: "Title is empty" })
      let checkTitle = await productModel.findOne({title: title})
      if (checkTitle) return res.status(400).send({ status: false, message: "Title already exists" })
    }

    if (description || description == "") {
      if (!validation.isEmpty(description)) return res.status(400).send({ status: false, message: "Description is empty" })
    }

    if (price || price == "") {
      if (!validation.isEmpty(price)) return res.status(400).send({ status: false, message: "Price is empty" })
      if (!validation.isValidPrice(price)) return res.status(400).send({ status: false, message: "Price is invalid" })
    }

    if (currencyId) {
      if (currencyId != 'INR') return res.status(400).send({ status: false, message: "currencyId is invalid" })
    }

    if (currencyFormat) {
      if (currencyId != '₹') return res.status(400).send({ status: false, message: "currencyFormat is invalid" })
    }

    if (isFreeShipping) {
      if (!validation.isEmpty(isFreeShipping)) return res.status(400).send({ status: false, message: "currencyFormat is empty" })
      if (!(isFreeShipping == "true" || isFreeShipping == "false")) return res.status(400).send({ status: false, message: "isFreeShipping should only be boolean" })
    }

    if (Object.keys(req.body).includes("productImage") && files.length == 0) {
      return res.status(400).send({ status: false, message: "Product image is empty" })
    }


    if (files && files.length > 0) {
      if (!validation.validImage(files[0].originalname)) {
        return res.status(400).send({ status: false, message: "Image is not valid must be of extention .jpg,.jpeg,.bmp,.gif,.png" })
      } else {
        let uploadProfileURL = await aws.uploadFile(files[0])
        productImage = uploadProfileURL
      }
    }

    if (style || style == "") {
      if (!validation.isEmpty(style)) return res.status(400).send({ status: false, message: "Style is empty" })
    }

    if (availableSizes || availableSizes == "") {
      if (!validation.isEmpty(availableSizes)) return res.status(400).send({ status: false, message: "Available sizes is empty" })
      if (!validation.validSize(availableSizes)) return res.status(400).send({ status: false, message: "Available sizes is invalid" })
    }

    if (installments || installments == "") {
      if (!validation.isEmpty(installments)) return res.status(400).send({ status: false, message: "Installments is empty" })
      if (!validation.isValidPrice(installments)) return res.status(400).send({ status: false, message: "Installments is invalid" })
    }

    const updatedData = await productModel.findOneAndUpdate({ _id: productId }, { $set: { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments } }, { new: true })

    return res.status(200).send({ status: true, data: updatedData })

  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}

module.exports = { createProduct, getProductByQuery, getProductById, updateProduct }