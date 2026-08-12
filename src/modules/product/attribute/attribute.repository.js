import BaseRepository from "../../../shared/database/BaseRepository.js";
import Attribute from "./attribute.model.js";

class AttributeRepository extends BaseRepository {

    constructor() {
        super(Attribute);
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
        );

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
        );

        return attribute?.values?.[0] || null;

    }

// Add V alue($push)

    
    async addValue(attributeId, value) {

        return await this.model.findOneAndUpdate(
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
        );

    }

// Update V alue($set with positional operator)

    
    async updateValue(attributeId, valueId, data) {

        const updateFields = {};

        for (const [key, val] of Object.entries(data)) {
            updateFields[`values.$.${key}`] = val;
        }

        return await this.model.findOneAndUpdate(
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
        );

    }

// Delete V alue($pull)

    
    async deleteValue(attributeId, valueId) {

        return await this.model.findOneAndUpdate(
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
        );

    }

}

export default new AttributeRepository();