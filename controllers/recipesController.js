const db = require('../database/db');
const Recipe = require('../Models/Recipe');
const multer = require('multer');
const sharp = require('sharp');
const slugify = require('slugify');

exports.getFavoriteRecipes = async (req, res) => {
    try {
        const most_liked = await Recipe.getMostLikedQuery();
        res.status(200).json(most_liked);
    } catch(err) {

    }
};

exports.getAllRecipes = async (req, res) => {
    
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit);

        if (page < 1 || limit < 1 || page > 1000 || limit > 50) {
            return res.status(400).json({ message: 'Invalid pagination parameters' });
        } 

        const data = await Recipe.getAllRecipesQuery(req.query, page, limit, req.body.id);
        
        res.json(data);
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
        if (req.file) {
            const { buffer, mimetype } = req.file;
            const img_s = await sharp(buffer).resize(128, 128).webp({ quality: 50 }).toBuffer();
            const img_m = await sharp(buffer).resize(512, 384).webp({ quality: 70 }).toBuffer();
            const img_l = await sharp(buffer).resize(576, 1024).webp({ quality: 95 }).toBuffer();
             
            req.body.image_s = `data:${mimetype};base64,${img_s.toString('base64')}`;
            req.body.image_m = `data:${mimetype};base64,${img_m.toString('base64')}`;
            req.body.image_l = `data:${mimetype};base64,${img_l.toString('base64')}`;

            return next();
        }
        next();
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addRecipe = async (req, res) => {
    try {
        
        const { title, recipe_type, food_logic, taste, duration, is_vegetarian, description, image_s, image_m, image_l, video_link, products } = req.body;
        const slug = slugify(title, {replacement: '-', lower: true, trim: true, strict: true });

        const check_slug_query = 'SELECT 1 FROM recipes WHERE slug = $1';
        const slug_exists = await db.query(check_slug_query, [slug]);

        if (!req.file) {
            return res.status(400).json({ message: 'Nope, reik fotkės! 🏞' });
        }

        if(slug_exists.rowCount > 0) {
            return res.status(400).json({ message: 'Toks pavadinimas jau yra 🍽' });
        }

        if(JSON.parse(products).length === 0) {
            return res.status(400).json({ message: 'O produktai? 🍔🌭🌮' });
        }
        const recipe_query = `
            INSERT INTO recipes (title, slug, recipe_type, food_logic, taste, duration, is_vegetarian, description, image_s, image_m, image_l, video_link) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`;
        
        await db.query('BEGIN');
        const { rows: [{ id: recipe_id }]} = await db.query(recipe_query, [title, slug, recipe_type, food_logic, taste, duration, is_vegetarian, description, image_s, image_m, image_l, video_link]);    
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

exports.editRecipe = async (req, res) => {
    try {
        const { id: recipe_id } = req.params;
        
        const { title, recipe_type, food_logic, taste, duration, is_vegetarian, description, image_s, image_m, image_l, video_link, products } = req.body;
        const slug = slugify(title, {replacement: '-', lower: true, trim: true, strict: true });

        let query_values = [title, slug, recipe_type, food_logic, taste, duration, is_vegetarian, description, video_link, recipe_id]
        let query_string = `UPDATE recipes SET 
            title = $1, 
            slug = $2, 
            recipe_type = $3, 
            food_logic = $4, 
            taste = $5, 
            duration = $6, 
            is_vegetarian = $7, 
            description = $8, 
            video_link = $9
        WHERE id = $10`;

        if(req.file) {
            query_values = [title, slug, recipe_type, food_logic, taste, duration, is_vegetarian, description, video_link, image_s, image_m, image_l, recipe_id]
            query_string = `UPDATE recipes SET 
                title = $1, 
                slug = $2, 
                recipe_type = $3, 
                food_logic = $4, 
                taste = $5, 
                duration = $6, 
                is_vegetarian = $7, 
                description = $8, 
                video_link = $9, 
                image_s = $10,
                image_m = $11, 
                image_l = $12
            WHERE id = $13`;
        }

        await db.query('BEGIN');
        await db.query(query_string, query_values);    
        await db.query(`DELETE FROM recipe_products WHERE recipe_id = $1`, [recipe_id]);    

        let recipe_date = new Date();
        const insert_products_query = 'INSERT INTO recipe_products (recipe_id, product_id, grams, created_at) VALUES ($1, $2, $3, $4)';
        for(const prod of JSON.parse(products)) {
            recipe_date.setSeconds(recipe_date.getSeconds() + 1);
            await db.query(insert_products_query, [recipe_id, prod.product_id, prod.grams, recipe_date.toLocaleString('lt-LT')]);
        }
        await db.query('COMMIT');
        res.sendStatus(204);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};
