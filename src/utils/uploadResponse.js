const uploadResponse = (media) => ({
    id: media._id,
    url: media.secureUrl,
    alt: media.alt,
    width: media.width,
    height: media.height,
});

export default uploadResponse;