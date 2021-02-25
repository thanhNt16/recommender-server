import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AuthenticationError, UserInputError } from 'apollo-server';
import 'dotenv/config';

import { combineResolvers } from 'graphql-resolvers';
import { createToken, isAdmin } from '../../utils';
export const Query = {
  contents: async (parent, args, { models }) => {
    const contents = await models.Content.find().populate('customer');
    console.log('cus', contents);
    return contents;
  },
  content: async (parent, { id }, { models }) =>
    await models.Content.findById(id).populate(),
};
export const Mutation = {
  createContent: async (
    parent,
    { itemId, customerId, content },
    { models },
  ) => {
    const newContent = await models.Content.create({
      itemId,
      customer: customerId,
      content,
    });
    return newContent;
  },
  updateContent: async (
    parent,
    { id, itemId, customerId, content },
    { models },
  ) => {
    const foundContent = await models.Content.findOneAndUpdate(
      { id },
      { itemId, customerId, content },
      { new: true },
    ).populate();
    return foundContent;
  },
  deleteContent: async (parent, { id }, { models }) => {
    try {
      const content = await models.Content.findById(id);
      if (!content) {
        throw new Error('Content does not exist with provided id');
      }
      await content.remove();
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
