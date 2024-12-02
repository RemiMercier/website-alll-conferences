
const handleScrollTop = () => {
    if (window.scrollY
        > window.innerHeight / 2) {
        window.scroll({
            top: 0,
            left: 0,
            behavior: "smooth",
        });
    }
}

export { handleScrollTop }