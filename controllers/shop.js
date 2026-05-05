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
        let newprice = 0;

        const product2 = await Product.findByPk(prodId);
        const productprice = product2.price;

        if (products.length > 0) {
            product = products[0];
        }

        // 2. Kui on olemas, suurendame kogust vahetabelis (CartItem)
        if (product) {
            const oldQuantity = product.cartItem.quantity;
            newQuantity = oldQuantity + 1;
            newprice = productprice * newQuantity;
            const productToAdd = await Product.findByPk(prodId);
            await cart.addProduct(product, { through: { quantity: newQuantity } });
            await cart.addProduct(productToAdd, { through: { quantity: newQuantity } });
            await cart.addProduct(product, { through: { price: newprice } });
            await cart.addProduct(productToAdd, { through: { price: newprice } });

        } else {
            // 3. Kui ei ole, leiame toote üldisest tabelist ja lisame korvi
            const productToAdd = await Product.findByPk(prodId);
            await cart.addProduct(productToAdd, { through: { quantity: newQuantity } });
            await cart.addProduct(productToAdd, { through: { quantity: newQuantity } });
            await cart.addProduct(productToAdd, { through: { price: productprice } });
            await cart.addProduct(productToAdd, { through: { totalPrice: productprice } });


        }

    const userCart = await req.user.getCart()
    console.log(userCart)
    const cartProducts = await userCart.getProducts()
    console.log(cartProducts)
    const totalPrice = cartProducts.reduce((total, product) => {
        return total + product.cartItem.price * product.cartItem.quantity;
    }, 0);
    userCart.totalPrice = totalPrice;
    await userCart.save();

    res.status(201).json({
        message: 'Toode on lisatud ostukorvi',
        cart: cartProducts
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

async createOrder(req, res) {
     // Siin peaks olema loogika, mis võtab kasutaja korvi, loob uue orderi ja seob selle orderiga
     // Pärast seda tuleks tühjendada kasutaja korv
    const userCart = await req.user.getCart();
    const cartProducts = await userCart.getProducts();

    // Loome orderi ja seome selle tooteid
    const order = await req.user.createOrder();
    await order.addProducts(cartProducts.map(product => {
        product.orderItem = {
            quantity: product.cartItem.quantity,
            price: product.cartItem.price
        };
        return product;
    }));

    // Tühjendame korvi
    await userCart.setProducts([]);
    userCart.totalPrice = 0;
    await userCart.save();

    const totalPrice = cartProducts.reduce((total, product) => {
        console.log("+++++++++", product.cartItem.price)
        return total + product.cartItem.price;
    }, 0);

    await order.update({ totalPrice });

    const orderProducts = await order.getProducts();

    res.status(201).json({
        message: 'Order on loodud',
        totalPrice: totalPrice,
        orderProducts: orderProducts
    });
}

}

module.exports = new shopController()