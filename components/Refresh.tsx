export const Refresh = ({ onRefresh, onComplete, isLoading, isDisabled, label }: { onRefresh: Function, onComplete: Function, isLoading: boolean, isDisabled: boolean, label: string }) => {

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
            className="lg:basis-1/4 flex items-center justify-start"
            onClick={handleClick}
            disabled={ isLoading || isDisabled }
        >
            <div className="flex justify-center items-center lg:border border-black rounded-full py-2 w-12 lg:w-20 lg:mr-2 h-[42px]">
                <svg className={`h-full ${isLoading ? 'do-not-animate-spin' : ''}`} width="80" height="72" viewBox="0 0 80 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M69.7666 25.4466L79.1066 24.3466L66.7266 45.3166L50.6666 27.6866L60.7466 26.5066C59.0466 21.8066 56.0466 17.6566 52.0566 14.5466C40.4266 5.47658 23.6266 7.55657 14.5566 19.1866C5.48657 30.8166 7.56657 47.6166 19.1966 56.6866C30.8366 65.7566 47.6266 63.6866 56.6966 52.0466L63.7166 57.5266C51.6166 73.0466 29.2366 75.8166 13.7166 63.7166C-1.79343 51.6266 -4.56343 29.2266 7.52657 13.7166C19.6166 -1.79343 42.0166 -4.56343 57.5266 7.52657C63.3966 12.0966 67.6566 18.3766 69.7666 25.4466Z" fill="#848484"/>
                </svg>
            </div>
            <label className="hidden lg:flex font-semibold">{ isLoading ? 'loading...' : label }</label>
        </button>
    )
}

