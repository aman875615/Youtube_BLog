
const { validateTokan } = require("../services/authentication");
function cheakForAutnenticationCookie(cookieName){
    return (req,res,next)=>{
        const tokenCookieValue = req.cookies?.[cookieName];
        if(!tokenCookieValue){
            req.user=null;
         return    next();
    }
    try {
        const userPayload = validateTokan(tokenCookieValue);
        req.user = userPayload;
    } catch (error) { 
        req.user = null;
    }
    
      return  next();
    
    };
}   
module.exports = {
    cheakForAutnenticationCookie,
};  
