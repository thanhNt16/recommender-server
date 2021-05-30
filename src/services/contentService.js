import Content from '../models/content'

export async function list({ limit, skip, customer }) {
    const total = await Content.countDocuments({ customer })

    const data = await Content.find({ customer }).limit(limit).skip(skip).populate('customer').lean()
    return {
        total,
        data
    }
}

export async function create({ itemId, content, customerId }) {
    const contentRecord = await Content.create({ itemId, content, customer: customerId})
    return await contentRecord.save()
}

export async function findById(id) {
    return await Content.findById(id)
}

export async function update(id, body) {
    return await Content.findOneAndUpdate(
        { _id: id },
        { ...body },
        { new: true, useFindAndModify: false },
      );
}

export async function deleteOne(id) {
    return await Content.deleteOne({ _id: id })
}