import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
    page: {
        current: {
            id: String,
            uuid: String,
            title: String,
            slug: String,
            mobiledoc: String,
            html: String,
            comment_id: String,
            feature_image: String,
            featured: Boolean,
            status: String,
            visibility: String,
            created_at: Date,
            updated_at: Date,
            published_at: Date,
            custom_excerpt: String,
            codeinjection_head: String,
            codeinjection_foot: String,
            custom_template: String,
            canonical_url: String,
            tags: Array,
            authors: Array,
            tiers: Array,
            primary_author: Object,
            primary_tag: String,
            url: String,
            excerpt: String,
            og_image: String,
            og_title: String,
            og_description: String,
            twitter_image: String,
            twitter_title: String,
            twitter_description: String,
            meta_title: String,
            meta_description: String,
            frontmatter: mongoose.Schema.Types.Mixed,
            feature_image_alt: String,
            feature_image_caption: String,
        },
        previous: {},
    },
});

const Page = mongoose.model('Page', pageSchema);

export default Page;
