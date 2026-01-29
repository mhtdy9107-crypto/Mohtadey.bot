/**
 * @تحسين وتطوير: ᎠᎯᏁᎢᎬᏚᎮᎯᏒᎠᎯ
 * @النسخة: V7.0.0 [ULTRA]
 * @الوصف: كود عرض معلومات المطور والبوت بتنسيق فخم
 */

const config = {
    name: "المطور",
    description: "عرض معلومات مطور نظام ڪايࢪوس",
    usage: "المطور",
    cooldown: 5,
    permissions: [0],
    credits: "Ꮥ.ᎥᏁᎨᎧᎯᏴᎨᏟᎻᎥᎯᎶᎯ",
};

const langData = {
    ar_SY: {
        info:
` 
         ✧ كيفن | Ꮥ.ᎥᏁᎨᎧ ✧

   ⊹ الــبادئة:<-> 
   ⊹ الـخـوادم: نشط في المجموعات
الــــــمطوࢪ
   ⊹ الـــمطوࢪ: Ꮥ.ᎥᏁᎨᎧᎯᏴᎨᏟᎻᎥᎯᎶᎯ
    الـعـمـر: 17 

    الـتـواصـل الـرسـمـي
   
    فـيـسـبـوك:
   https://www.facebook.com/profile.php?id=61586897962846

  ........................... 
  . 
    `
    },
};

async function onCall({ message, getLang }) {
    try {
        const { threadID } = message;

        return global.api.sendMessage(
            getLang("info"),
            threadID
        );
    } catch (e) {
        console.error("Developer info error:", e);
    }
}

export default {
    config,
    langData,
    onCall,
};
