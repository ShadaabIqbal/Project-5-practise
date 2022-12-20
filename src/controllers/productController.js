let productModel = require('..productModel/models/')

let isValidImage = /.*\.([gG][iI][fF]|[jJ][pP][gG]|[jJ][pP][eE][gG]|[bB][mM][pP])$/

module.exports.createProduct = async function (req, res) {
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
      if (!description)return res.status(400).send({ status: false, message: "description is required" });
      if (!price)return res.status(400).send({ status: false, message: "price is required" });
      if (!currencyId)return res.status(400).send({ status: false, message: "currencyId is required" });
      if (!currencyFormat) return res.status(400) .send({ status: false, message: "currencyFormat is required" });
  
      if (files.length === 0)return res.status(400).send({ status: false, message: "productImage is required" });
  
      if (!availableSizes)return res.status(400).send({ status: false, message: "availableSizes is required" });
  

      if(!["S", "XS","M","X", "L","XXL", "XL"].include(availableSizes)) return res.status(400).send({status:false, message:"Size not avilable"})

      const isTitleAlreadyUsed = await productModel.findOne({
        title: req.body.title,
      });

      if (isTitleAlreadyUsed)
        return res.status(404).send({ status: false, message: "Title is already used" });
  
      if (currencyId != 'INR')return res.status(400).send({ status: false, message: "currencyId must be INR " })
  
      let uploadedFileURL;
  
      if (req.files && req.files.length > 0) {
        if (!isValidImage(files[0].originalname))
          return res.status(400).send({ status: false, message: "productImage must be of extention .jpg,.jpeg,.bmp,.gif,.png" });
  
        uploadedFileURL = await uploadFile(req.files[0]);
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