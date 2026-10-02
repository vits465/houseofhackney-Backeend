import BaseRepository from "../../../shared/database/BaseRepository.js";
import Attribute from "./attribute.model.js";
import { ATTRIBUTE_POPULATE } from "../../../shared/populate/product_sub.populate.js";

class AttributeRepository extends BaseRepository {

    constructor() {
        super(Attribute, ATTRIBUTE_POPULATE);
    }

    async findBySlug(slug) {

        return await this.findOne({
            slug,
            deletedAt: null,
        });

    }

    async existsBySlug(slug) {

        return await this.exists({
            slug,
            deletedAt: null,
        });

    }

    async findVariantAttributes() {

        return await this.findAll({
            isVariant: true,
            status: "ACTIVE",
            deletedAt: null,
        });

    }

    async findFilterAttributes() {

        return await this.findAll({
            isFilterable: true,
            status: "ACTIVE",
            deletedAt: null,
        });

    }
    
    // Get Attribute Values
    async getValues(attributeId) {

        const attribute = await this.model.findOne(
            {
                _id: attributeId,
                deletedAt: null,
            },
            { values: 1 }
        ).populate(ATTRIBUTE_POPULATE);

        return attribute?.values || [];

    }

// Find Value
    async findValue(attributeId, valueId) {

        const attribute = await this.model.findOne(
            {
                _id: attributeId,
                "values._id": valueId,
                deletedAt: null,
            },
            { "values.$": 1 }
        ).populate(ATTRIBUTE_POPULATE);

        return attribute?.values?.[0] || null;

    }

// Add Value ($push)
    async addValue(attributeId, value) {

        const doc = await this.model.findOneAndUpdate(
            {
                _id: attributeId,
                deletedAt: null,
            },
            {
                $push: { values: value },
            },
            {
                new: true,
                runValidators: true,
            }
        ).populate(ATTRIBUTE_POPULATE);

        return doc;

    }

// Update Value ($set with positional operator)
    async updateValue(attributeId, valueId, data) {

        const updateFields = {};

        for (const [key, val] of Object.entries(data)) {
            updateFields[`values.$.${key}`] = val;
        }

        const doc = await this.model.findOneAndUpdate(
            {
                _id: attributeId,
                "values._id": valueId,
                deletedAt: null,
            },
            {
                $set: updateFields,
            },
            {
                new: true,
                runValidators: true,
            }
        ).populate(ATTRIBUTE_POPULATE);

        return doc;

    }

// Delete Value ($pull)
    async deleteValue(attributeId, valueId) {

        const doc = await this.model.findOneAndUpdate(
            {
                _id: attributeId,
                deletedAt: null,
            },
            {
                $pull: {
                    values: { _id: valueId },
                },
            },
            {
                new: true,
            }
        ).populate(ATTRIBUTE_POPULATE);

        return doc;

    }

}

export default new AttributeRepository();