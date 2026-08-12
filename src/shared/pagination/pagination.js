const pagination = (query) => {

    const page = Math.max(
        parseInt(query.page, 10) || 1,
        1
    );

    const limit = Math.min(
        parseInt(query.limit, 10) || 10,
        100
    );

    const skip = (page - 1) * limit;

    return {
        page,
        limit,
        skip,
    };

};

export default pagination;