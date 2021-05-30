import * as ContentService from '../services/contentService'

export async function list(req, res) {
    let { skip, limit } = req.query
    skip = skip ? parseInt(skip) : 0
    limit = limit ? parseInt(limit) : 0
    const customer = req.customer._id
    try {
        const results = await ContentService.list({ skip, limit, customer })
        return res.status(200).json(results)
    } catch (error) {
        return res.status(400).send(error.message)
    }
}

export async function create(req, res) {
    const { itemId, content, customerId } = req.body;
    try {
        const results = await ContentService.create({ itemId, content, customerId })
        return res.status(200).json(results)
    } catch (error) {
        return res.status(400).send(error.message)
    }
}

export async function findById(req, res) {
    try {
        const results = await ContentService.findById(req.params.id)
        if (!results) {
            return res.status(400).send(`Not found record with id ${req.params.id}`)
        } else {
            return res.status(200).json(results)
        }
    } catch (error) {
        return res.status(400).send(error.message)
    }
}

export async function update(req, res) {
    try {
        const id = req.params.id
        const body = req.body
        const content = await ContentService.findById(id)
        if (!content) {
            return res.status(400).send(`Not found record with id ${id}`)
        } else {
            const results = await ContentService.update(id, body)
            return res.status(200).json(results)
        }
    } catch (error) {
        return res.status(400).send(error.message)
    }
}

export async function deleteController(req, res) {
    try {
        const id = req.params.id
        const content = await ContentService.findById(id)
        if (!content) {
            return res.status(400).send(`Not found record with id ${id}`)
        } else {
            const results = await ContentService.deleteOne(id)
            return res.status(200).json(results)
        }
    } catch (error) {
        return res.status(200).json(results)
    }
}