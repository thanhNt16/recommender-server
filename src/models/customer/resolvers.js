import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import {
    AuthenticationError,
    UserInputError
} from 'apollo-server';
import 'dotenv/config';

import {
    combineResolvers
} from 'graphql-resolvers';
import {
    createToken,
    isAdmin
} from '../../utils';
export const Query = {
    customers: async (parent, args, {
        models
    }) => await models.Customer.find(),
    customer: async (parent, {
        id
    }, {
        models
    }) => await models.Customer.findById(id),
    me: async (parent, args, {
        models,
        me
    }) => {
        if (!me) {
            return null;
        }
        return await models.Customer.findById(me.id)
    }
};
export const Mutation = {
    signUp: async (parent, {
        fullName,
        email,
        password
    }, {
        models,
        secret
    }) => {
        const customer = await models.Customer.findOne({ email });
        if (customer) {
            throw new Error("Customer with this email already existed");
        }

        const newCustomer = await models.Customer.create({
            fullName,
            email,
            password,
        });
        const token = createToken(newCustomer, secret, '30m')
        newCustomer.accessToken = token
        newCustomer.password = bcrypt.hashSync(newCustomer.password, 10)
        newCustomer.save((err) => {
            if (err) {
                console.log("Error: " + err.message);
            }
        })

        return newCustomer;
    },
    signIn: async (parent, {
        email,
        password
    }, {
        models,
        secret
    }) => {
        const customer = await models.Customer.findOne({ email });

        if (!customer) {
            throw new UserInputError(
                'No customer found with this login credential'
            );
        }

        const isValid = bcrypt.compareSync(password, customer.password)
        if (!isValid) {
            throw new AuthenticationError(
                'Invalid password'
            );
        }
        const verifiedUser = jwt.verify(customer.accessToken, process.env.SECRET);
        if (!verifiedUser) {
            const token = createToken(customer, secret, '30m')
            customer.accessToken = token
            customer.save((err) => {
                if (err) {
                    console.log("Error: " + err.message);
                }
            }) 
        }

        return customer;
    },
    deleteUser: async (parent, {
        id
    }, {
        models
    }) => {
        try {
            const customer = await models.Customer.findById(id)
            if (!customer) {
                throw new Error("Customer does not exist")
            }
            await customer.remove()
            return true
        } catch (error) {
            throw new Error(error.message)
        }
    }
};