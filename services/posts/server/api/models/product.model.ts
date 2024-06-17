import mongoose from 'mongoose';

const { Schema } = mongoose;

const ProductSchema = new Schema({
    
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: false
    },
    _group: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    // Custom Fields
    crm_custom_fields: {
        type: Map,
        of: String
    }
});

const Product = mongoose.model('Product', ProductSchema);

export { Product }
