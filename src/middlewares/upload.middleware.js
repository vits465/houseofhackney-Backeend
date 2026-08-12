import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {

    const allowedMimeTypes = [

        "image/jpeg",

        "image/png",

        "image/webp",

        "image/avif",

        "image/svg+xml",

    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {

        return cb(
            new Error("Only image files are allowed."),
            false
        );

    }

    cb(null, true);

};

const upload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize: 10 * 1024 * 1024,

    },

});

export default upload;