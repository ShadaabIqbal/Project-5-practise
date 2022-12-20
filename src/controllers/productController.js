let productModel = require('..productModel/models/');
const validation = require('../validations/validation');
const aws = require('../aws/aws')



exports.createProduct = async function (req, res) {
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
  

      if(!validation.validSize(availableSizes)) return res.status(400).send({status:false, message:"Size not avilable"})

      const isTitleAlreadyUsed = await productModel.findOne({
        title: req.body.title,
      });

      if (isTitleAlreadyUsed)
        return res.status(404).send({ status: false, message: "Title is already used" });
  
      if (currencyId != 'INR')return res.status(400).send({ status: false, message: "currencyId must be INR " })
  
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


exports.getProduct = async function(req, res){
try{
if(!validation.requiredInput(req.query)) return res.status(400).send({ status: false, message: "Input is required" })
const { size, name, priceGreaterThan, priceLessThan, priceSort } = req.query

let obj = { isDeleted: false}

if(size){
  obj.availableSizes = size
}
if(name){
  obj.title = name
}
if(priceGreaterThan){
  obj.price = {$gt: priceGreaterThan}
}
if(priceLessThan){
  obj.price = {$lt: priceLessThan}
}
if(priceSort != -1 || 1 ) return res.status(400).send({ status: false, message: "Price sort can only be 1 or -1" })

let allProduct = await productModel.find({obj})
if(!allProduct.length > 0) return res.status(404).send({ status: false, message: "Product not found" })

if(priceSort == 1){
let x  = allProduct.sort((a, b) => {return a.price - b.price})
return res.status(200).send({ status: true, data: x })
}
if(priceSort == -1){
 let y =  allProduct.sort((a, b) => {return b.price - a.price})
 return res.status(200).send({ status: true, data: y })
}

}catch(error){
  return res.status(500).send({ status: false, error: error.message });
}
}