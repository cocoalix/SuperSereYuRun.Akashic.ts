import createCourse1 from '../course/1'
const createGameScene = () => {
    const scene = new g.Scene({
        game: g.game,
        assetIds: [
            "player",
            "yu_1",
            "course_1",
        ],
    });
    
    const font = new g.DynamicFont({
        game: g.game,
        fontFamily: "sans-serif",
        size: 15
    });

    const RECTANGLE_SIZE = 32;
    const YU_BALL_SIZE = 128;
    const PLAYER_WIDTH = 64;
    const PLAYER_HEIGHT = 128;

    var speed = 1;
    var jumpVel = 30; 
    var canFall = true;
    var isHittingWall = false;
    var isHittingFloor = false;

    const isHitWall = (
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

    const getBlock = (scene: any, size: number, x: number, y: number) => {
        return new g.FilledRect({
            scene: scene,
            cssColor: "#000",
            width: RECTANGLE_SIZE,
            height: RECTANGLE_SIZE,
            x: x * RECTANGLE_SIZE,
            y: y * RECTANGLE_SIZE,
        });
    }

    const generateStage = (courseId: number, course: number[][]): Array<g.E[]> => {
        const arr: Array<g.E[]> = [];
        for (var row = 0; row < course.length; row++) {
            const colArr: Array<g.E|null> = [];
            for (var col = 0; col < course[row].length; col++) {
                switch (course[row][col]) {
                    case 0:
                        colArr.push(null);
                        break;
                    case 1:
                        const rect = getBlock(scene, RECTANGLE_SIZE, col, row);
                        rect.onUpdate.add(() => {
                            // 以下のコードは毎フレーム実行されます。
                            rect.x -= speed;
                            rect.modified();
                        });
                        scene.append(rect);
                        colArr.push(rect);
                        break;
                    case 2:
                        const yu = new g.Sprite({
                            scene: scene,
                            src: scene.asset.getImageById("yu_" + courseId),
                            width: YU_BALL_SIZE,
                            height: YU_BALL_SIZE,
                            scaleX: 0.5,
                            scaleY: 0.5,
                            x: col * RECTANGLE_SIZE,
                            y: row * RECTANGLE_SIZE,
                        });
                        yu.onUpdate.add(() => {
                            // 以下のコードは毎フレーム実行されます。
                            yu.x -= speed;
                            yu.modified();
                        });
                        scene.append(yu);
                        colArr.push(yu);
                        break;
                }
            }
            arr.push(colArr);
        }

        return arr;
    }

    scene.onLoad.add(() => {
        const backgroundRect = new g.FilledRect({
            scene: scene,
            cssColor: "#036ffc",
            width: g.game.width,
            height: g.game.height,
            x: 0,
            y: 0,
        });

        backgroundRect.touchable = true;
        backgroundRect.pointDown.add(() => {
            console.error("!!!!!!!!!! JUMP !!!!!!!!!!");
            if (isHittingFloor) {
              jumpVel = -16;
            }
        });

        scene.append(backgroundRect);

        const course: number[][] = createCourse1();
        const courseObjects = generateStage(1, course);

        // crate yucon-chan
        const player = new g.FrameSprite({
            scene: scene,
            src: scene.asset.getImageById("player"),
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT,
            srcWidth: PLAYER_WIDTH,
            srcHeight: PLAYER_HEIGHT,
            frames: [0, 1],
            interval: 500,
            loop: true,
            x: 100,
            y: 100,
        });
        player.onUpdate.add(() => {
            canFall = true;
            isHittingWall = false;
            isHittingFloor = false;
            var isHit = false;
            for (var row = 0; row < courseObjects.length; row++) {
                for (var col = 0; col < courseObjects[row].length; col++) {
                    if (courseObjects[row][col] == null) {
                        continue;
                    }

                    isHit = g.Collision.intersectEntities(player, courseObjects[row][col]);
                    if (!isHit) {
                        continue;
                    }

                    // スプライトと当たったらゆ玉と当たった判定にしてcollectする
                    if (courseObjects[row][col] instanceof g.Sprite) {
                        courseObjects[row][col].hide();
                        continue;
                    }


                    if (isHitWall(
                        player.x,
                        player.y,
                        PLAYER_WIDTH + speed,
                        PLAYER_HEIGHT,
                        courseObjects[row][col].x,
                        courseObjects[row][col].y + 10,
                        RECTANGLE_SIZE,
                        RECTANGLE_SIZE
                    )) {
                        isHittingWall = true;
                        continue;
                    }

                    if (!isHittingFloor
                    &&  player.y + PLAYER_HEIGHT > courseObjects[row][col].y - RECTANGLE_SIZE
                    ) {
                        if (jumpVel >= 0) {
                            canFall = false;
                            jumpVel = -1;
                        }
                        player.y = courseObjects[row][col].y - PLAYER_HEIGHT;
                        isHittingFloor = true;
                    }
                }
            }

            console.log((player.y));

            if (canFall) {
                if (jumpVel !== 30) {
                    jumpVel++;
                }
                player.y += jumpVel;
            }
            if (isHittingWall) {
                console.error("VVVVVVVVVV HITTING WALL VVVVVVVVVV");
                player.x += -1 * speed;
            } else if (player.x < 200) {
                player.x += 2;
            }

            player.modified();
        });

        scene.append(player);
        player.start();
    });

    return scene;
}


export default createGameScene;
