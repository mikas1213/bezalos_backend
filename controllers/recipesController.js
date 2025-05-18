const appContainer = require('../utils/appContainer');
const { RECIPES_SERVICE, S3_SERVICE } = require('../config/DIKeys');
const s3Service = appContainer.resolve(S3_SERVICE);
const recipesService = appContainer.resolve(RECIPES_SERVICE);
const { ValidationError } = require('../utils/errors');
const RecipeDTO = require('../dto/recipe-create.dto');
const catchAsync = require('../utils/catchAsync');
const slugify = require('slugify');

exports.getFavoriteRecipes = catchAsync(async (req, res) => {
    const data = await recipesService.getFavoriteRecipes();
    res.status(200).json(data);
});

exports.getRecipe = catchAsync(async (req, res) => {
    const { slug } = req.params;
    const data = await recipesService.getRecipeWithProducts(slug);
    res.status(200).json(data);
});

exports.getRecipes = catchAsync(async (req, res) => {
    const user_id = req.body.id;
    const filters = {...req.query};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    
    if (page < 1 || limit < 1 || page > 1000 || limit > 50) {
        throw new ValidationError('Invalid pagination parameters');
    } 
    const data = await recipesService.getAllRecipes(filters, page, limit, user_id);
    res.status(200).json(data);
});

exports.addRecipe = catchAsync(async (req, res) => {
    const slug = slugify(req.body.title, {replacement: '-', lower: true, trim: true, strict: true });
    const aws_key = `${process.env.AWS_FOLDER_NAME}${slug}.webp`;
    
    req.body.slug = slug;
    req.body.image_s3 = `${process.env.AWS_URL}/${aws_key}`;
    
    const recipeDTO = new RecipeDTO(req.body);
    const { products } = req.body;

    if (!recipeDTO.title) throw new ValidationError('Recepto pavadinimas');
    if (!req.file) throw new ValidationError('Nope, reik fotkės! 🏞');
    if(JSON.parse(products).length === 0) throw new ValidationError('O produktai? 🍔🌭🌮');

    JSON.parse(products).forEach((product) => {
        if(isNaN(product.grams)) throw new ValidationError('Gramai turi būti skaičius 1️⃣ 2️⃣ 3️⃣');
    });

    const { recipe_id, recipe_slug } = await recipesService.addOneRecipe(recipeDTO, products);
    s3Service.uploadFile({
        Bucket: process.env.AWS_BUCKET_NAME, 
        Key: aws_key, 
        Body: req.body_data, 
        ContentType: 'image/webp',
        Metadata: {recipe_id, host: process.env.PROJECT}
    });

    res.status(200).json({recipe_id, recipe_slug});
});

exports.editRecipe = catchAsync(async (req, res) => {
    
    const { id: recipe_id } = req.params;
    const recipeDTO = new RecipeDTO(req.body);
    const { products } = req.body;
    

    if (!recipeDTO.title) throw new ValidationError('Recepto pavadinimas');
    if(JSON.parse(products).length === 0) throw new ValidationError('O produktai? 🍔🌭🌮');

    const old_row = await recipesService.getOneRecipe(recipe_id);
    const new_slug = slugify(recipeDTO.title, {replacement: '-', lower: true, trim: true, strict: true });

    const new_s3_key = `${process.env.AWS_FOLDER_NAME}${new_slug}.webp`;
    const old_s3_key = `${process.env.AWS_FOLDER_NAME}${old_row.slug}.webp`;

    recipeDTO.slug = new_slug;
    recipeDTO.image_s3 = `${process.env.AWS_URL}/${new_s3_key}`;
    
    await recipesService.updateOneRecipe(recipe_id, recipeDTO, products);
    

    /* - - - AWS OPERATIONS - - - */

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${process.env.AWS_FOLDER_NAME}${old_row.slug}.webp`
    };
    const isFileExist = await s3Service.isFileExist(params);

    if(!req.body_data && isFileExist && old_s3_key !== new_s3_key) {
        
        await s3Service.renameFile({
            Bucket: process.env.AWS_BUCKET_NAME,
            CopySource: `${process.env.AWS_BUCKET_NAME}/${old_s3_key}`,
            Key: new_s3_key,
            Old_Key: old_s3_key
        });

    } else if(req.body_data && isFileExist) {
  
        await s3Service.deleteFile(params);
        s3Service.uploadFile({
            Bucket: process.env.AWS_BUCKET_NAME, 
            Key: new_s3_key, 
            Body: req.body_data, 
            ContentType: 'image/webp',
            Metadata: {recipe_id, host: process.env.PROJECT}
        });
    }
    
    res.status(200).json({isFileExist, slug: new_slug});
});

exports.deleteRecipe = catchAsync(async (req, res) => {
    
    const { id } = req.params;
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${process.env.AWS_FOLDER_NAME}${req.body.slug}.webp`
    };

    await recipesService.deleteOneRecipe(id);
    const isFileExist = await s3Service.isFileExist(params);
    await s3Service.deleteFile(params);

    res.status(200).json(isFileExist);
});