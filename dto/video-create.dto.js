class VideoDTO {
    constructor(data = {}) {
        if(data.title !== undefined) this.title = data.title;
        if(data.slug !== undefined) this.slug = data.slug;
        if(data.image_s3_key !== undefined) this.image_s3_key = data.image_s3_key;
        if(data.video_s3_key !== undefined) this.video_s3_key = data.video_s3_key;
        if(data.video_type !== undefined) this.video_type = data.video_type;
        if(data.category !== undefined) this.category = data.category;
        if(data.description !== undefined) this.description = data.description;
        if(data.search_tag !== undefined) this.search_tag = data.search_tag;
        if(data.duration !== undefined) this.duration = data.duration;
        if(data.is_active !== undefined) this.is_active = data.is_active;
    }
}

module.exports = VideoDTO;