const JWT = require("jsonwebtoken");

const secret = "$uperMan@123";

function createTokenForUser(user){
    const payload = {
        id: user._id,
        email:user.email,
        profileImageURL:user.profileImageURL,
        fullName: user.fullName,
        role: user.role,
    };
    const token = JWT.sign(payload,secret);
    return token;
}

function validateTokan(token){
     return JWT.verify(token,secret);
    
}

module.exports = {
    createTokenForUser, 
    validateTokan,

}