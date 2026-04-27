const express = require('express')
const router = express.Router()
const productController = require('../../controllers/admin/product')

router.post('/product/add', (req, res) => productController.addProduct(req, res))
router.get('/products', (req, res) => productController.getAllProducts(req, res))
router.get('/product/:id', (req, res) => productController.getProductbyId(req, res))
router.put('/update/product/:id', (req, res) => productController.UpdateProductbyId(req, res))
router.delete('/delete/product/:id', (req, res) => productController.DeleteProductByID(req, res))
module.exports = router