import 'dotenv/config';

import { combineResolvers } from 'graphql-resolvers';
import { createToken, isAdmin } from '../../utils';
export const Query = {
  collaboratives: async (parent, args, { models }) => {
    const contents = await models.Collaborative.find().populate('customer');
    return contents;
  },
  collaborative: async (parent, { id }, { models }) =>
    await models.Collaborative.findById(id).populate(),
};
export const Mutation = {
  createCollaborative: async (
    parent,
    { itemId, customerId, feedBack, userId, explicit },
    { models },
  ) => {
    const newCollaborative = await models.Collaborative.create({
      itemId,
      customer: customerId,
      feedBack,
      userId,
      explicit,
    });
    return newCollaborative;
  },
  updateCollaborative: async (
    parent,
    { id, itemId, customerId, feedBack, userId, explicit },
    { models },
  ) => {
    const foundCollaborative = await models.Collaborative.findOneAndUpdate(
      { id },
      { itemId, customerId, feedBack, userId, explicit },
      { new: true },
    ).populate();
    return foundCollaborative;
  },
  deleteCollaborative: async (parent, { id }, { models }) => {
    try {
      const collaborative = await models.Collaborative.findById(id);
      if (!collaborative) {
        throw new Error('Content does not exist with provided id');
      }
      await collaborative.remove();
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
