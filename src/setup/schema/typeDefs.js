const mergeGraphqlSchemas = require('merge-graphql-schemas');
const fileLoader = mergeGraphqlSchemas.fileLoader;
const mergeTypes = mergeGraphqlSchemas.mergeTypes;

const typeDefs = mergeTypes(fileLoader(`${__dirname}/../../models/**/types.graphql`), { all: true });

export default typeDefs;
