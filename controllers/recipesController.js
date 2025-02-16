const db = require('../database/db');
const Recipe = require('../Models/Recipe');
const multer = require('multer');
const sharp = require('sharp');
const slugify = require('slugify')

exports.getAllRecipes = async (req, res) => {
    
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit);

        if (page < 1 || limit < 1 || page > 1000 || limit > 50) {
            return res.status(400).json({ message: 'Invalid pagination parameters' });
        } 

        const data = await Recipe.getAllRecipesQuery(req.query, page, limit, req.body.id);
        const most_liked = await Recipe.getMostLikedQuery();
        
        res.json({...data, most_liked});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getOneRecipe = async (req, res) => {
    try {
        const { slug } = req.params;
        const recipe = await Recipe.getOneRecipeQuery(slug);

        if (!recipe) {
            return res.status(404).json({ message: 'Receptas nerastas' });
        }

        res.json(recipe);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
exports.uploadPhoto = upload.single('photo');

exports.resizePhoto = async (req, res, next) => {
    try {
        
        if (!req.file) {
            return res.status(400).json({ message: 'Nope, reik fotkės!' });
        }

        const { buffer, mimetype } = req.file;
        req.body.img_s = await sharp(buffer).resize(128, 128).webp({ quality: 50 }).toBuffer();
        req.body.img_m = await sharp(buffer).resize(512, 384).webp({ quality: 70 }).toBuffer();
        req.body.img_l = await sharp(buffer).resize(576, 1024).webp({ quality: 95 }).toBuffer();
        req.body.photo_type = mimetype;

        next();
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addRecipe = async (req, res) => {
    try {
        
        const { title, recipe_type, food_logic, taste, duration, is_vegetarian, description, img_s, img_m, img_l, video_link, photo_type, products } = req.body;
        const slug = slugify(title, {replacement: '-', lower: true, trim: true, strict: true });

        const check_slug_query = 'SELECT 1 FROM recipes WHERE slug = $1';
        const slug_exists = await db.query(check_slug_query, [slug]);
        if(slug_exists.rowCount > 0) {
            return res.status(400).json({ message: 'Toks pavadinimas jau yra 🍽' });
        }

        if(JSON.parse(products).length === 0) {
            return res.status(400).json({ message: 'O produktai? 🍔🌭🌮' });
        }
        const recipe_query = `
            INSERT INTO recipes (title, slug, recipe_type, food_logic, taste, duration, is_vegetarian, description, photo_s, photo_m, photo_l, video_link, photo_type) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`;
        
        await db.query('BEGIN');
        const { rows: [{ id: recipe_id }]} = await db.query(recipe_query, [title, slug, recipe_type, food_logic, taste, duration, is_vegetarian, description, img_s, img_m, img_l, video_link, photo_type]);    
        
        // const recipe_id = rows[0].id;
        // const recipe_id = id;
        let recipe_date = new Date();

        const insert_products_query = 'INSERT INTO recipe_products (recipe_id, product_id, grams, created_at) VALUES ($1, $2, $3, $4)';
        for(const prod of JSON.parse(products)) {
            recipe_date.setSeconds(recipe_date.getSeconds() + 1);
            await db.query(insert_products_query, [recipe_id, prod.product_id, prod.grams, recipe_date.toLocaleString('lt-LT')]);
        }
        await db.query('COMMIT');
        res.status(200).json(recipe_id);

    } catch(err) {
        await db.query('ROLLBACK');
        res.status(500).json({
            message: err.message
        });
    }
};
