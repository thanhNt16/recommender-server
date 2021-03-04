import jwt from 'jsonwebtoken'
import morgan from 'morgan';
import chalk from 'chalk'; // or you can use the require('chalk') syntax too

export const morganMiddleware = morgan(function (tokens, req, res) {
    return [
        chalk.hex('#ff4757').bold('🍄  Morgan --> '),
        chalk.hex('#34ace0').bold(tokens.method(req, res)),
        chalk.hex('#ffb142').bold(tokens.status(req, res)),
        chalk.hex('#ff5252').bold(tokens.url(req, res)),
        chalk.hex('#2ed573').bold(tokens['response-time'](req, res) + ' ms'),
        chalk.hex('#f78fb3').bold('@ ' + tokens.date(req, res)),
        chalk.yellow(tokens['remote-addr'](req, res)),
        chalk.hex('#fffa65').bold('from ' + tokens.referrer(req, res)),
        // chalk.hex('#1e90ff')(tokens['user-agent'](req, res)),
    ].join(' ');
});
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