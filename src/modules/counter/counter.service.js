import counterRepository from "./counter.repository.js";

class CounterService {

    async generateSku(productType) {

        const map = {
            WALLPAPER: "WAL",
            FABRIC: "FAB",
            FURNITURE: "FUR",
            LIGHTING: "LIG",
            PAINT: "PAI",
            ACCESSORY: "ACC",
        };

        const prefix = map[productType] || "PRD";

        const counter =
            await counterRepository.getNextSequence(
                productType,
                prefix
            );

        return `${prefix}-${String(counter.sequence).padStart(6, "0")}`;

    }

}

export default new CounterService();