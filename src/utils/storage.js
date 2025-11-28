export const storage = {
    get: (key) => {
        return new Promise((resolve) => {
            try {
                const value = localStorage.getItem(key);
                resolve(value ? JSON.parse(value) : null);
            } catch (e) {
                console.warn("Error reading from localStorage:", e);
                resolve(null);
            }
        });
    },

    set: (key, value) => {
        return new Promise((resolve) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.warn("Error writing to localStorage:", e);
            }
            resolve();
        });
    },

    remove: (key) => {
        return new Promise((resolve) => {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.warn("Error removing from localStorage:", e);
            }
            resolve();
        });
    },
};
