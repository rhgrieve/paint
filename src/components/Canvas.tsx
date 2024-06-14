import { forwardRef } from "react"

interface ICanvasProps {
    zIndex: number,
    navbarRef: React.RefObject<HTMLDivElement>
}

export const Canvas = forwardRef<HTMLCanvasElement, ICanvasProps>(
    function Canvas({ zIndex, navbarRef }: ICanvasProps, ref) {
        return (
            <canvas
                ref={ref}
                width={`${window.innerWidth}`}
                height={`${
                window.innerHeight - (navbarRef.current?.offsetHeight || 0)
                }`}
                style={{ position: 'absolute', zIndex }}
            ></canvas>
        )
})
