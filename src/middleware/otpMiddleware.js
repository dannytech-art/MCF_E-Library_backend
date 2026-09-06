exports.generateVerificationCode = () =>{
    
  const otp = Math.floor(1000 + Math.random() * 9000);
  const expiresAt = Date.now() + 15 * 60 * 1000;
     return { otp, expiresAt };
}


