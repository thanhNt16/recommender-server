import jwt from 'jsonwebtoken'
const auth = async(req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, process.env.JWT_KEY)
        const { role, email, fullName } = data
        const customer = await req.context.models.Customer.findOne({ role, email, fullName })

        if (!customer) {
            res.status(401).send({ error: 'Not authorized to access this resource' })
        }
        req.customer = customer
        req.accessToken = token
        next()
    } catch (error) {
        console.log(error)
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }

}
export default auth