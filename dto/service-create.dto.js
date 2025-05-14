class ServiceDTO {
    constructor(data = {}) {
        if(data.title !== undefined) this.title = data.title;
        if(data.slug !== undefined) this.slug = data.slug;
        if(data.base_price !== undefined) this.base_price = data.base_price;
        if(data.quantity !== undefined) this.quantity = data.quantity;
        if(data.discount !== undefined) this.discount = data.discount;
        if(data.sort !== undefined) this.sort = data.sort;
        if(data.status !== undefined) this.status = data.status;
        if(data.category !== undefined) this.category = data.category;
        if(data.is_active !== undefined) this.is_active = data.is_active;
        if(data.image_s !== undefined) this.image_s = data.image_s;
        if(data.image_m !== undefined) this.image_m = data.image_m;
        if(data.image_l !== undefined) this.image_l = data.image_l;
        if(data.grid_desc !== undefined) this.grid_desc = data.grid_desc;
        if(data.basic_desc !== undefined) this.basic_desc = data.basic_desc;
        if(data.details !== undefined) this.details = data.details;
    }
}

module.exports = ServiceDTO;