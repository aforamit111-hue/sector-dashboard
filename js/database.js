// =====================================
// DATABASE ENGINE
// Version 11.0
// =====================================

const DB = {

    save(key, data) {
        localStorage.setItem(
            key,
            JSON.stringify(data)
        );
    },

    load(key, defaultValue = []) {

        const value =
            localStorage.getItem(key);

        if (!value)
            return defaultValue;

        return JSON.parse(value);

    },

    remove(key) {

        localStorage.removeItem(key);

    },

    clear() {

        localStorage.clear();

    }

};