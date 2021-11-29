class Collision {
    public static readonly isHitWall = (
        srcX: number,
        srcY: number,
        srcW: number,
        srcH: number,
        destX: number,
        destY: number,
        destW: number,
        destH: number
    ): boolean => {
        if (((srcX + srcW) >= (destX)) && ((srcX) <= (destX))) {
            if (((srcY + srcH) >= (destY)) && ((srcY) <= (destY))) {
                return true;
            }
        }

        return false;
    }
}

export default Collision
