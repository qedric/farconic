import Spinner from './Spinner'
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
                <Spinner isLoading={isLoading} />
            </div>
            <label className="hidden lg:flex font-semibold">{ isLoading ? 'loading...' : label }</label>
        </button>
    )
}

