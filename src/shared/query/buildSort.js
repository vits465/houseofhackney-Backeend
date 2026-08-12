const buildSort = (
    sortBy = "createdAt",
    order = "desc"
) => {

    return {
        [sortBy]: order === "asc" ? 1 : -1,
    };

};

export default buildSort;