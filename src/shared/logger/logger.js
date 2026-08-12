class Logger {

    info(message, data = null) {

        console.log(
            `[INFO] ${new Date().toISOString()}`,
            message,
            data ?? ""
        );

    }

    warn(message, data = null) {

        console.warn(
            `[WARN] ${new Date().toISOString()}`,
            message,
            data ?? ""
        );

    }

    error(message, error = null) {

        console.error(
            `[ERROR] ${new Date().toISOString()}`,
            message,
            error ?? ""
        );

    }

}

export default new Logger();