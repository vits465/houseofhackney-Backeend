/**
 * Convert text into SEO friendly slug
 *
 * Example:
 * Luxury Wallpaper
 * ↓
 * luxury-wallpaper
 */

const slugify = (text = "") => {

    return text
        .toString()
        .trim()
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

};

export default slugify;