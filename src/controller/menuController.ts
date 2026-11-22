import type { RequestHandler } from "express";
import Recipes from "../model/Recipes.js";
import { isValidMenuname, isValidPrice } from "../utils/validators.js";
import mongoose from "mongoose";
import type { OptionGroup } from "../model/Recipes.js";

const getAllRecipes: RequestHandler = async (req, res) => {

    console.log('req.user =', req.user);

    try{
        const allMenu = await Recipes.find().exec();
        res.json(allMenu);
    }catch(err){
        console.error(err);
        res.status(500).json({ message : 'ดึงข้อมูลไม่สำเร็จ'})
    }
    
}

interface Option {
    name: string,
    isAvailable?: boolean
}

const isValidOption = (o: unknown): o is Option => {
    return typeof o === 'object' && o !== null && 'name' in o && typeof o.name === 'string' 
                                                              && (!('isAvailable' in o) || typeof o.isAvailable === 'boolean')
                                                              && o.name.trim().length > 0
                                                              

}

const isValidOptionGroup = (g: unknown): g is OptionGroup => {
    return typeof g === 'object' && g !== null && 'name' in g && 'freeQuota' in g && 'unitPrice' in g 
                                                                                  && 'options' in g
                                                                                  && typeof g.name === 'string'
                                                                                  && typeof g.freeQuota === 'number'
                                                                                  && typeof g.unitPrice === 'number'
                                                                                  && Array.isArray(g.options)
                                                                                  && g.options.every(isValidOption)
                                                                                  && Number.isInteger(g.freeQuota)
                                                                                  && g.freeQuota >= 0
                                                                                  && g.unitPrice >= 0
                                                                                  && g.name.trim().length > 0                                                                     
}

const addMenu: RequestHandler = async (req, res) => {
    const { menuname, price, optionGroups } = req.body;
    if(!isValidMenuname(menuname)) return res.status(400).json({'message': 'invalid menuname'});
    if(!isValidPrice(price)) return res.status(400).json({'message': 'invalid price'});
    if(optionGroups !== undefined){
        if(Array.isArray(optionGroups)){
            if(!optionGroups.every(isValidOptionGroup)) return res.status(400).json({ message: `invalid optionGroups` });
        }else{
            return res.status(400).json({ message: `wrong body`});
        }
    }
    
    try{
        const duplicateMenu = await Recipes.findOne({ menuname: menuname.trim() }).exec();
        if (duplicateMenu) return res.status(409).json({ message: 'the menu is duplicate' });

        const menu = await Recipes.create({
            menuname: menuname.trim(),
            price: price,
            optionGroups: optionGroups
        });
        res.status(201).json(menu);

    } catch (err){
        if(err instanceof mongoose.Error.CastError){
            return res.status(400).json({ message: `ข้อมูลผิดประเภท` });
        }
        if(err instanceof mongoose.Error.ValidationError){
            return res.status(400).json({ message: `ข้อมูลผิดเงื่อนไข` });
        }

        if (err && typeof err === 'object' && 'code' in err && err.code === 11000) return res.status(409).json({ message: 'เมนูนี้มีอยู่แล้ว' });
        console.error(err);
        return res.status(500).json({ message: 'เพิ่มเมนูไม่สำเร็จ' });
    }

}

const updateMenu: RequestHandler = async (req, res) => {
        if(!req?.params?.id ){
                return res.status(400).json({ "message": `ID parameter is required.`})
            }
        if(!mongoose.isValidObjectId(req.params.id)){
            return res.status(400).json({ message: 'invalid id format'});
        }

        try{
            const menuID = await Recipes.findOne({ _id: req.params.id }).exec();

        // ถ้าไม่เจอ → ตอบ error (404) not found
        if (!menuID) {
            return res.status(404).json({ 'message': `No Recipes matches ID ${req.params.id}.` });
        }

        // แก้เฉพาะ field ที่ส่งมา (ถ้าไม่ส่งมาก็คงค่าเดิม)
        // ชื่อส่งมาไหม? ถ้าส่งมเช็คก่อนว่าชื่อซ้ำกับอันอื่นไหมถ้าไม่ซ้ำก็เปลี่ยนชื่อ
        if (req.body.menuname !== undefined) {
            if (!isValidMenuname(req.body.menuname)) return res.status(400).json({ 'message': 'invalid menuname'});
            const menuname = req.body.menuname.trim();     // ปลอดภัยแล้ว
            //บอก MongoDB ว่า "ห้ามนับตัวที่กำลังแก้อยู่" | $ne = not equal — เป็น query operator ตัวแรกที่คุณได้ใช้ ยังมี $gt $lt $in $regex อีกเพียบ พวกนี้เขียนอยู่ในค่าของ field แทนที่จะเป็นค่าตรงๆ
            
            const duplicate = await Recipes.findOne({ menuname: menuname, _id: { $ne: req.params.id } }).exec();
            if(duplicate) return res.sendStatus(409);
            menuID.menuname = menuname;
            
        }
        if (req.body.price !== undefined) {
            if(!isValidPrice(req.body.price)){
            return res.status(400).json({ 'message': 'invalid menu price'});
            }   
            menuID.price = req.body.price;
        }

        const result = await menuID.save();
        res.json(result);
        }catch(err){
            if (err instanceof mongoose.Error.CastError)
            return res.status(400).json({ message: `${err.path} ไม่ถูกต้อง: ${err.value}` });

        if (err instanceof mongoose.Error.ValidationError)
            return res.status(400).json({ message: err.message });

        if (err && typeof err === 'object' && 'code' in err && err.code === 11000)
            return res.status(409).json({ message: 'เมนูนี้มีอยู่แล้ว' });

        console.error(err);                                    //ทุกอย่างที่นึกไม่ถึง
        return res.status(500).json({ message: 'server error' });
        }

}

const deleteMenu: RequestHandler = async (req, res) => {
    if(!req?.params?.id) return res.status(400).json({ 'message': `ID is required`});
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).json({ message: 'invalid id format'})
    }
    try{
        const deleted = await Recipes.findOneAndDelete({ _id: req.params.id }).exec();
        if(!deleted) return res.status(404).json({ message: `no Recipes matches ID ${req.params.id}` });
        res.json({ message: 'deleted', deleted });
    } catch(err){
        if(err instanceof mongoose.Error.CastError){
            return res.status(400).json({ message: `${err.path} ไม่ถูกต้อง: ${err.value}` });
        }
        console.error(err);                                    
        return res.status(500).json({ message: 'server error' });
        }

}       

export { getAllRecipes, addMenu, updateMenu, deleteMenu }