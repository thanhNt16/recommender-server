import jwt from 'jsonwebtoken';

const createToken = (user, secret, expiresIn) => {
    const {
        id,
        email,
        fullName,
        role
    } = user;
    const token = jwt.sign({
        id,
        email,
        fullName,
        role
    }, secret, {
        expiresIn
    })

    return token;
};

export default createToken;