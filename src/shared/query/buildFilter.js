const buildFilter = (query) => {

    const filter = {};

    Object.entries(query).forEach(
        ([key, value]) => {

            if (
                value === undefined ||
                value === "" ||
                [
                    "page",
                    "limit",
                    "sortBy",
                    "order",
                    "search",
                ].includes(key)
            ) {
                return;
            }

            filter[key] = value;

        }
    );

    return filter;

};

export default buildFilter;