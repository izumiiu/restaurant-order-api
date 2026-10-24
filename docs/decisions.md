
## 2026-10-04  DB สำหรับ integration test
Problem   : beforeEach ต้องล้าง DB ทุกเทส ถ้าชี้ไป Atlas ตัวจริงข้อมูลหายหมด
Options   : A) mongodb-memory-server  B) แยก database ใน Atlas  C) Docker/Testcontainers
Decision  : เลือก A
Trade-off : เวอร์ชัน MongoDB ไม่ตรงกับ Atlas เป๊ะ และต้องโหลด binary ครั้งแรก
            แต่แลกมากับความเร็ว ความปลอดภัย และ `npm test` ที่ทำงานได้ทันทีหลัง clone

## 2026-10-04  ปล่อย npm audit high ไว้ (braces/nodemon)
Problem   : npm audit แจ้ง 3 high จาก nodemon -> chokidar -> braces (DoS)
Options   : A) ปล่อยไว้  B) npm audit fix --force  C) เปลี่ยนไปใช้ node --watch
Decision  : A — devDependency, input เราคุมเอง, DoS ไม่ใช่ RCE
Trade-off : audit จะขึ้นแดงไปเรื่อยๆ (B จะย้อน nodemon กลับไปรุ่น 2018 = พังกว่าเดิม)

## 2026-10-21  การแก้ bug ที่ req.body เป็น undefined
Problem   : ตอนเทส registerController ด้วย vitest เจอ bug ที่ res.status เป็น 500 แทนที่ควรเป็น 400 แต่ไม่เจอตอนเทสด้วย postman เพราะใน postman เมื่อเลือก body->raw->JSON มันจะติด Content-Type ไห้อัตโนมัติ แต่ใน vitest ไม่ได้ติดอะไรไห้เลยเป็น undefined การ destructure จาก undefined = โยน TypeError ทันที → ไม่มีใครจับ → Express โยน 500 ออกมาซึ่งคาดว่าจะerror เหมือนกันทุก controller เพราะยังไม่มีการทำ validation
Options   : A) เขียน req.body ?? {}; ทุก controller B) ทำ middleware สำหรับตั้ง req.body เป็น {} หากมันเป็น undefined->วางไว้หลัง express.json() 
Decision  : เลือก B) เพราะจะได้ไม่ต้องเขียน req.body ?? {}; ใหม่ทุก controller หรือเมื่อมีการเพิ่ม controller ใหม่ขึ้นมา 
Trade-off : คนที่มารับช่วง project ต่อจะไม่รู้ว่า req.body ปลอดภัยได้ยังไงแต่สามารถแก้ใขปัญหานี้ได้ด้วยการ comment ไว้

# 2026-10-23 การเขียนเทส role ต้องเป็น employee
Problem    เทสต้องมี user ที่ role = employee แต่ /register สร้างได้แค่ customer
Options    A) User.create ตรงๆ  B) register แล้ว updateOne แก้ role  C) ให้ /register รับ role
Decision   B) เพราะไม่ได้ข้าม api และไม่ต้องไปยุ่งกับ bcrypt
Trade-off  ช้ากว่าเพราะต้องผ่าน bcrypt แต่ตั้งใจออกแบบไห้เป็นแบบนี้