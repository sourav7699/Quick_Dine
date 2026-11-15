import jwt from "jsonwebtoken";

const tokenGen = async (idd: string | number): Promise<{ tokenn: string; verify: any } | undefined> => {
  try {
    const secret = process.env.secretkey;
    if (!secret) throw new Error("Missing JWT secret");

    const tokenn = jwt.sign({ id: idd }, secret);
    console.log(tokenn, "token asigned");

    const verify = jwt.verify(tokenn, secret);
    console.log(verify, "token verified");
    return { tokenn, verify };
  } catch (error) {
    console.log(error, "token error");
  }
};

export default tokenGen;
