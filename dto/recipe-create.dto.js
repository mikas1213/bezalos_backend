class RecipeDTO {
    constructor(data = {}) {
        if(data.title !== undefined) this.title = data.title;
        if(data.slug !== undefined) this.slug = data.slug;
        if(data.recipe_type !== undefined) this.recipe_type = data.recipe_type;
        if(data.food_logic !== undefined) this.food_logic = data.food_logic;
        if(data.taste !== undefined) this.taste = data.taste;
        if(data.duration !== undefined) this.duration = data.duration;
        if(data.is_vegetarian !== undefined) this.is_vegetarian = data.is_vegetarian;
        if(data.description !== undefined) this.description = data.description;
        if(data.image_s !== undefined) this.image_s = data.image_s;
        if(data.image_m !== undefined) this.image_m = data.image_m;
        if(data.image_l !== undefined) this.image_l = data.image_l;
        if(data.image_s3 !== undefined) this.image_s3 = data.image_s3;
        if(data.video_link !== undefined) this.video_link = data.video_link;
    }
}

module.exports = RecipeDTO;