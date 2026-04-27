const Product = require('../models/product')
const Cart = require('../models/cart')

class shopController {

    async getAllProducts(req, res) {
        const products = await Product.findAll()
        console.log(products)
        res.status(201).json({
            products: products
        })
    }

    async getCart(req, res) {
        const userCart = await req.user.getCart()
        console.log(userCart)
        const cartProducts = await userCart.getProducts()
        res.status(201).json({
            products: cartProducts
        })
    }
    
async addProduct(req, res) {
    const prodId = req.body.id; // Eeldame, et saadad toote ID body-ga
    const cart = await req.user.getCart();
    
    // 1. Kontrollime, kas toode on juba korvis
    const products = await cart.getProducts({ where: { id: prodId } });
    let product;
    let newQuantity = 1;

    if (products.length > 0) {
        product = products[0];
    }

    // 2. Kui on olemas, suurendame kogust vahetabelis (CartItem)
    if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        await cart.addProduct(product, { through: { quantity: newQuantity } });
    } else {
        // 3. Kui ei ole, leiame toote üldisest tabelist ja lisame korvi
        const productToAdd = await models.Product.findByPk(prodId);
        await cart.addProduct(productToAdd, { through: { quantity: newQuantity } });
    }

    res.status(201).json({
        message: 'Toode on lisatud ostukorvi'
    });
}

async postCartDeleteProduct(req, res) {
    const prodId = req.body.productId;
    const cart = await req.user.getCart();
    
    // Leiame toote ostukorvist
    const products = await cart.getProducts({ where: { id: prodId } });
    const product = products[0];

    // Eemaldame toote (kustutab rea CartItem tabelist)
    await product.cartItem.destroy();

    res.status(200).json({ message: 'Toode ostukorvist eemaldatud' });

}
}

module.exports = new shopController()