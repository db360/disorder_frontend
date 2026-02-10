export default function LoadingSpinner() {
    return (
        <div className="fixed inset-0 flex items-center justify-center min-h-screen z-50" role="status">
            <svg
                aria-hidden="true"
                className="inline w-30 h-30 text-white dark:text-primary-300"
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <path
                        id="spinner-text-path"
                        d="M 100,100 m -70,0 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0"
                    />
                </defs>
                <g className="origin-center animate-spin" style={{ animationDuration: "2s" }}>
                    <text className="fill-current text-[18px] uppercase tracking-[0.30em]">
                        <textPath href="#spinner-text-path" startOffset="0%">
                            Disorder   Underground   Shop   •
                        </textPath>
                    </text>
                </g>
            </svg>
            <span className="sr-only">Loading...</span>
        </div>
    );
}