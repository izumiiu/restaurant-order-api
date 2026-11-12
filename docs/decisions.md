
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

## 2026-10-23 การเขียนเทส role ต้องเป็น employee
Problem   : เทสต้องมี user ที่ role = employee แต่ /register สร้างได้แค่ customer
Options   : A) User.create ตรงๆ  B) register แล้ว updateOne แก้ role  C) ให้ /register รับ role
Decision  : B) เพราะไม่ได้ข้าม api และไม่ต้องไปยุ่งกับ bcrypt
Trade-off : ช้ากว่าเพราะต้องผ่าน bcrypt แต่ตั้งใจออกแบบไห้เป็นแบบนี้

## 2026-11-10 0.0.0.0/0 ใน IP access list
Problem   : การตั้ง 0.0.0.0/0 ใน IP access list ใน cluster ของ mongo atlas มันทำไห้ ip ไหนเข้าถึงก็ได้แต่ถ้าไม่ตั้ง ก็จะมีปัญหาตอน deploy ผ่าน webservice
Options   : A) ตั้ง 0.0.0.0/0 ไว้เหมือนเดิม B) จ่ายเงินซื้อ static outbound IP ของ host C) VPC Peering / Private Endpoint ของ Atlas — ต้อง M10 ขึ้นไป (เสียเงิน) M0 ฟรีทำไม่ได้ D) ใส่เฉพาะ IP ของ host
Decision  : เลือก A) เพราะ mongo atlas ที่ใช้เป็น package M0 (package free) และระบบนี้ไม่ได้ใหญ่ถึงขั้นต้องจ่ายเงินซื้อและถ้าใส่ ip ของ host จะล่มตอน host เปลี่ยน IP ซึ่งเราไม่รู้ว่า host จะเปลี่ยน IP ตอนไหน
Trade-off : เปิด 0.0.0.0/0 เป็นการตัด network layer ออกจากการป้องกันทั้งหมดแต่ยังมีด่านที่เหลือ 2 ขั้นคือ 1)db password มีสิทธิ์แค่ readWrite@restaurant01 2).env ไม่หลุด
Revisit when : เมื่อซื้อ static outbound IP หรือ เมื่อเปลี่ยนไปใช้ package M10 ขึ้นไป หรือตอนเริ่มเก็บข้อมูลลูกค้าจริง


