class ServiceDTO {
    constructor(data = {}) {
        if(data.title) this.title = data.title;
        if(data.slug) this.slug = data.slug;
        if(data.base_price) this.base_price = data.base_price;
        if(data.quantity) this.quantity = data.quantity;
        if(data.discount) this.discount = data.discount;
        if(data.sort) this.sort = data.sort;
        if(data.popular) this.popular = data.popular;
        if(data.is_active) this.is_active = data.is_active;
        if(data.image_s) this.image_s = data.image_s;
        if(data.image_m) this.image_m = data.image_m;
        if(data.image_l) this.image_l = data.image_l;
        if(data.grid_desc) this.grid_desc = data.grid_desc;
        if(data.basic_desc) this.basic_desc = data.basic_desc;
        if(data.details) this.details = data.details;
    }
}

module.exports = ServiceDTO;