import type { RequestHandler } from "express";
import Recipes from "../model/Recipes.js";
import { isValidMenuname, isValidPrice } from "../utils/validateMenu.js";


const getAllRecipes: RequestHandler = async (req, res) => {
    const allMenu = await Recipes.find().exec();
    res.json(allMenu);

}

const addMenu: RequestHandler = async (req, res) => {
    const { menuname, price } = req.body;
    if(!isValidMenuname(menuname)) return res.status(400).json({'message': 'invalid menuname'})
    if(!isValidPrice(price)) return res.status(400).json({'message': 'invalid price'})

    const duplicateMenu = await Recipes.findOne({ menuname: menuname.trim() }).exec();
    if (duplicateMenu) return res.sendStatus(409);

    try{
        const menu = await Recipes.create({
            menuname: menuname.trim(),
            price: price
        });
        res.status(201).json(menu);
    } catch (err: any){
        if (err.code === 11000) return res.status(409).json({ message: 'เมนูนี้มีอยู่แล้ว' });
        res.status(500).json({ message: 'เพิ่มเมนูไม่สำเร็จ' });
    }

}

const updateMenu: RequestHandler = async (req, res) => {
    if(!req?.params?.id ){
            return res.status(400).json({ "message": `ID parameter is required.`})
        }

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
}

const deleteMenu: RequestHandler = async (req, res) => {
    if(!req?.params?.id) return res.status(400).json({ 'message': `ID is required`});
    const deleted = await Recipes.findOneAndDelete({ _id: req.params.id }).exec();
    if(!deleted) return res.status(404).json({ message: `no Recipes matches ID ${req.params.id}` });
    res.json({ message: 'deleted', deleted });

}       

export { getAllRecipes, addMenu, updateMenu, deleteMenu }