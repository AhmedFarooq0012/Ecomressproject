import bcrypt from 'bcrypt';


// for registration password hashing
export const hashPassword = async(password:string)=>{
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);
    return hashedPassword;
}

// for login password comparison
export const comparePassword = async(password:string,hashedpassword:string)=>{
  // Isme salt ki zaroorat nahi hoti kyunke hash ke andar salt pehle se mojood hota hai
  const matchpassword = await bcrypt.compare(password,hashedpassword);
  return matchpassword;
}