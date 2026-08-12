import BaseService from "../../../shared/database/BaseService.js";
import attributeRepository from "./attribute.repository.js";
import AppError from "../../../shared/errors/AppError.js";
import slugify from "../../../shared/helpers/slugify.js";

class AttributeService extends BaseService {

    constructor() {
        super(attributeRepository);
    }

    async createAttribute(data) {

        if (!data.slug && data.name) {
            data.slug = slugify(data.name);
        }

        const exists =
            await this.repository.existsBySlug(
                data.slug
            );

        if (exists) {

            throw new AppError(
                "Attribute already exists.",
                409
            );

        }

        return await this.repository.create(data);

    }

    async updateAttribute(id, data) {

        if (data.name && !data.slug) {
            data.slug = slugify(data.name);
        }

        const attribute =
            await this.repository.update(
                id,
                data
            );

        if (!attribute) {
            throw new AppError(
                "Attribute not found.",
                404
            );
        }

        return attribute;

    }

    async deleteAttribute(id, deletedBy) {

        const attribute =
            await this.repository.softDelete(
                id,
                {
                    updatedBy: deletedBy,
                }
            );

        if (!attribute) {
            throw new AppError(
                "Attribute not found.",
                404
            );
        }

        return attribute;

    }

    async getVariantAttributes() {

        return await this.repository.findVariantAttributes();

    }

    async getFilterAttributes() {

        return await this.repository.findFilterAttributes();

    }

    async getValues(attributeId) {

        const attribute =
            await this.repository.findById(attributeId);

        if (!attribute) {
            throw new AppError(
                "Attribute not found.",
                404
            );
        }

        return await this.repository.getValues(attributeId);

    }

    async addValue(attributeId, value) {

        if (!value.slug && value.label) {
            value.slug = slugify(value.label);
        }

        const updated =
            await this.repository.addValue(
                attributeId,
                value
            );

        if (!updated) {
            throw new AppError(
                "Attribute not found.",
                404
            );
        }

        return updated;

    }

    async updateValue(
        attributeId,
        valueId,
        data
    ) {

        if (data.label && !data.slug) {
            data.slug = slugify(data.label);
        }

        const updated =
            await this.repository.updateValue(
                attributeId,
                valueId,
                data
            );

        if (!updated) {
            throw new AppError(
                "Attribute or value not found.",
                404
            );
        }

        return updated;

    }

    async deleteValue(
        attributeId,
        valueId
    ) {

        const updated =
            await this.repository.deleteValue(
                attributeId,
                valueId
            );

        if (!updated) {
            throw new AppError(
                "Attribute not found.",
                404
            );
        }

        return updated;

    }

}

export default new AttributeService();