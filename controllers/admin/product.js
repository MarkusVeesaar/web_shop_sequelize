const Product = require('../../models/product');

class adminController {

    async addProduct(req, res) {
        const product = await Product.create({
            title: req.body.title,
            price: req.body.price,
            imageUrl: req.body.imageUrl,
            description: req.body.description,
            UserId: req.user.id
        })
        res.status(201).json({
            message: 'Product is added',
            productId: product.id
        })
    }

    async getAllProducts(req, res) {
        const products = await Product.findAll()
        console.log(products)
        res.status(201).json({
            products: products
        })
    }

    async getProductbyId(req, res) {
        const product = await Product.findByPk(req.params.id)
        res.status(201).json({
            product: product
        })
    }

    async UpdateProductbyId(req, res) {
        const product = await Product.findByPk(req.params.id)
        if (product) {
        await product.update({
            title: req.body.title,
            price: req.body.price,
            description: req.body.description,
            imageUrl: req.body.imageUrl
        });
        res.status(201).json({
            message: 'Product is updated where id: ' + req.params.id,
        })
        }
    }
    async DeleteProductByID(req, res) {
        const product = await Product.findByPk(req.params.id)

        if (product) {
        await product.destroy();
        }

        res.status(201).json({
            message: 'Product is deleted where id: ' + req.params.id,
        })
        
    }
}

module.exports = new adminController()