const mergeGraphqlSchemas = require('merge-graphql-schemas');
const fileLoader = mergeGraphqlSchemas.fileLoader;
const mergeResolvers = mergeGraphqlSchemas.mergeResolvers;
const resolvers = mergeResolvers(fileLoader(`${__dirname}/../../models/**/resolvers.js`), { extensions: ['.js'] });

export default resolvers;