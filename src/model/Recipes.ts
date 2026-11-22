import mongoose, { Types } from "mongoose";
const Schema = mongoose.Schema;

interface Option {
    _id: Types.ObjectId,
    name: string,
    isAvailable: boolean
}


export interface OptionGroup {
    _id: Types.ObjectId,
    name: string,
    freeQuota: number,
    unitPrice: number,
    options: Option[]
}

interface Recipes {
    menuname: string,
    price: number,
    isAvailable: boolean,
    optionGroups: OptionGroup[]
    
}

// เกร็ด: mongoose มี trim: true ให้ใน schema
const Recipes = new Schema<Recipes>({
    menuname: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    optionGroups: [{ name: { type: String, trim: true, required: true},
                     freeQuota: { type: Number, required: true},
                     unitPrice: { type: Number, required: true},
                     options: [{ name: { type: String, trim: true, required: true},
                                 isAvailable: { type: Boolean, default: true}
                              }]
                  }]

    
})

export default mongoose.model<Recipes>('Foodmenu', Recipes);