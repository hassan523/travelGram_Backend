import mongoose from 'mongoose';
const { Schema } = mongoose;

const currencySchema = new Schema({
    country: { 
        type: String, 
        required: true 
    },
    currency: { 
        type: String, 
        required: true 
    },
    currencyCode: { 
        type: String, 
        required: true 
    },
    numericCode: { 
        type: String
     }
}, { timestamps: true });


export default mongoose.model("Currency", currencySchema);