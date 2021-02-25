import {
    ForbiddenError
} from 'apollo-server';
import {
    skip,
    combineResolvers,
} from 'graphql-resolvers';

const isAuthenticated = (parent, args, {
    me
}) => me ? skip : new ForbiddenError('Not authenticate as User');

export const isAdmin = combineResolvers(
    isAuthenticated,
    (parent, args, {
        me: {
            role
        }
    }) =>
    role === 'ADMIN' ?
    skip :
    new ForbiddenError('Not authorized as admin.'),
);

export const isMessageOwner = async (
    parent, {
        id
    }, {
        models,
        me
    },
) => {
    const message = await models.Message.findByPk(id, {
        raw: true
    });
    if (message.userId !== me.id) {
        throw new ForbiddenError('Not authenticated as owner.');
    }
    return skip;
};
export default isAuthenticated;