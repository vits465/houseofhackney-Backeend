const buildSearch = (
    keyword,
    fields = []
) => {

    if (!keyword || fields.length === 0) {
        return {};
    }

    return {
        $or: fields.map((field) => ({
            [field]: {
                $regex: keyword,
                $options: "i",
            },
        })),
    };

};

export default buildSearch;