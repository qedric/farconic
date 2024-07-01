export const Refresh = ({ onRefresh, onComplete, isLoading, label }: { onRefresh: Function, onComplete: Function, isLoading: boolean, label: string }) => {

    const handleClick = async () => {
        if (!isLoading) {
            onRefresh()
                .then(() => {
                    onComplete()
                })
                .catch((error: any) => {
                    // Handle error if needed
                    console.error('Error during refresh:', error)
                })
        }
    }

    return (
        <button
            className={`flex items-center justify-between refresh-button ${isLoading ? 'loading' : ''}`}
            onClick={handleClick}
            disabled={isLoading}
        >
            <svg
                className={`w-10 mr-2 h-fit refresh-icon ${isLoading ? 'animate-spin' : ''}`}
                width="768"
                height="640"
                viewBox="0 0 768 640"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M384 576C336.608 576 292.336 562.816 254.224 540.288L207.616 586.896C259.895 621.587 321.258 640.061 384 640C560.736 640 704 496.736 704 320H640C640 461.152 525.152 576 384 576ZM384 0.000151739C207.264 0.000151739 64 143.264 64 320H128C128 178.848 242.848 64.0002 384 64.0002C431.392 64.0002 475.664 77.1842 513.776 99.7122L560.384 53.1042C508.105 18.4133 446.742 -0.0610842 384 0.000151739ZM576 320H768L672 192L576 320ZM192 320H0L96 448L192 320Z"
                    fill="black"
                />
            </svg>
            {isLoading ? 'loading...' : label}
        </button>
    )
}