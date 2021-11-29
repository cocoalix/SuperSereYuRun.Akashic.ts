import createCourse1 from '../course/1';
import createResultNotify from '../ui/resultNotify';
import Collision from '../util/collision';

const createGameScene = () => {
    const scene = new g.Scene({
        game: g.game,
        assetIds: [
            "player",
            "warpstar",
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
    const MAX_SPEED = 15;
    const SPEEDUP_FRAME_COUNT = 180;

    const TAG_YU = "yu";
    const TAG_WARPSTAR = "warpstar";

    var currentCourse = 1;

    var runCount = 0;
    var speed = 5;

    var jumpVel = 30; 
    var canFall = true;

    var isHittingWall = false;
    var isHittingFloor = false;
    var isGameOver = false;

    var runningDistance = 0;
    var lifeTime = 0;

    const getScrollLabel = (scene: g.Scene, text: string) => {
        const label = new g.Label({
            scene: scene,
            font: font,
            text: text,
            fontSize: 24,
            textColor: "#fff",
            x: g.game.width,
            y: g.game.height / 2,
        });
        
        label.onUpdate.add(() => {
            label.x -= 5;
            if (label.x + label.width < 0) {
                console.error('!!!!!!! destroyed !!!!!!!');
                label.destroy();
            }
        });

        return label;
    }

    const getLabel = (scene: g.Scene, fontSize: number, text: string, x: number, y: number) => {
        const label = new g.Label({
            scene: scene,
            font: font,
            text: text,
            fontSize: fontSize,
            textColor: "#fff",
            x: x,
            y: y,
        });
        
        return label;
    }

    // get block
    const getBlock = (scene: any, size: number, x: number, y: number, offsetX: number) => {
        return new g.FilledRect({
            scene: scene,
            cssColor: "#000",
            width: size,
            height: size,
            x: x * size + offsetX,
            y: y * size,
        });
    }

    // get YU-ball
    const getYu = (scene: any, courseId: number, x: number, y: number, offsetX: number) => {
        return new g.Sprite({
            scene: scene,
            src: scene.asset.getImageById("yu_" + courseId),
            tag: TAG_YU,
            width: YU_BALL_SIZE,
            height: YU_BALL_SIZE,
            scaleX: 0.5,
            scaleY: 0.5,
            x: x * RECTANGLE_SIZE + offsetX,
            y: y * RECTANGLE_SIZE,
        });
    }

    // get warpstar
    const getWarpstar = (scene: any, x: number, y: number, offsetX: number) => {
        return new g.Sprite({
            scene: scene,
            src: scene.asset.getImageById("warpstar"),
            tag: TAG_WARPSTAR,
            width: YU_BALL_SIZE,
            height: YU_BALL_SIZE,
            scaleX: 0.5,
            scaleY: 0.5,
            x: x * RECTANGLE_SIZE + offsetX,
            y: y * RECTANGLE_SIZE,
        });
    }

    const getUpdateEventForFieldObject = (obj: g.E) => {
        return () => {
            obj.x -= speed;
            obj.modified();
        }
    }

    const createCourse = (courseId: number, course: number[][], offsetX: number = 0): Array<g.E[]> => {
        const arr: Array<g.E[]> = [];
        for (var row = 0; row < course.length; row++) {
            const colArr: Array<g.E|null> = [];
            for (var col = 0; col < course[row].length; col++) {
                switch (course[row][col]) {
                    case 0:
                        colArr.push(null);
                        break;

                    case 1:
                        const rect = getBlock(scene, RECTANGLE_SIZE, col, row, offsetX);
                        rect.onUpdate.add(getUpdateEventForFieldObject(rect));
                        scene.append(rect);
                        colArr.push(rect);
                        break;

                    case 2:
                        const yu = getYu(scene, courseId, col, row, offsetX);
                        yu.onUpdate.add(() => {
                            yu.x -= speed;
                            yu.modified();
                        });
                        scene.append(yu);
                        colArr.push(yu);
                        break;

                    case 9:
                        const warpstar = getWarpstar(scene, col, row, offsetX);
                        warpstar.onUpdate.add(() => {
                            warpstar.x -= speed;
                            warpstar.modified();
                        });
                        scene.append(warpstar);
                        colArr.push(warpstar);
                        break;

                }
            }
            arr.push(colArr);
        }

        return arr;
    }

    scene.onLoad.add(() => {
        // background (for tap event)
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
            if (isGameOver) {
                g.game.popScene();
                return;
            }
            console.error("!!!!!!!!!! JUMP !!!!!!!!!!");
            if (isHittingFloor) {
              jumpVel = -16;
            }
        });

        scene.append(backgroundRect);

        // course (stage)
        const course: number[][] = createCourse1();
        const courseObjects = createCourse(currentCourse, course, 0);

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
            // GAMEOVER
            if (player.x + PLAYER_WIDTH < 0 || player.y > g.game.height) {
                if (!isGameOver) {
                    const gameoverLabel = getLabel(scene, 32, 'GAMEOVER', 100, g.game.height / 2 - 100);
                    scene.append(gameoverLabel);
                }
                isGameOver = true;
                return;
            }

            runCount++;
            canFall = true;
            isHittingWall = false;
            isHittingFloor = false;
            var isHit = false;
            // 5秒で走る速度がひとつ速くなる
            if (runCount > SPEEDUP_FRAME_COUNT) {
                if (speed < MAX_SPEED) {
                    speed++;
                }
                runCount = 0;
            }

            runningDistance += speed;
            lifeTime++;


            var isGotWarpstar = false;
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
                        switch (courseObjects[row][col].tag) {
                            case TAG_YU:
                                courseObjects[row][col].destroy();
                                courseObjects[row][col] = null;
                                break;

                            case TAG_WARPSTAR:
                                courseObjects[row][col].destroy();
                                courseObjects[row][col] = null;
                                isGotWarpstar = true;
                                break;
                        }
                        continue;
                    }

                    // hit check to wall
                    if (Collision.isHitWall(
                        player.x,
                        player.y,
                        PLAYER_WIDTH,
                        PLAYER_HEIGHT,
                        courseObjects[row][col].x,
                        courseObjects[row][col].y + 10,
                        RECTANGLE_SIZE,
                        RECTANGLE_SIZE
                    )) {
                        isHittingWall = true;
                        continue;
                    }

                    // hit check to floor
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

            if (isGotWarpstar) {
                // update flags
                isGotWarpstar = false;
                currentCourse++;

                // create label
                const labelStage1 = getScrollLabel(scene, 'STAGE ' + currentCourse);
                scene.append(labelStage1);

                // create course
                const maxRow = courseObjects.length - 1;
                const maxCol = courseObjects[maxRow].length - 1;
                const nextAreaX = courseObjects[maxRow][maxCol].x + RECTANGLE_SIZE + 1;

                const nextCourse: number[][] = createCourse1();
                const nextCourseObjects = createCourse(currentCourse, nextCourse, nextAreaX);

                for (var row = 0; row < nextCourseObjects.length; row++) {
                    for (var col = 0; col < nextCourseObjects[row].length; col++) {
                        courseObjects[row].push(nextCourseObjects[row][col]);
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
                //if (speed > 2) {
                //    speed -= 0.2;
                //}
                player.x += -1 * speed;
            } else if (player.x < 200) {
                player.x += 2;
            }

            player.modified();
        });

        scene.append(player);
        player.start();

        // top-left HUD
        const lifeTimeLabel = getLabel(scene, 16, 'LIFETIME: ' + lifeTime, 10, 10);
        lifeTimeLabel.onUpdate.add(() => {
            lifeTimeLabel.text = 'LIFETIME: ' + lifeTime;
            lifeTimeLabel.invalidate();
        });
        scene.append(lifeTimeLabel);

        const runningDistanceLabel = getLabel(scene, 16, 'DISTANCE: ' + runningDistance, 10, 30);
        runningDistanceLabel.onUpdate.add(() => {
            runningDistanceLabel.text = 'DISTANCE: ' + runningDistance;
            runningDistanceLabel.invalidate();
        });
        scene.append(runningDistanceLabel);

        const labelStage1 = getScrollLabel(scene, 'STAGE 1');
        scene.append(labelStage1);

    });

    return scene;
}


export default createGameScene;
